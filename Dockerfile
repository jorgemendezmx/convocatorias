FROM php:8.2-cli

RUN apt-get update && apt-get install -y apache2 libapache2-mod-php

RUN docker-php-ext-install pdo pdo_mysql

COPY . /var/www/html/

RUN rm -rf /etc/apache2/mods-enabled/mpm_*
RUN a2enmod php8.2
RUN a2enmod rewrite

CMD ["apachectl", "-D", "FOREGROUND"]