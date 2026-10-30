-- Verita - Anonymous College Grievance & Support System
-- Database Schema for MySQL / PostgreSQL / SQLite

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE
);

-- 2. USERS TABLE (Faculty, HOD, Principal, CEO)
-- Note: Student accounts do not exist to guarantee absolute anonymity.
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) CHECK (role IN ('FACULTY', 'HOD', 'PRINCIPAL', 'CEO')) NOT NULL,
  department_id INTEGER,
  faculty_id VARCHAR(50) UNIQUE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 3. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_num VARCHAR(30) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  department_id INTEGER NOT NULL,
  preferred_authority VARCHAR(50) DEFAULT 'ANY',
  description TEXT NOT NULL,
  attachment_url TEXT,
  status VARCHAR(30) CHECK (status IN ('NEW', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')) DEFAULT 'NEW',
  assigned_to_user_id INTEGER,
  escalated_to_role VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. AI MODERATION LOGS TABLE
CREATE TABLE IF NOT EXISTS ai_moderation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id INTEGER NOT NULL,
  result VARCHAR(30) CHECK (result IN ('APPROVED', 'NEEDS_REVIEW', 'REJECTED')) NOT NULL,
  flagged_categories VARCHAR(255),
  confidence_score FLOAT DEFAULT 0.95,
  reason TEXT,
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 5. COMPLAINT UPDATES TABLE (Official Responses & Status Logs)
CREATE TABLE IF NOT EXISTS complaint_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id INTEGER NOT NULL,
  updated_by_role VARCHAR(50) NOT NULL,
  updated_by_name VARCHAR(100) NOT NULL,
  status VARCHAR(30) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);
