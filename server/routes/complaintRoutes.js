const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDatabase } = require('../db/database');
const { moderateComplaint } = require('../services/aiModerator');
const { authenticateToken } = require('../middleware/authMiddleware');

// Configure Multer for optional attachment uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper: Generate unique Complaint ID (e.g. VRT-2026-04821)
function generateComplaintNumber() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `VRT-${year}-${randomNum}`;
}

// GET /api/complaints/departments - Public department list
router.get('/departments', async (req, res) => {
  try {
    const db = await getDatabase();
    const departments = await db.all('SELECT * FROM departments ORDER BY name ASC');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments.' });
  }
});

// POST /api/complaints/submit - Anonymous Student Submission
router.post('/submit', upload.single('attachment'), async (req, res) => {
  try {
    const { category, department_id, preferred_authority, description } = req.body;

    if (!category || !department_id || !description || description.trim().length < 10) {
      return res.status(400).json({ 
        error: 'Please fill out all required fields. Description must be at least 10 characters.' 
      });
    }

    const db = await getDatabase();

    // Verify department exists
    const dept = await db.get('SELECT * FROM departments WHERE id = ?', [department_id]);
    if (!dept) {
      return res.status(400).json({ error: 'Selected department does not exist.' });
    }

    // Step 1: AI Moderation Layer
    const aiResult = await moderateComplaint(description, category);

    // If AI Rejects toxic/harmful/spam content
    if (aiResult.result === 'REJECTED') {
      return res.status(422).json({
        success: false,
        ai_status: 'REJECTED',
        flagged_categories: aiResult.flagged_categories,
        message: 'Your submission could not be processed because it contains inappropriate or harmful content. Please rewrite your complaint using respectful and factual language.',
        reason: aiResult.reason
      });
    }

    // Generate Complaint ID
    let complaintNum = generateComplaintNumber();
    let existing = await db.get('SELECT id FROM complaints WHERE complaint_num = ?', [complaintNum]);
    while (existing) {
      complaintNum = generateComplaintNumber();
      existing = await db.get('SELECT id FROM complaints WHERE complaint_num = ?', [complaintNum]);
    }

    const initialStatus = aiResult.result === 'NEEDS_REVIEW' ? 'UNDER_REVIEW' : 'NEW';
    const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Find auto-assigned user (HOD or default faculty)
    let assignedUserId = null;
    const hodUser = await db.get(
      'SELECT id FROM users WHERE department_id = ? AND role = "HOD" LIMIT 1', 
      [department_id]
    );
    if (hodUser) {
      assignedUserId = hodUser.id;
    } else {
      const anyStaff = await db.get('SELECT id FROM users WHERE role = "PRINCIPAL" LIMIT 1');
      if (anyStaff) assignedUserId = anyStaff.id;
    }

    // Insert complaint (Anonymity guaranteed: No student identity stored!)
    const result = await db.run(
      `INSERT INTO complaints (complaint_num, category, department_id, preferred_authority, description, attachment_url, status, assigned_to_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [complaintNum, category, department_id, preferred_authority || 'ANY', description, attachmentUrl, initialStatus, assignedUserId]
    );

    const complaintId = result.lastID;

    // Insert AI Moderation Log
    await db.run(
      `INSERT INTO ai_moderation_logs (complaint_id, result, flagged_categories, confidence_score, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [complaintId, aiResult.result, aiResult.flagged_categories, aiResult.confidence, aiResult.reason]
    );

    // Insert Initial Progress Log
    await db.run(
      `INSERT INTO complaint_updates (complaint_id, updated_by_role, updated_by_name, status, message)
       VALUES (?, 'SYSTEM', 'Verita AI Engine', ?, ?)`,
      [
        complaintId,
        initialStatus,
        aiResult.result === 'APPROVED' 
          ? 'Complaint passed AI moderation successfully and has been routed to the relevant college authority.'
          : 'Complaint requires additional human review due to potentially sensitive content and has been routed to administration.'
      ]
    );

    res.status(201).json({
      success: true,
      complaint_id: complaintNum,
      ai_status: aiResult.result,
      message: 'Your complaint has been submitted successfully.',
      tracking_instruction: 'Please save this Complaint ID to track your complaint.',
      ai_feedback: aiResult.reason
    });

  } catch (error) {
    console.error('Complaint submission error:', error);
    res.status(500).json({ error: 'Failed to process complaint submission.' });
  }
});

// GET /api/complaints/track/:complaintNum - Anonymous Public Tracking
router.get('/track/:complaintNum', async (req, res) => {
  try {
    const { complaintNum } = req.params;
    const db = await getDatabase();

    const complaint = await db.get(
      `SELECT c.id, c.complaint_num, c.category, c.preferred_authority, c.description, c.attachment_url, c.status, c.created_at, c.updated_at,
              d.name as department_name, d.code as department_code,
              u.name as assigned_to_name, u.role as assigned_to_role
       FROM complaints c
       LEFT JOIN departments d ON c.department_id = d.id
       LEFT JOIN users u ON c.assigned_to_user_id = u.id
       WHERE c.complaint_num = ?`,
      [complaintNum.trim().toUpperCase()]
    );

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint ID not found. Please verify the ID format (e.g. VRT-2026-00101).' });
    }

    const aiLog = await db.get(
      'SELECT result, flagged_categories, confidence_score, reason, analyzed_at FROM ai_moderation_logs WHERE complaint_id = ? ORDER BY id DESC LIMIT 1',
      [complaint.id]
    );

    const updates = await db.all(
      'SELECT updated_by_role, updated_by_name, status, message, timestamp FROM complaint_updates WHERE complaint_id = ? ORDER BY timestamp ASC',
      [complaint.id]
    );

    res.json({
      complaint: {
        complaint_num: complaint.complaint_num,
        category: complaint.category,
        department_name: complaint.department_name,
        department_code: complaint.department_code,
        preferred_authority: complaint.preferred_authority,
        description: complaint.description,
        attachment_url: complaint.attachment_url,
        status: complaint.status,
        assigned_to_role: complaint.assigned_to_role,
        created_at: complaint.created_at,
        updated_at: complaint.updated_at
      },
      ai_moderation: aiLog,
      timeline: updates
    });
  } catch (error) {
    console.error('Tracking fetch error:', error);
    res.status(500).json({ error: 'Failed to retrieve complaint tracking details.' });
  }
});

// GET /api/complaints/dashboard - Role-based filtered list
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { role, department_id, id: userId } = req.user;
    const { status, category, search, department } = req.query;
    const db = await getDatabase();

    let query = `
      SELECT c.*, d.name as department_name, d.code as department_code,
             u.name as assigned_to_name, u.role as assigned_to_role,
             ai.result as ai_result, ai.reason as ai_reason
      FROM complaints c
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN users u ON c.assigned_to_user_id = u.id
      LEFT JOIN ai_moderation_logs ai ON ai.complaint_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Role Filtering logic
    if (role === 'FACULTY') {
      query += ` AND c.assigned_to_user_id = ?`;
      params.push(userId);
    } else if (role === 'HOD') {
      query += ` AND (c.department_id = ? OR c.assigned_to_user_id = ?)`;
      params.push(department_id, userId);
    }
    // PRINCIPAL & CEO see all complaints across departments

    if (status && status !== 'ALL') {
      query += ` AND c.status = ?`;
      params.push(status);
    }

    if (category && category !== 'ALL') {
      query += ` AND c.category = ?`;
      params.push(category);
    }

    if (department && department !== 'ALL') {
      query += ` AND c.department_id = ?`;
      params.push(department);
    }

    if (search) {
      query += ` AND (c.complaint_num LIKE ? OR c.description LIKE ? OR c.category LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ` ORDER BY c.created_at DESC`;

    const complaints = await db.all(query, params);
    
    // Fetch faculty members for assignment dropdowns
    const facultyList = await db.all(
      `SELECT u.id, u.name, u.role, u.faculty_id, d.name as department_name 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       WHERE u.role IN ('FACULTY', 'HOD', 'PRINCIPAL')`
    );

    res.json({ complaints, facultyList });
  } catch (error) {
    console.error('Dashboard complaints error:', error);
    res.status(500).json({ error: 'Failed to load dashboard complaints.' });
  }
});

// PUT /api/complaints/:id/status - Update Status & Log Response
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;
    const { name: userName, role: userRole } = req.user;

    if (!status || !message) {
      return res.status(400).json({ error: 'Status and official update message are required.' });
    }

    const db = await getDatabase();
    const complaint = await db.get('SELECT * FROM complaints WHERE id = ?', [id]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    // Update status & timestamp
    await db.run(
      'UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    // Insert update history record
    await db.run(
      `INSERT INTO complaint_updates (complaint_id, updated_by_role, updated_by_name, status, message)
       VALUES (?, ?, ?, ?, ?)`,
      [id, userRole, userName, status, message]
    );

    res.json({ message: 'Complaint status updated successfully.', new_status: status });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update complaint status.' });
  }
});

// PUT /api/complaints/:id/assign - Assign to Faculty or Escalate
router.put('/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to_user_id, escalate_to_role, note } = req.body;
    const { name: userName, role: userRole } = req.user;

    const db = await getDatabase();
    const complaint = await db.get('SELECT * FROM complaints WHERE id = ?', [id]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    let targetUserName = 'Authority';
    if (assigned_to_user_id) {
      const assignedUser = await db.get('SELECT name FROM users WHERE id = ?', [assigned_to_user_id]);
      if (assignedUser) targetUserName = assignedUser.name;
    }

    const newEscalatedRole = escalate_to_role || complaint.escalated_to_role;

    await db.run(
      `UPDATE complaints 
       SET assigned_to_user_id = ?, escalated_to_role = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [assigned_to_user_id || complaint.assigned_to_user_id, newEscalatedRole, id]
    );

    const actionText = escalate_to_role 
      ? `Escalated complaint to ${escalate_to_role}. ${note || ''}`
      : `Assigned complaint to ${targetUserName}. ${note || ''}`;

    await db.run(
      `INSERT INTO complaint_updates (complaint_id, updated_by_role, updated_by_name, status, message)
       VALUES (?, ?, ?, ?, ?)`,
      [id, userRole, userName, complaint.status, actionText]
    );

    res.json({ message: 'Complaint assignment updated successfully.' });
  } catch (error) {
    console.error('Assignment error:', error);
    res.status(500).json({ error: 'Failed to update assignment.' });
  }
});

module.exports = router;
