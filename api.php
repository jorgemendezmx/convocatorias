<?php
header("Content-Type: application/json");
session_start();
require_once "db.php";

// Opcional: verificar token de sesión
// if (!isset($_SESSION['token'])) { echo json_encode(['error' => 'No autorizado']); exit; }

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'cvc_read':
        $stmt = $dbconn->query("SELECT * FROM `$tblconvoc` ORDER BY id DESC");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($data);
        break;

    case 'cvc_add':
        $input = json_decode(file_get_contents("php://input"), true);

        // Quita el 'id' del conjunto JSON porque no lo requiere el INSERT (es autoincremental)
        if (isset($input['id'])) {
            unset($input['id']);
        }
        $sql = "INSERT INTO `$tblconvoc` (categoria, subcat, tema, fcierre, hcierre, responsable)
                VALUES (:categoria, :subcat, :tema, :fcierre, :hcierre, :responsable)";
        $stmt = $dbconn->prepare($sql);
        $done = $stmt->execute($input);

        if ($done) {
            // Obtiene el registro recién insertado
            $lastId = $dbconn->lastInsertId();
            $stmt2 = $dbconn->prepare("SELECT * FROM `$tblconvoc` WHERE id=:id");
            $stmt2->execute(['id' => $lastId]);
            $row = $stmt2->fetch(PDO::FETCH_ASSOC);
            // Devuelve el registro creado para visualizarlo inmediatamente
            echo json_encode(['success' => true, 'message' => 'Convocatoria agregada correctamente.', 'registro' => $row]);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se pudo agregar la convocatoria.']);
        }
        break;

    case 'cvc_update':
        $input = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE `$tblconvoc` SET 
                    categoria=:categoria,
                    subcat=:subcat,
                    tema=:tema,
                    fcierre=:fcierre,
                    hcierre=:hcierre,
                    responsable=:responsable
                WHERE id=:id";
        $stmt = $dbconn->prepare($sql);
        $done = $stmt->execute($input);

        if ($done) {
            echo json_encode(['success' => true, 'message' => 'Convocatoria actualizada correctamente.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se pudo actualizar la convocatoria.']);
        }
        break;

    case 'cvc_delete':
        $input = json_decode(file_get_contents("php://input"), true);
        $sql = "DELETE FROM `$tblconvoc` WHERE id=:id";
        $stmt = $dbconn->prepare($sql);
        $done = $stmt->execute(['id' => $input['id']]);
        if ($done) {
            echo json_encode(['success' => true, 'message' => 'Convocatoria eliminada correctamente.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar la convocatoria.']);
        }
        break;

    case 'prov_read':
        $stmt = $dbconn->query("SELECT * FROM proveedores ORDER BY id DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'prov_add':
        $input = json_decode(file_get_contents("php://input"), true);

        // Quita el 'id' del conjunto JSON porque no lo requiere el INSERT (es autoincremental)
        if (isset($input['id'])) {
            unset($input['id']);
        }
        
        $sql = "INSERT INTO proveedores (nombre_comercial, razon_social, rfc, domicilio, contacto, telefono, correo, categoria)
                VALUES (:nc, :rs, :rfc, :dom, :con, :tel, :cor, :cat)";
        $stmt = $dbconn->prepare($sql);
        $done = $stmt->execute($input);

        if ($done) {
            // Obtiene el registro recién insertado
            $lastId = $dbconn->lastInsertId();
            $stmt2 = $dbconn->prepare("SELECT * FROM `$tblprovee` WHERE id=:id");
            $stmt2->execute(['id' => $lastId]);
            $row = $stmt2->fetch(PDO::FETCH_ASSOC);
            // Devuelve el registro creado para visualizarlo inmediatamente
            echo json_encode(['success' => true, 'message' => 'Proveedor agregado correctamente.', 'registro' => $row]);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se pudo agregar el proveedor.']);
        }
        break;

    case 'prov_update':
        $input = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE proveedores SET
            nombre_comercial=:nc, razon_social=:rs, rfc=:rfc, domicilio=:dom,
            contacto=:con, telefono=:tel, correo=:cor, categoria=:cat
            WHERE id=:id";
        $stmt = $dbconn->prepare($sql);
        $done = $stmt->execute($input);

            echo json_encode(["success" => true, "message" => "Proveedor actualizado"]);
        break;

    case 'prov_delete':
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $dbconn->prepare("DELETE FROM proveedores WHERE id=:id");
        $stmt->execute([':id' => $data['id']]);
        echo json_encode(["success" => true, "message" => "Proveedor eliminado"]);
        break;

    case 'check_db':
        echo json_encode(['db_exists' => DB_EXISTS]);
        break;

    case 'create_db':
        // Crear la base de datos si no existe
        if (!DB_EXISTS) {
            $dbconn->exec("CREATE DATABASE `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        }

        $dbconn->exec("USE `$dbname`");
        $dbconn->exec("
            CREATE TABLE IF NOT EXISTS `$tblconvoc` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                categoria VARCHAR(100) NOT NULL,
                subcat VARCHAR(100) NOT NULL,
                tema VARCHAR(150) NOT NULL,
                fcierre DATE NOT NULL,
                hcierre TIME NOT NULL,
                responsable VARCHAR(100) NOT NULL
            );
        ");

        $dbconn->exec("USE `$dbname`");
        $dbconn->exec("
            CREATE TABLE IF NOT EXISTS `$tblprovee` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre_comercial VARCHAR(100) NOT NULL,
                razon_social VARCHAR(150) NOT NULL,
                rfc VARCHAR(13) NOT NULL UNIQUE,
                domicilio VARCHAR(200),
                contacto VARCHAR(100),
                telefono VARCHAR(20),
                correo VARCHAR(100),
                categoria VARCHAR(100)
            );
        ");

        // Verificar si la tabla convocatorias existe
        $stmt = $dbconn->query("SHOW TABLES LIKE '$tblconvoc'");  
        $tbl_exists = $stmt->rowCount() > 0;

        if ($tbl_exists) {
            // Cargar datos desde XML si encuentra el archivo
            $xmlFile = "convocatorias.xml"; // archivo XML adjunto en la carpeta del proyecto
            if (file_exists($xmlFile)) {
                $xml = simplexml_load_file($xmlFile);
                $stmt = $dbconn->prepare("
                    INSERT INTO `$tblconvoc` (categoria, subcat, tema, fcierre, hcierre, responsable)
                    VALUES (:categoria, :subcat, :tema, :fcierre, :hcierre, :responsable)
                ");

                $count = 0;
                foreach ($xml->convocatoria as $convocatoria) {
                    $fecha = DateTime::createFromFormat('d/m/Y', (string) $convocatoria->fcierre);
                    $fcierre = $fecha ? $fecha->format('Y-m-d') : null;

                    $stmt->execute([
                        ':categoria'   => (string) $convocatoria->categoria,
                        ':subcat'      => (string) $convocatoria->subcat,
                        ':tema'        => (string) $convocatoria->tema,
                        ':fcierre'     => $fcierre,
                        ':hcierre'     => (string) $convocatoria->hcierre,
                        ':responsable' => (string) $convocatoria->responsable
                    ]);
                    $count++;
                }
                echo json_encode(['status' => 'db_created', 'records' => count($xml->convocatoria)]);
            } else {
                echo json_encode(['status' => 'err_create', 'warning' => 'No se encontró el archivo XML']);
            }
        } else {
                echo json_encode(['status' => 'err_table', 'warning' => 'No se encontró la tabla']);
            }
        break;

        default:
        echo json_encode(['error' => 'Acción no válida']);
        break;
}
?>