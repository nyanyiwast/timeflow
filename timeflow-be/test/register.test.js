const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Test user data
const testUser = {
  ecNumber: `test-${Date.now()}`,
  name: 'Test User',
  password: 'testpass123',
  departmentId: 1,
  // A small base64-encoded test image (1x1 transparent pixel)
  imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
};

describe('User Registration', () => {
  beforeAll(async () => {
    // Ensure the test database is clean
    await pool.query('DELETE FROM employees WHERE ec_number LIKE ?', ['test-%']);
  });

  afterAll(async () => {
    // Clean up after tests
    await pool.query('DELETE FROM employees WHERE ec_number = ?', [testUser.ecNumber]);
    await pool.end();
  });

  it('should register a new user with valid data', async () => {
    const response = await request(app)
      .post('/api/employees/register')
      .send(testUser)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'Employee registered successfully');
    expect(response.body).toHaveProperty('ecNumber', testUser.ecNumber);
    expect(response.body).toHaveProperty('hasFaceEnrollment', true);
  });

  it('should not register with duplicate EC number', async () => {
    const response = await request(app)
      .post('/api/employees/register')
      .send(testUser)
      .expect('Content-Type', /json/)
      .expect(409);

    expect(response.body).toHaveProperty('error', 'Employee with this EC number already exists');
    expect(response.body).toHaveProperty('code', 'DUPLICATE_EMPLOYEE');
  });

  it('should not register with invalid department', async () => {
    const invalidUser = { ...testUser, ecNumber: `test-${Date.now()}` };
    invalidUser.departmentId = 9999; // Non-existent department

    const response = await request(app)
      .post('/api/employees/register')
      .send(invalidUser)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Invalid department ID');
    expect(response.body).toHaveProperty('code', 'INVALID_DEPARTMENT');
  });

  it('should not register with invalid image data', async () => {
    const invalidUser = { ...testUser, ecNumber: `test-${Date.now()}` };
    invalidUser.imageBase64 = 'invalid-base64';

    const response = await request(app)
      .post('/api/employees/register')
      .send(invalidUser)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('code', 'FACE_ENROLLMENT_ERROR');
  });

  it('should register without face image', async () => {
    const userWithoutFace = { ...testUser, ecNumber: `test-${Date.now()}` };
    delete userWithoutFace.imageBase64;

    const response = await request(app)
      .post('/api/employees/register')
      .send(userWithoutFace)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('hasFaceEnrollment', false);
  });
});
