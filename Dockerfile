FROM php:8.2-apache

# Copia el proyecto al servidor web
COPY . /var/www/html/

# Habilita PDO para MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Habilita mod_rewrite
RUN a2enmod rewrite