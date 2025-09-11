const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/reports/daily - Daily attendance for all employees
router.get('/daily', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await pool.execute(`
      SELECT ar.ec_number, e.name, ar.check_in_time, ar.check_out_time, ar.total_hours, ar.is_late
      FROM attendance_records ar
      JOIN employees e ON ar.ec_number = e.ec_number
      WHERE ar.date = ?
      ORDER BY ar.check_in_time
    `, [today]);

    res.json({
      date: today,
      records: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/employee/:ecNumber - Attendance history for single employee
router.get('/employee/:ecNumber', async (req, res) => {
  try {
    const { ecNumber } = req.params;
    const [rows] = await pool.execute(`
      SELECT date, check_in_time, check_out_time, total_hours, is_late
      FROM attendance_records
      WHERE ec_number = ?
      ORDER BY date DESC, check_in_time DESC
      LIMIT 30
    `, [ecNumber]);

    res.json({
      ecNumber,
      records: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/lateness - Report for late arrivals today
router.get('/lateness', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await pool.execute(`
      SELECT ar.ec_number, e.name, ar.check_in_time, ar.is_late
      FROM attendance_records ar
      JOIN employees e ON ar.ec_number = e.ec_number
      WHERE ar.date = ? AND ar.is_late = 1
      ORDER BY ar.check_in_time
    `, [today]);

    res.json({
      date: today,
      lateRecords: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;