-- Add profile_picture column to employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS profile_picture LONGTEXT AFTER department_id;
