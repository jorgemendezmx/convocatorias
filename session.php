<?php
session_start();

if (!isset($_SESSION['token'])) {
    $_SESSION['token'] = bin2hex(random_bytes(16)); // genera un token único
}

echo json_encode(['token' => $_SESSION['token']]);
?>