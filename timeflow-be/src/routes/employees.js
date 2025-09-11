const express = require('express');
const router = express.Router();
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const axios = require('axios');
const verifyToken = require('../middleware/auth');

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

   // Enroll face with Node.js service
   let faceEncoding = null;
   try {
     const { descriptor } = await faceService.enroll(ecNumber, imageBase64);
     faceEncoding = JSON.stringify(descriptor); // Store as JSON string in DB
   } catch (faceErr) {
     console.error('Face enrollment failed:', faceErr);
     // Continue without encoding for now
   }

   // Insert into DB
   await pool.execute(
     'INSERT INTO employees (ec_number, name, password, department_id, face_encoding) VALUES (?, ?, ?, ?, ?)',
     [ecNumber, name, hashedPassword, departmentId, faceEncoding]
   );

   res.status(201).json({
     message: 'Employee registered successfully',
     ecNumber
   });
 } catch (err) {
   console.error(err);
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
     return res.status(400).json({ error: 'Invalid credentials' });
   }

   const employee = rows[0];

   // Check password
   const validPassword = await bcrypt.compare(password, employee.password);
   if (!validPassword) {
     return res.status(400).json({ error: 'Invalid credentials' });
   }

   // Generate JWT
   const token = jwt.sign({ ecNumber: employee.ec_number }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
   console.error(err);
   res.status(500).json({ error: 'Internal server error' });
 }
});

// GET /api/employees/:ecNumber
router.get('/:ecNumber', async (req, res) => {
  try {
    const { ecNumber } = req.params;

    // TODO: Fetch from DB
    // Placeholder
    res.json({ 
      ecNumber,
      name: 'John Doe',
      departmentId: 1,
      faceEncoding: null // Would be binary data
    });
  } catch (err) {
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