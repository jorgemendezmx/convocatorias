FROM php:8.2-apache

# Instala extensiones necesarias
RUN docker-php-ext-install pdo pdo_mysql

# Desactiva MPM conflictivos y deja prefork
RUN a2dismod mpm_event mpm_worker || true
RUN a2enmod mpm_prefork

# Habilita mod_rewrite 
RUN a2enmod rewrite

# Copia el proyecto al servidor web
COPY . /var/www/html/