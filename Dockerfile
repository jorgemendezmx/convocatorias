FROM php:8.2-apache

# Instalar extensiones necesarias
RUN docker-php-ext-install pdo pdo_mysql

# Eliminar todos los MPM y dejar solo prefork
RUN rm -f /etc/apache2/mods-enabled/mpm_*.load \
    && rm -f /etc/apache2/mods-enabled/mpm_*.conf \
    && a2enmod mpm_prefork

# Habilita mod_rewrite 
RUN a2enmod rewrite

# Copia el proyecto al servidor web
COPY . /var/www/html/