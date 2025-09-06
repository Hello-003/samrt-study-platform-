CREATE DATABASE IF NOT EXISTS smartstudy;
USE smartstudy;
DROP TABLE IF EXISTS materials;
DROP TABLE IF EXISTS students;
CREATE TABLE students (id INT AUTO_INCREMENT PRIMARY KEY, student_id VARCHAR(50) UNIQUE, name VARCHAR(100));
CREATE TABLE materials (id INT AUTO_INCREMENT PRIMARY KEY, student_id VARCHAR(50), material TEXT,
  FOREIGN KEY (student_id) REFERENCES students(student_id));
INSERT INTO students (student_id, name) VALUES ('S1001','Soumen'),('S1002','Rahul'),('S1003','Priya');
INSERT INTO materials (student_id, material) VALUES
('S1001','Math Notes - Algebra PDF link'),
('S1001','CS Notes - Data Structures'),
('S1002','Physics Notes - Mechanics'),
('S1003','Chemistry - Organic summary');
