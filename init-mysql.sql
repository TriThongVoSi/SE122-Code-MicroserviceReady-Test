CREATE DATABASE IF NOT EXISTS quanlymuavu;
CREATE DATABASE IF NOT EXISTS identity_db;
CREATE USER IF NOT EXISTS 'springuser'@'localhost' IDENTIFIED BY 'springpass';
GRANT ALL PRIVILEGES ON quanlymuavu.* TO 'springuser'@'localhost';
GRANT ALL PRIVILEGES ON identity_db.* TO 'springuser'@'localhost';
GRANT ALL PRIVILEGES ON identity_db.* TO 'springuser'@'%';
FLUSH PRIVILEGES;


