-- ============================================
-- Student Attendance Management System
-- Sample Data (Seed File)
-- ============================================
-- Run this file AFTER running schema.sql
-- This adds sample data so we can practice
-- SELECT queries and test our system.
-- ============================================

USE attendance_system_db;

-- ============================================
-- Insert Users (1 Admin + 2 Teachers)
-- ============================================
-- Passwords are hashed using bcrypt (10 salt rounds).
-- In our Node.js backend, we will use the 'bcrypt' npm package to hash passwords.
-- Plain text passwords for testing:
--   Admin  (Amara)   → admin123
--   Teacher (Nimal)   → teacher123
--   Teacher (Sanduni) → teacher123
INSERT INTO users (name, email, password, role) VALUES
('Amara Silva', 'amara@school.com', '$2b$10$isLvFMyeuL4eyEczQYTiVOKLdsauzrvKPq/iBj4eJXTgqPEwx4Ry2', 'admin'),
('Nimal Perera', 'nimal@school.com', '$2b$10$VxB/Z1jcdUDt2rNG7V6bWenRA0afyXCPPxyMwRJ6RxX7gKWQzkl4e', 'teacher'),
('Sanduni Fernando', 'sanduni@school.com', '$2b$10$VxB/Z1jcdUDt2rNG7V6bWenRA0afyXCPPxyMwRJ6RxX7gKWQzkl4e', 'teacher');

-- ============================================
-- Insert Classrooms (2 Classrooms)
-- ============================================
-- Classroom 1 is assigned to Teacher Nimal (id = 2)
-- Classroom 2 is assigned to Teacher Sanduni (id = 3)
INSERT INTO classrooms (name, section, teacher_id) VALUES
('Batch 2026 - Web Development', 'Morning', 2),
('Batch 2026 - Mobile Development', 'Evening', 3);

-- ============================================
-- Insert Students (4 Students)
-- ============================================
-- Students 1 & 2 are in Classroom 1 (Web Development)
-- Students 3 & 4 are in Classroom 2 (Mobile Development)
INSERT INTO students (name, email, registration_number, classroom_id) VALUES
('Tharindu Jayasinghe', 'tharindu@student.com', 'STU-2026-001', 1),
('Nethmi Dissanayake', 'nethmi@student.com', 'STU-2026-002', 1),
('Kavinda Rajapaksha', 'kavinda@student.com', 'STU-2026-003', 2),
('Ishara Madushani', 'ishara@student.com', 'STU-2026-004', 2);

-- ============================================
-- Insert Attendance Records
-- ============================================
-- Day 1: 2026-04-28 (Monday)
-- Teacher Nimal (id=2) marks attendance for his students
INSERT INTO attendance (student_id, classroom_id, date, status, marked_by) VALUES
(1, 1, '2026-04-28', 'present', 2),
(2, 1, '2026-04-28', 'late', 2);

-- Teacher Sanduni (id=3) marks attendance for her students
INSERT INTO attendance (student_id, classroom_id, date, status, marked_by) VALUES
(3, 2, '2026-04-28', 'present', 3),
(4, 2, '2026-04-28', 'absent', 3);

-- Day 2: 2026-04-29 (Tuesday)
INSERT INTO attendance (student_id, classroom_id, date, status, marked_by) VALUES
(1, 1, '2026-04-29', 'present', 2),
(2, 1, '2026-04-29', 'present', 2),
(3, 2, '2026-04-29', 'late', 3),
(4, 2, '2026-04-29', 'present', 3);

-- Day 3: 2026-04-30 (Wednesday)
INSERT INTO attendance (student_id, classroom_id, date, status, marked_by) VALUES
(1, 1, '2026-04-30', 'present', 2),
(2, 1, '2026-04-30', 'absent', 2),
(3, 2, '2026-04-30', 'present', 3),
(4, 2, '2026-04-30', 'present', 3);
