const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { getDatabase } = require('./db/database');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for dev prototype
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    system: 'Verita Anonymous College Grievance Engine',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'An unexpected internal server error occurred.' });
});

// Initialize DB and start server
getDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`🚀 Verita Server running on http://localhost:${PORT}`);
      console.log(`🛡️  AI Moderation Engine active`);
      console.log(`🔒 Anonymous Grievance Protocol engaged`);
      console.log(`===================================================`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  });
