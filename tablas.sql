CREATE TABLE proveedores (
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



