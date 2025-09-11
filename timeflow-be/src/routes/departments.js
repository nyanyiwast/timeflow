const express = require('express');
const router = express.Router();
const Joi = require('joi');
const verifyToken = require('../middleware/auth');
const pool = require('../config/db');

// Validation schemas
const createSchema = Joi.object({
  name: Joi.string().min(1).max(255).required()
});

const updateSchema = Joi.object({
  name: Joi.string().min(1).max(255).required()
});

// POST /api/departments
router.post('/', verifyToken, async (req, res) => {
 try {
   const { error } = createSchema.validate(req.body);
   if (error) {
     return res.status(400).json({ error: error.details[0].message });
   }

   const { name } = req.body;

   // Insert into DB
   const [result] = await pool.execute('INSERT INTO departments (name) VALUES (?)', [name]);
   const departmentId = result.insertId;

   res.status(201).json({
     message: 'Department created successfully',
     id: departmentId,
     name
   });
 } catch (err) {
   console.error(err);
   if (err.code === 'ER_DUP_ENTRY') {
     res.status(400).json({ error: 'Department name already exists' });
   } else {
     res.status(500).json({ error: 'Internal server error' });
   }
 }
});

// GET /api/departments
router.get('/', verifyToken, async (req, res) => {
 try {
   const [rows] = await pool.execute('SELECT * FROM departments ORDER BY name');

   res.json(rows);
 } catch (err) {
   console.error(err);
   res.status(500).json({ error: 'Internal server error' });
 }
});

// PUT /api/departments/:id
router.put('/:id', verifyToken, async (req, res) => {
 try {
   const { error } = updateSchema.validate(req.body);
   if (error) {
     return res.status(400).json({ error: error.details[0].message });
   }

   const { id } = req.params;
   const { name } = req.body;

   // Update in DB
   const [result] = await pool.execute('UPDATE departments SET name = ? WHERE id = ?', [name, id]);
   if (result.affectedRows === 0) {
     return res.status(404).json({ error: 'Department not found' });
   }

   res.json({
     message: 'Department updated successfully',
     id,
     name
   });
 } catch (err) {
   console.error(err);
   if (err.code === 'ER_DUP_ENTRY') {
     res.status(400).json({ error: 'Department name already exists' });
   } else {
     res.status(500).json({ error: 'Internal server error' });
   }
 }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from DB
    const [result] = await pool.execute('DELETE FROM departments WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({
      message: 'Department deleted successfully',
      id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;