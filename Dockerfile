FROM php:8.2-apache

# Instalar extensiones necesarias
RUN docker-php-ext-install pdo pdo_mysql

# Desactivar TODOS los MPM explícitamente
RUN a2dismod mpm_event || true
RUN a2dismod mpm_worker || true
RUN a2dismod mpm_prefork || true

# Limpiar configs activas
RUN rm -f /etc/apache2/mods-enabled/mpm_*.load || true
RUN rm -f /etc/apache2/mods-enabled/mpm_*.conf || true

# Forzar SOLO prefork en mods-available
RUN a2enmod mpm_prefork

# Habilita mod_rewrite 
RUN a2enmod rewrite

# Copia el proyecto al servidor web
COPY . /var/www/html/