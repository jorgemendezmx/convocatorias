FROM php:8.2-cli

# Instalar extensiones PDO y MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Directorio de trabajo
WORKDIR /app

# Copiar archivos del proyecto
COPY . .

# Exponer puerto usado por Railway
EXPOSE 8080

# Iniciar servidor embebido PHP
CMD ["php", "-S", "0.0.0.0:8080"]