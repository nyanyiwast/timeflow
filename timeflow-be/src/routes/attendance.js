const express = require('express');
const router = express.Router();
const Joi = require('joi');
const pool = require('../config/db');
const logger = require('../config/logger');
const axios = require('axios');

const checkInOutSchema = Joi.object({
  ecNumber: Joi.string().alphanum().min(1).max(50).required(),
  imageBase64: Joi.string().required().description('Base64 encoded image for facial recognition')
});

// Function to verify face with microservice
async function verifyFace(ecNumber, imageBase64) {
  try {
    const response = await axios.post(process.env.FACE_RECOG_VERIFY_URL, {
      ec_number: ecNumber,
      image_base64: imageBase64
    });
    return response.data.match; // Assume { match: true/false }
  } catch (err) {
    logger.error('Face verification failed: %s', err.message);
    return false;
  }
}

// POST /api/check-in
router.post('/check-in', async (req, res) => {
  try {
    const { error } = checkInOutSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { ecNumber, imageBase64 } = req.body;

    let verified = true;
    let selfieImage = null;

    // Attempt face verification
    const isMatch = await verifyFace(ecNumber, imageBase64);
    if (!isMatch) {
      logger.warn('Face verification failed for %s, saving as manual entry with selfie', ecNumber);
      verified = false;
      selfieImage = imageBase64; // Save the captured image as selfie
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const checkInTime = new Date();
    const startTime = process.env.START_TIME || '09:00:00';
    const startToday = new Date(`${today}T${startTime}`);
    const isLate = checkInTime > startToday;

    // Check if already checked in today
    const [existing] = await pool.execute(
      'SELECT check_in_time FROM attendance_records WHERE ec_number = ? AND date = ?',
      [ecNumber, today]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    // Insert record
    await pool.execute(
      'INSERT INTO attendance_records (ec_number, date, check_in_time, is_late, verified, selfie_image) VALUES (?, ?, ?, ?, ?, ?)',
      [ecNumber, today, checkInTime, isLate, verified, selfieImage]
    );

    res.status(200).json({
      message: verified ? 'Check-in successful' : 'Check-in recorded with selfie (manual verification needed)',
      ecNumber,
      checkInTime: checkInTime.toISOString(),
      isLate,
      verified
    });
  } catch (err) {
    logger.error('Check-in error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/check-out
router.post('/check-out', async (req, res) => {
  try {
    const { error } = checkInOutSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { ecNumber, imageBase64 } = req.body;

    let verified = true;
    let selfieImage = null;

    // Attempt face verification
    const isMatch = await verifyFace(ecNumber, imageBase64);
    if (!isMatch) {
      logger.warn('Face verification failed for %s check-out, saving as manual entry with selfie', ecNumber);
      verified = false;
      selfieImage = imageBase64; // Save the captured image as selfie for check-out
    }

    const today = new Date().toISOString().split('T')[0];
    const checkOutTime = new Date();

    // Get existing record
    const [records] = await pool.execute(
      'SELECT check_in_time FROM attendance_records WHERE ec_number = ? AND date = ?',
      [ecNumber, today]
    );

    if (records.length === 0) {
      return res.status(400).json({ error: 'No check-in record found for today' });
    }

    const checkInTime = new Date(records[0].check_in_time);
    const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Hours

    // Update record
    await pool.execute(
      'UPDATE attendance_records SET check_out_time = ?, total_hours = ?, verified = ?, selfie_image = ? WHERE ec_number = ? AND date = ?',
      [checkOutTime, totalHours, verified, selfieImage, ecNumber, today]
    );

    res.status(200).json({
      message: verified ? 'Check-out successful' : 'Check-out recorded with selfie (manual verification needed)',
      ecNumber,
      checkOutTime: checkOutTime.toISOString(),
      totalHours: totalHours.toFixed(2),
      verified
    });
  } catch (err) {
    logger.error('Check-out error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;