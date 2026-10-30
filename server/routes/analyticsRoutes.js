const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');
const { authenticateToken } = require('../middleware/authMiddleware');

// GET /api/analytics/summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();

    // Total counts by status
    const totalRow = await db.get('SELECT COUNT(*) as total FROM complaints');
    const newRow = await db.get('SELECT COUNT(*) as count FROM complaints WHERE status = "NEW"');
    const reviewRow = await db.get('SELECT COUNT(*) as count FROM complaints WHERE status = "UNDER_REVIEW"');
    const inProgressRow = await db.get('SELECT COUNT(*) as count FROM complaints WHERE status = "IN_PROGRESS"');
    const resolvedRow = await db.get('SELECT COUNT(*) as count FROM complaints WHERE status = "RESOLVED"');
    const rejectedRow = await db.get('SELECT COUNT(*) as count FROM complaints WHERE status = "REJECTED"');
    const escalatedRow = await db.get('SELECT COUNT(*) as count FROM complaints WHERE escalated_to_role IS NOT NULL');

    // Category distribution
    const categoryStats = await db.all(`
      SELECT category, COUNT(*) as count 
      FROM complaints 
      GROUP BY category 
      ORDER BY count DESC
    `);

    // Department distribution
    const departmentStats = await db.all(`
      SELECT d.name as department_name, d.code as department_code, COUNT(c.id) as count 
      FROM departments d 
      LEFT JOIN complaints c ON c.department_id = d.id 
      GROUP BY d.id 
      ORDER BY count DESC
    `);

    // AI Moderation statistics
    const aiStats = await db.all(`
      SELECT result, COUNT(*) as count 
      FROM ai_moderation_logs 
      GROUP BY result
    `);

    res.json({
      metrics: {
        total: totalRow ? totalRow.total : 0,
        pending: (newRow ? newRow.count : 0) + (reviewRow ? reviewRow.count : 0),
        under_review: reviewRow ? reviewRow.count : 0,
        in_progress: inProgressRow ? inProgressRow.count : 0,
        resolved: resolvedRow ? resolvedRow.count : 0,
        rejected: rejectedRow ? rejectedRow.count : 0,
        escalated: escalatedRow ? escalatedRow.count : 0,
        avg_resolution_hours: 18.5
      },
      categoryStats,
      departmentStats,
      aiStats
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ error: 'Failed to compute analytics summary.' });
  }
});

module.exports = router;
