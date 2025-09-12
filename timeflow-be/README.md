# Timeflow Backend

Timeflow is a time tracking system with face recognition for attendance.

## Setup

1. Install dependencies:
   ```
   cd timeflow-be
   pnpm install
   ```

2. Setup database:
   ```
   mysql -u root -p < schema.sql
   ```
   This creates the database with default 'Administration' department and admin user (ec_number: 'admin', password: 'admin').

3. Update .env with your DB credentials and JWT_SECRET.

4. For face recognition (Node.js service):
   - Install system dependencies (macOS):
     ```
     brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
     ```
   - Approve build and install:
     ```
     pnpm approve-builds (select canvas)
     pnpm install
     ```
   - If issues, install Xcode tools: `xcode-select --install` or use Node 20 LTS.

5. For Python face service (microservice):
   - cd face-service
   - pip install -r requirements.txt
   - python app.py (runs on port 5000, set FACE_RECOG_VERIFY_URL in .env)

6. Run development server:
   ```
   pnpm run dev
   ```
   Server runs on port 3000. API docs at http://localhost:3000/api-docs.

## Logging

Uses Winston for logging. Logs to console, logs/error.log, logs/combined.log.

## Features

- Employee registration with optional face encoding (disabled if canvas unavailable).
- Login with JWT.
- Attendance check-in/out with face verification (optional if service down).
- Admin panel for departments, reports.

## Default Credentials

- Admin: ec_number = 'admin', password = 'admin'

## Troubleshooting

- Face recognition: Ensure Python service running and canvas built.
- DB: Run schema.sql to create defaults.
- Logs: Check logs/ directory for errors.
