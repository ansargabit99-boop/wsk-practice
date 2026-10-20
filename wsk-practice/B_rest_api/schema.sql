CREATE DATABASE IF NOT EXISTS library CHARACTER SET utf8mb4;
USE library;
DROP TABLE IF EXISTS loans, tokens, books, users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,   -- plain here for practice; hash it in your solution
  name VARCHAR(100) NOT NULL,
  role ENUM('admin','user') NOT NULL DEFAULT 'user'
);
CREATE TABLE tokens (
  token VARCHAR(64) PRIMARY KEY,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(100) NOT NULL,
  isbn VARCHAR(20) UNIQUE NOT NULL,
  copies INT NOT NULL DEFAULT 1
);
CREATE TABLE loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  loaned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  returned_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);
INSERT INTO users (email,password,name,role) VALUES
 ('admin@lib.kz','admin123','Admin','admin'),
 ('user@lib.kz','user123','Aigerim','user');
INSERT INTO books (title,author,isbn,copies) VALUES
 ('Abai Zholy','Mukhtar Auezov','978-0-00-000001',3),
 ('Clean Code','Robert C. Martin','978-0-13-235088',2),
 ('The Pragmatic Programmer','Hunt & Thomas','978-0-13-595705',1),
 ('Eloquent JavaScript','Marijn Haverbeke','978-1-59327-950',4),
 ('You Dont Know JS','Kyle Simpson','978-1-49195-000',2);
INSERT INTO loans (user_id,book_id) VALUES (2,3);
