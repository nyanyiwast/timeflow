const fs = require('fs');
const path = require('path');
const canvas = require('canvas');
const faceapi = require('face-api.js');
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODELS_PATH = path.join(__dirname, '../models');

let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);
  modelsLoaded = true;
}

async function enroll(ecNumber, imageBase64) {
  await loadModels();

  // Decode base64 to buffer
  const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const img = await canvas.loadImage(imageBuffer);

  // Detect face and compute descriptor
  const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
  if (!detections) {
    throw new Error('No face detected for enrollment');
  }

  const descriptor = Array.from(detections.descriptor);

  // Store in DB - assume we have a pool, but for now, save to file for simplicity; in production, store in DB as JSON
  const descriptorPath = path.join(__dirname, `../descriptors/${ecNumber}.json`);
  fs.mkdirSync(path.dirname(descriptorPath), { recursive: true });
  fs.writeFileSync(descriptorPath, JSON.stringify(descriptor));

  return { message: 'Enrollment successful', descriptor };
}

async function verify(ecNumber, imageBase64) {
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