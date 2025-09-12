const express = require('express');
const router = express.Router();
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const pool = require('../config/db');
const logger = require('../config/logger');
const verifyToken = require('../middleware/auth');
const faceService = require('../services/faceService');

// Validation schemas
const registerSchema = Joi.object({
 ecNumber: Joi.string().alphanum().min(1).max(50).required(),
 name: Joi.string().min(1).max(255).required(),
 password: Joi.string().min(6).required(),
 departmentId: Joi.number().integer().positive().required(),
 imageBase64: Joi.string().required().description('Base64 encoded image for facial recognition')
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
// Helper function to check and add profile_picture column if it doesn't exist
async function ensureProfilePictureColumn(connection) {
  try {
    // Check if the column exists
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM employees LIKE 'profile_picture'"
    );
    
    // If column doesn't exist, add it
    if (columns.length === 0) {
      await connection.execute(
        'ALTER TABLE employees ADD COLUMN profile_picture LONGTEXT AFTER department_id'
      );
      logger.info('Added profile_picture column to employees table');
    }
  } catch (error) {
    logger.error('Error ensuring profile_picture column: %s', error.message);
    // Don't fail the request for this error
  }
}

router.post('/register', async (req, res) => {
  let connection;
  try {
    // Validate request body
    const { error } = registerSchema.validate(req.body);
    if (error) {
      logger.warn('Validation error: %s', error.details[0].message);
      return res.status(400).json({ 
        error: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }

    const { ecNumber, name, password, departmentId, imageBase64 } = req.body;
    
    // Get a connection from the pool
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Ensure profile_picture column exists
    await ensureProfilePictureColumn(connection);

    // Check if employee already exists
    const [existing] = await connection.execute(
      'SELECT ec_number FROM employees WHERE ec_number = ?', 
      [ecNumber]
    );
    
    if (existing.length > 0) {
      logger.warn('Registration attempt with existing EC number: %s', ecNumber);
      return res.status(409).json({ 
        error: 'Employee with this EC number already exists',
        code: 'DUPLICATE_EMPLOYEE'
      });
    }

    // Check if department exists
    const [dept] = await connection.execute(
      'SELECT id FROM departments WHERE id = ?', 
      [departmentId]
    );
      
    if (dept.length === 0) {
      logger.warn('Invalid department ID: %s', departmentId);
      return res.status(400).json({ 
        error: 'Invalid department ID',
        code: 'INVALID_DEPARTMENT'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    let faceEncoding = null;

    try {
      // Enroll face if image is provided
      if (imageBase64) {
        const result = await faceService.enroll(ecNumber, imageBase64);
        if (result.descriptor) {
          faceEncoding = JSON.stringify(result.descriptor);
          logger.info(`Face enrollment successful for employee ${ecNumber}`);
        } else {
          logger.info('Face recognition not available, continuing without face enrollment');
        }
      }

      // Insert into DB
      await connection.execute(
        'INSERT INTO employees (ec_number, name, password, department_id, face_encoding, profile_picture) VALUES (?, ?, ?, ?, ?, ?)',
        [ecNumber, name, hashedPassword, departmentId, faceEncoding, imageBase64]
      );

      await connection.commit();
      
      logger.info(`Employee ${ecNumber} registered successfully`);
      res.status(201).json({
        message: 'Employee registered successfully',
        ecNumber,
        hasFaceEnrollment: !!faceEncoding
      });
      
    } catch (faceErr) {
      await connection.rollback();
      logger.error('Registration failed for %s: %s', ecNumber, faceErr.message);
      
      let statusCode = 500;
      let errorMessage = 'Registration failed';
      let errorCode = 'REGISTRATION_ERROR';
      
      // Handle specific face enrollment errors
      if (faceErr.message.includes('Face enrollment failed')) {
        statusCode = 400;
        errorMessage = faceErr.message.replace('Face enrollment failed: ', '');
        errorCode = 'FACE_ENROLLMENT_ERROR';
      }
      
      res.status(statusCode).json({
        error: errorMessage,
        code: errorCode,
        details: process.env.NODE_ENV === 'development' ? faceErr.message : undefined
      });
    }
  } catch (err) {
    if (connection) await connection.rollback();
    logger.error('Unexpected registration error: %s', err.message);
    logger.error(err.stack);
    
    res.status(500).json({
      error: 'An unexpected error occurred during registration',
      code: 'INTERNAL_SERVER_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  } finally {
    if (connection) connection.release();
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
    const validPassword = await bcrypt.compare(password, employee.password);
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
        departmentId: employee.department_id
      }
    });
  } catch (err) {
    logger.error('Login error for %s: %s', ecNumber, err.message);
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
      faceEncoding: employee.face_encoding ? employee.face_encoding.toString('base64') : null // Convert binary to base64 if needed
    });
  } catch (err) {
    logger.error('Error fetching employee %s: %s', ecNumber, err.message);
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;