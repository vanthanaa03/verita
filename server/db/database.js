const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

let dbInstance = null;

async function getDatabase() {
  if (dbInstance) return dbInstance;

  const dbPath = path.join(__dirname, '..', 'verita.db');
  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await dbInstance.run('PRAGMA foreign_keys = ON');

  await initializeDatabase(dbInstance);
  return dbInstance;
}

async function initializeDatabase(db) {
  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT CHECK (role IN ('FACULTY', 'HOD', 'PRINCIPAL', 'CEO')) NOT NULL,
      department_id INTEGER,
      faculty_id TEXT UNIQUE,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_num TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      department_id INTEGER NOT NULL,
      preferred_authority TEXT DEFAULT 'ANY',
      description TEXT NOT NULL,
      attachment_url TEXT,
      status TEXT CHECK (status IN ('NEW', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')) DEFAULT 'NEW',
      assigned_to_user_id INTEGER,
      escalated_to_role TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id),
      FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS ai_moderation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER NOT NULL,
      result TEXT CHECK (result IN ('APPROVED', 'NEEDS_REVIEW', 'REJECTED')) NOT NULL,
      flagged_categories TEXT,
      confidence_score REAL DEFAULT 0.95,
      reason TEXT,
      analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS complaint_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER NOT NULL,
      updated_by_role TEXT NOT NULL,
      updated_by_name TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
    );
  `);

  // Check if seed data exists
  const deptCount = await db.get('SELECT COUNT(*) as count FROM departments');
  if (deptCount.count === 0) {
    console.log('🌱 Seeding initial departments, users, and demo complaints...');
    await seedInitialData(db);
  }
}

async function seedInitialData(db) {
  // Insert Departments
  const depts = [
    { name: 'Computer Science & Engineering', code: 'CSE' },
    { name: 'Electronics & Communication', code: 'ECE' },
    { name: 'Mechanical Engineering', code: 'MECH' },
    { name: 'Civil Engineering', code: 'CIVIL' },
    { name: 'Business Administration', code: 'MBA' },
    { name: 'Hostel & General Administration', code: 'GEN' }
  ];

  for (const d of depts) {
    await db.run('INSERT INTO departments (name, code) VALUES (?, ?)', [d.name, d.code]);
  }

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // Insert Users
  const users = [
    {
      name: 'Dr. Alan Turing',
      email: 'faculty1@verita.edu',
      password_hash: defaultPasswordHash,
      role: 'FACULTY',
      department_id: 1,
      faculty_id: 'FAC-101'
    },
    {
      name: 'Prof. Grace Hopper',
      email: 'faculty2@verita.edu',
      password_hash: defaultPasswordHash,
      role: 'FACULTY',
      department_id: 2,
      faculty_id: 'FAC-102'
    },
    {
      name: 'Dr. Robert (CSE HOD)',
      email: 'hod_cse@verita.edu',
      password_hash: defaultPasswordHash,
      role: 'HOD',
      department_id: 1,
      faculty_id: 'HOD-CSE'
    },
    {
      name: 'Dr. Sarah (ECE HOD)',
      email: 'hod_ece@verita.edu',
      password_hash: defaultPasswordHash,
      role: 'HOD',
      department_id: 2,
      faculty_id: 'HOD-ECE'
    },
    {
      name: 'Dr. Elizabeth Vance (Principal)',
      email: 'principal@verita.edu',
      password_hash: defaultPasswordHash,
      role: 'PRINCIPAL',
      department_id: null,
      faculty_id: 'PRIN-001'
    },
    {
      name: 'Mr. Alexander Wright (CEO)',
      email: 'ceo@verita.edu',
      password_hash: defaultPasswordHash,
      role: 'CEO',
      department_id: null,
      faculty_id: 'CEO-001'
    }
  ];

  for (const u of users) {
    await db.run(
      `INSERT INTO users (name, email, password_hash, role, department_id, faculty_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [u.name, u.email, u.password_hash, u.role, u.department_id, u.faculty_id]
    );
  }

  // Insert Sample Complaints
  const sampleComplaints = [
    {
      complaint_num: 'VRT-2026-00101',
      category: 'Academic Issues',
      department_id: 1,
      preferred_authority: 'FACULTY',
      description: 'Internal marks for Web Technologies course were reduced by 5 points without any feedback or rubrics sheet provided.',
      attachment_url: null,
      status: 'IN_PROGRESS',
      assigned_to_user_id: 1,
      escalated_to_role: null
    },
    {
      complaint_num: 'VRT-2026-00102',
      category: 'Infrastructure',
      department_id: 1,
      preferred_authority: 'HOD',
      description: 'Lab 3 air conditioning unit is broken, causing desktops to overheat and shut down during practical lab hours.',
      attachment_url: null,
      status: 'NEW',
      assigned_to_user_id: 3,
      escalated_to_role: null
    },
    {
      complaint_num: 'VRT-2026-00103',
      category: 'Examination',
      department_id: 2,
      preferred_authority: 'HOD',
      description: 'The upcoming end-semester timetable places Digital Signal Processing and Microcontrollers on the exact same afternoon slot.',
      attachment_url: null,
      status: 'UNDER_REVIEW',
      assigned_to_user_id: 4,
      escalated_to_role: null
    },
    {
      complaint_num: 'VRT-2026-00104',
      category: 'Hostel',
      department_id: 6,
      preferred_authority: 'PRINCIPAL',
      description: 'Mess water purifiers in Block B have not been serviced in over 3 months, leading to sanitation concerns.',
      attachment_url: null,
      status: 'RESOLVED',
      assigned_to_user_id: 5,
      escalated_to_role: null
    },
    {
      complaint_num: 'VRT-2026-00105',
      category: 'Faculty Related',
      department_id: 1,
      preferred_authority: 'PRINCIPAL',
      description: 'Multiple requests for clarification regarding project syllabus guidelines have gone unanswered for 3 weeks.',
      attachment_url: null,
      status: 'IN_PROGRESS',
      assigned_to_user_id: 5,
      escalated_to_role: 'PRINCIPAL'
    }
  ];

  for (const c of sampleComplaints) {
    const result = await db.run(
      `INSERT INTO complaints (complaint_num, category, department_id, preferred_authority, description, attachment_url, status, assigned_to_user_id, escalated_to_role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.complaint_num, c.category, c.department_id, c.preferred_authority, c.description, c.attachment_url, c.status, c.assigned_to_user_id, c.escalated_to_role]
    );

    const complaintId = result.lastID;

    // AI Log
    await db.run(
      `INSERT INTO ai_moderation_logs (complaint_id, result, flagged_categories, confidence_score, reason)
       VALUES (?, 'APPROVED', 'None', 0.98, 'Complaint is respectful, constructive, and free of abusive language or harassment.')`,
      [complaintId]
    );

    // Initial update
    await db.run(
      `INSERT INTO complaint_updates (complaint_id, updated_by_role, updated_by_name, status, message)
       VALUES (?, 'SYSTEM', 'AI Moderator', 'NEW', 'Anonymous submission verified by Verita AI and assigned to relevant authority.')`,
      [complaintId]
    );

    if (c.status === 'IN_PROGRESS') {
      await db.run(
        `INSERT INTO complaint_updates (complaint_id, updated_by_role, updated_by_name, status, message)
         VALUES (?, 'FACULTY', 'Dr. Alan Turing', 'IN_PROGRESS', 'Reviewing the course evaluation sheet with the internal examination committee.')`,
        [complaintId]
      );
    } else if (c.status === 'RESOLVED') {
      await db.run(
        `INSERT INTO complaint_updates (complaint_id, updated_by_role, updated_by_name, status, message)
         VALUES (?, 'PRINCIPAL', 'Dr. Elizabeth Vance', 'RESOLVED', 'Facilities team has completed the filter replacement and water quality test passed.')`,
        [complaintId]
      );
    }
  }

  console.log('✅ Seed data successfully inserted!');
}

module.exports = {
  getDatabase
};
