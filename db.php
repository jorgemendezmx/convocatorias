<?php
// declaramos las variables de conexión a la BD
$host = "localhost";
$user = "root";         // mi usuario y contrasela está personalizado
$pass = "copernico";     // cambiar para que funcione en su servicio local
$dbname = "convocatorias_db";
$tblconvoc = "convocatorias";
$tblprovee = "proveedores";

try {
    $dbconn = new PDO("mysql:host=$host;charset=utf8", $user, $pass);
    $dbconn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

     // Verificar si la base existe
    $stmt = $dbconn->query("SHOW DATABASES LIKE '$dbname'");
    $db_exists = $stmt->rowCount() > 0;

    if (!$db_exists) {
        define("DB_EXISTS", false);    // Base no existe aún
    } else {
        $dbconn->query("USE $dbname"); // Base existe, conectar normalmente
        define("DB_EXISTS", true);    
    }
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(["error" => "Error de conexión: " . $e->getMessage()]);
    exit;
}
?>