<?php
// declaramos las variables de conexión a la BD
$host = "sql112.infinityfree.com";
$user = "if0_41907700";         // mi usuario y contraseña está personalizado
$pass = "m19changoS";     // cambiar para que funcione en su servicio local
$dbname = "if0_41907700_convocatorias_db";
$tblconvoc = "convocatorias";
$tblprovee = "proveedores";

try {
    $dbconn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $dbconn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

     // Verificar si la base existe
    //$stmt = $dbconn->query("SHOW DATABASES LIKE '$dbname'");
    //$db_exists = $stmt->rowCount() > 0;

    //if (!$db_exists) {
    //    define("DB_EXISTS", false);    // Base no existe aún
    //} else {
    //    $dbconn->query("USE $dbname"); // Base existe, conectar normalmente
    //    define("DB_EXISTS", true);    
    //}
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(["error" => "Error de conexión: " . $e->getMessage()]);
    exit;
}
?>