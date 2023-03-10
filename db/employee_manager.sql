DROP DATABASE IF EXISTS employeemanager_db;
CREATE DATABASE employeemanager_db;

USE employeemanager_db;

CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30)  NULL,
  salary DECIMAL  NULL,
  department_id INT NULL,
  PRIMARY KEY(id)
);
CREATE TABLE employee(
 id INT NOT NULL AUTO_INCREMENT,
 first_name VARCHAR(30) NULL,
 last_name VARCHAR(30)  NULL,
 role_id INT NULL,
 manager_id INT NULL,
 PRIMARY KEY(id)
 );
