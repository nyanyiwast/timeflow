const express = require('express');
const router = express.Router();
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const logger = require('../config/logger');
const axios = require('axios');
const verifyToken = require('../middleware/auth');
const faceService = require('../services/faceService');

// Validation schemas
const registerSchema = Joi.object({
  ecNumber: Joi.string().alphanum().min(1).max(50).required(),
  name: Joi.string().min(1).max(255).required(),
  password: Joi.string().min(6).required(),
  departmentId: Joi.number().integer().positive().required(),
  imageBase64: Joi.string().optional().description('Base64 encoded image for facial recognition')
});

const adminEmployeeSchema = Joi.object({
  ecNumber: Joi.string().alphanum().min(1).max(50).required(),
  name: Joi.string().min(1).max(255).required(),
  password: Joi.string().min(6).required(),
  departmentId: Joi.number().integer().positive().required(),
  role: Joi.string().valid('employee', 'admin').default('employee')
});

const updateSchema = Joi.object({
  name: Joi.string().min(1).max(255),
  departmentId: Joi.number().integer().positive()
});

const loginSchema = Joi.object({
  ecNumber: Joi.string().alphanum().min(1).max(50).required(),
  password: Joi.string().min(6).required()
});

// POST /api/employees/register
router.post('/register', async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { ecNumber, name, password, departmentId, imageBase64 } = req.body;

    // Check if employee already exists
    const [existing] = await pool.execute('SELECT ec_number FROM employees WHERE ec_number = ?', [ecNumber]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Employee already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Store profile picture if provided
    let profilePicture = null;
    let faceEncoding = null;
    if (imageBase64) {
      try {
        // Store base64 string (without data URL prefix) for profile picture
        profilePicture = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

        // Attempt face enrollment
        const { descriptor } = await faceService.enroll(ecNumber, imageBase64);
        faceEncoding = Buffer.from(JSON.stringify(descriptor)); // Store as Buffer for LONGBLOB
        logger.info(`Face enrollment successful for employee ${ecNumber}`);
      } catch (faceErr) {
        logger.error('Face enrollment failed for %s: %s', ecNumber, faceErr.message);
        // Still store profile picture even if face enrollment fails
        if (imageBase64) {
          profilePicture = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        }
        faceEncoding = null;
      }
    } else {
      logger.info(`No image provided for employee ${ecNumber}, skipping face enrollment`);
    }

    // Check if department exists
    const [dept] = await pool.execute('SELECT id FROM departments WHERE id = ?', [departmentId]);
    if (dept.length === 0) {
      return res.status(400).json({ error: 'Invalid department ID' });
    }

    // Insert into DB
    await pool.execute(
      'INSERT INTO employees (ec_number, name, password, department_id, profile_picture, face_encoding, role) VALUES (?, ?, ?, ?, ?, ?, "employee")',
      [ecNumber, name, hashedPassword, departmentId, profilePicture, faceEncoding]
    );

    res.status(201).json({
      message: 'Employee registered successfully',
      ecNumber
    });
  } catch (err) {
    logger.error('Registration error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/employees/admin - Admin only endpoint to add employees
router.post('/admin', require('../middleware/verifyAdmin'), async (req, res) => {
  try {
    const { error } = adminEmployeeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { ecNumber, name, password, departmentId, role } = req.body;

    // Check if employee already exists
    const [existing] = await pool.execute('SELECT ec_number FROM employees WHERE ec_number = ?', [ecNumber]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Employee already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Check if department exists
    const [dept] = await pool.execute('SELECT id FROM departments WHERE id = ?', [departmentId]);
    if (dept.length === 0) {
      return res.status(400).json({ error: 'Invalid department ID' });
    }

    // Insert into DB
    await pool.execute(
      'INSERT INTO employees (ec_number, name, password, department_id, role) VALUES (?, ?, ?, ?, ?)',
      [ecNumber, name, hashedPassword, departmentId, role]
    );

    res.status(201).json({
      message: 'Employee added successfully',
      ecNumber
    });
  } catch (err) {
    logger.error('Admin add employee error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/employees/login
router.post('/login', async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { ecNumber, password } = req.body;

    // Find employee
    const [rows] = await pool.execute('SELECT * FROM employees WHERE ec_number = ?', [ecNumber]);
    if (rows.length === 0) {
      logger.warn('Login attempt with invalid ecNumber: %s', ecNumber);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const employee = rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, employee.password.toString());
    if (!validPassword) {
      logger.warn('Login attempt with invalid password for ecNumber: %s', ecNumber);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ ecNumber: employee.ec_number }, process.env.JWT_SECRET, { expiresIn: '1h' });

    logger.info('Login successful for employee: %s', ecNumber);

    res.json({
      message: 'Login successful',
      token,
      employee: {
        ecNumber: employee.ec_number,
        name: employee.name,
        departmentId: employee.department_id,
        role: employee.role
      }
    });
  } catch (err) {
    logger.error('Login error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/employees/:ecNumber
router.get('/:ecNumber', async (req, res) => {
  try {
    const { ecNumber } = req.params;

    // Fetch from DB
    const [rows] = await pool.execute(`
      SELECT e.*, d.name as department_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.ec_number = ?
    `, [ecNumber]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = rows[0];
    logger.info('Fetched employee data for: %s', ecNumber);

    res.json({
      ecNumber: employee.ec_number,
      name: employee.name,
      departmentId: employee.department_id,
      departmentName: employee.department_name,
      role: employee.role,
      profilePicture: employee.profile_picture || null,
      faceEncoding: employee.face_encoding ? employee.face_encoding.toString('base64') : null // Convert binary to base64 if needed
    });
  } catch (err) {
    logger.error('Error fetching employee', { ecNumber, error: err });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/employees/:ecNumber
router.put('/:ecNumber', async (req, res) => {
  try {
    const { error } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { ecNumber } = req.params;

    // TODO: Update in DB
    res.json({ 
      message: 'Employee updated successfully',
      ecNumber 
    });
  } catch (err) {
    logger.error('Error updating employee', { ecNumber, error: err });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/employees/:ecNumber
router.delete('/:ecNumber', async (req, res) => {
  try {
    const { ecNumber } = req.params;

    // TODO: Delete from DB, remove face encoding
    res.json({ 
      message: 'Employee deleted successfully',
      ecNumber 
    });
  } catch (err) {
    logger.error('Error deleting employee', { ecNumber, error: err });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;