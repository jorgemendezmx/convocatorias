FROM php:8.2-cli

# Instalar extensiones necesarias
RUN docker-php-ext-install pdo pdo_mysql

# Directorio de trabajo
WORKDIR /app

# Copiar proyecto
COPY . .

# Exponer puerto Railway
EXPOSE 8080

# Iniciar servidor PHP correctamente
CMD php -S 0.0.0.0:8080 -t /app