CREATE DATABASE IF NOT EXISTS timeflow_db;
USE timeflow_db;

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- Insert default department
INSERT INTO departments (name) VALUES ('Administration') ON DUPLICATE KEY UPDATE name=name;

CREATE TABLE IF NOT EXISTS employees (
  ec_number VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  department_id INT,
  profile_picture TEXT,
  face_encoding LONGBLOB,
  role ENUM('employee', 'admin') DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Insert default admin user (password: '00000000', hashed with bcrypt salt 10)
-- Note: The hash below is for 'admin'. If you change the password, regenerate the hash.
INSERT INTO employees (ec_number, name, password, department_id, profile_picture, face_encoding, role) VALUES 
('admin', 'Administrator', '$2b$10$enoWsFsWvVRj2Ng8qOH7ButuEZeMbV9my7.15b504VCPSTA32LYhu', 1, NULL, NULL, 'admin') 
ON DUPLICATE KEY UPDATE name=name, role='admin';

CREATE TABLE IF NOT EXISTS attendance_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ec_number VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  check_in_time DATETIME,
  check_out_time DATETIME,
  total_hours DECIMAL(5,2),
  is_late BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  selfie_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ec_number) REFERENCES employees(ec_number) ON DELETE CASCADE,
  UNIQUE KEY unique_attendance (ec_number, date)
);