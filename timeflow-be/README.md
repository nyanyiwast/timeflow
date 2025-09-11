# Timeflow Backend

A Node.js Express API for employee time tracking with facial recognition using MySQL database and Node.js-based face recognition with face-api.js.

## Features

- Employee registration with password hashing and facial enrollment
- JWT-based authentication
- Department management
- Check-in/check-out with facial verification and lateness detection
- Attendance reporting (daily, employee history, lateness)
- API documentation via Swagger at `/api-docs`
- Error handling and validation

## Tech Stack

- Backend: Node.js, Express
- Database: MySQL
- Authentication: JWT, bcrypt
- Validation: Joi
- Facial Recognition: face-api.js with TensorFlow.js
- Documentation: Swagger/OpenAPI

## Prerequisites

- Node.js (v18+)
- MySQL database
- pnpm package manager

## Setup

1. **Clone the repository** (if applicable)

2. **Database Setup**
   - Create a MySQL database named `timeflow_db`
   - Run the schema: `mysql -u root -p < schema.sql`

3. **Environment Variables**
   - Create `.env` with the following (adjust as needed):
     ```
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=timeflow_db
     JWT_SECRET=your_jwt_secret
     PORT=3000
     START_TIME=09:00:00
     ```

4. **Install Dependencies**
   - `cd timeflow-be && pnpm install`

5. **Face Recognition Models Setup**
   - Create the models directory: `mkdir models`
   - Download the pre-trained models from https://github.com/justadudewhohacks/face-api.js/tree/master/weights:
     - ssd_mobilenetv1_model-shard1
     - face_landmark_68_model-shard1
     - face_recognition_model-shard1
   - Place them in the `models` directory (use curl or download manually):
     ```
     curl -L -o models/ssd_mobilenetv1_model-shard1 https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-shard1
     curl -L -o models/face_landmark_68_model-shard1 https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1
     curl -L -o models/face_recognition_model-shard1 https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
     ```

6. **Start the Backend**
   - `cd timeflow-be`
   - Development: `pnpm run dev`
   - Production: `pnpm start`

## API Endpoints

Access Swagger docs at `http://localhost:3000/api-docs` for full details.

- **Authentication**
  - POST /api/employees/register - Register employee (include base64 image for facial enrollment)
  - POST /api/employees/login - Login and get JWT token

- **Employees**
  - GET /api/employees/{ecNumber} - Get details (protected)
  - PUT /api/employees/{ecNumber} - Update (protected)
  - DELETE /api/employees/{ecNumber} - Delete (protected)

- **Departments**
  - POST /api/departments - Create (protected)
  - GET /api/departments - List (protected)
  - PUT /api/departments/{id} - Update (protected)
  - DELETE /api/departments/{id} - Delete (protected)

- **Attendance**
  - POST /api/check-in - Check-in with face verification (protected, include base64 image)
  - POST /api/check-out - Check-out with face verification (protected, include base64 image)

- **Reports**
  - GET /api/reports/daily - Daily attendance (protected)
  - GET /api/reports/employee/{ecNumber} - Employee history (protected)
  - GET /api/reports/lateness - Lateness report (protected)

## Running the Application

To run the application:

Set up MySQL and run schema.sql to create the database.

Download face-api.js models to timeflow-be/models/.

Start the backend: cd timeflow-be && pnpm run dev (runs on port 3000).

## Testing

Use Postman or Swagger UI to test endpoints. For protected routes, include `Authorization: Bearer <token>` header. For facial endpoints, provide base64 encoded images in the request body (front-facing portraits for best results).

## Troubleshooting

- Ensure MySQL is running and credentials in .env are correct.
- Verify face-api.js models are in the models/ directory and the backend loads them (check console for errors on first request).
- If face recognition fails, ensure images are clear and front-facing; the library uses a threshold of 0.6 for matches.
- Check console logs for errors.

## Future Improvements

- Add liveness detection to prevent photo spoofing.
- Implement rate limiting.
- Add logging with Winston.
- Unit tests with Jest.
- Docker containerization.
