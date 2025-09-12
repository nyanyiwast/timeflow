const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

// Configuration
const FACE_RECOGNITION_ENABLED = process.env.FACE_RECOGNITION_ENABLED !== 'false'; // Enabled by default

let canvas = null;
let faceapi = null;
let { Canvas, Image, ImageData } = {};
let faceRecognitionAvailable = false;

// Initialize face recognition if enabled
try {
  if (FACE_RECOGNITION_ENABLED) {
    canvas = require('canvas');
    faceapi = require('face-api.js');
    ({ Canvas, Image, ImageData } = canvas);
    faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
    faceRecognitionAvailable = true;
    logger.info('Face recognition module loaded successfully');
  } else {
    logger.info('Face recognition is disabled by configuration');
  }
} catch (err) {
  logger.warn('Face recognition disabled due to error: %s', err.message);
  logger.debug(err.stack);
}

const MODELS_PATH = path.join(__dirname, '../models');

let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded || !faceapi) return;

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);
  modelsLoaded = true;
}

async function enroll(ecNumber, imageBase64) {
  if (!faceRecognitionAvailable) {
    logger.warn('Face recognition not available, skipping face enrollment');
    return { success: true, descriptor: null };
  }

  if (!imageBase64) {
    throw new Error('No image data provided for face enrollment');
  }
  
  if (!imageBase64) {
    throw new Error('No image data provided');
  }

  try {
    await loadModels();
    
    // Make sure the image data is clean base64 (remove data URL prefix if present)
    const base64Data = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;
      
    // Validate base64 string
    if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
      throw new Error('Invalid base64 image data');
    }
    
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Basic image validation
    if (imageBuffer.length > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('Image size exceeds 5MB limit');
    }
    
    const img = await canvas.loadImage(imageBuffer);
    
    // Detect face and compute descriptor with timeout
    const detectionPromise = faceapi.detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();
      
    // Set a timeout for face detection
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Face detection timed out')), 10000)
    );
    
    const detections = await Promise.race([detectionPromise, timeoutPromise]);
    
    if (!detections) {
      throw new Error('No face detected in the image. Please ensure your face is clearly visible.');
    }
    
    // Check if face is too small
    const { width, height } = detections.detection.box;
    const minFaceSize = 100; // Minimum face size in pixels
    if (width < minFaceSize || height < minFaceSize) {
      throw new Error('Face is too small in the image. Please move closer to the camera.');
    }
    
    const descriptor = Array.from(detections.descriptor);
    
    // Create descriptors directory if it doesn't exist
    const descriptorsDir = path.join(__dirname, '../descriptors');
    if (!fs.existsSync(descriptorsDir)) {
      fs.mkdirSync(descriptorsDir, { recursive: true });
    }
    
    const descriptorPath = path.join(descriptorsDir, `${ecNumber}.json`);
    fs.writeFileSync(descriptorPath, JSON.stringify(descriptor));
    return { success: true, descriptor };
  } catch (error) {
    logger.error('Face enrollment error:', error);
    throw new Error(`Face enrollment failed: ${error.message}`);
  }
}

async function verify(ecNumber, imageBase64) {
  if (!faceRecognitionAvailable) {
    logger.warn('Face recognition not available, verification not possible');
    return { verified: false, message: 'Face recognition not available' };
  }
  await loadModels();

  // Decode base64 to buffer
  const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const img = await canvas.loadImage(imageBuffer);

  // Compute descriptor for current image
  const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
  if (!detections) {
    throw new Error('No face detected for verification');
  }

  const currentDescriptor = Array.from(detections.descriptor);

  // Load stored descriptor
  const descriptorPath = path.join(__dirname, `../descriptors/${ecNumber}.json`);
  if (!fs.existsSync(descriptorPath)) {
    throw new Error('Employee not enrolled');
  }

  const storedDescriptor = JSON.parse(fs.readFileSync(descriptorPath, 'utf8'));

  // Compare using euclidean distance
  const distance = faceapi.euclideanDistance(currentDescriptor, storedDescriptor);
  const isMatch = distance < 0.6; // Threshold for match

  return isMatch;
}

module.exports = { enroll, verify };