CREATE DATABASE IF NOT EXISTS quanlymuavu;
CREATE USER IF NOT EXISTS 'springuser'@'localhost' IDENTIFIED BY 'springpass';
GRANT ALL PRIVILEGES ON quanlymuavu.* TO 'springuser'@'localhost';
FLUSH PRIVILEGES;


