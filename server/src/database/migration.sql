-- Migration script to add new fields to registrations table
-- Run this script to update existing database schema

-- Add new columns to registrations table
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS "firstName" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "lastName" VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS "fullName" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "dateOfBirth" DATE,
ADD COLUMN IF NOT EXISTS "residentialAddress" TEXT,
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
ADD COLUMN IF NOT EXISTS religion VARCHAR(100),
ADD COLUMN IF NOT EXISTS "maritalStatus" VARCHAR(50),
ADD COLUMN IF NOT EXISTS occupation VARCHAR(255),
ADD COLUMN IF NOT EXISTS telephone VARCHAR(50),
ADD COLUMN IF NOT EXISTS "levelOfEducation" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "nameOfSchool" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "yearAttendedFrom" INTEGER,
ADD COLUMN IF NOT EXISTS "yearAttendedTo" INTEGER,
ADD COLUMN IF NOT EXISTS "certificateObtained" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "parentGuardianName" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "parentGuardianOccupation" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "parentGuardianAddress" TEXT,
ADD COLUMN IF NOT EXISTS "parentGuardianContact" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "parentGuardianTelephone" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "preferredCourse" TEXT,
ADD COLUMN IF NOT EXISTS "academicYear" VARCHAR(50),
ADD COLUMN IF NOT EXISTS declaration TEXT,
ADD COLUMN IF NOT EXISTS comments TEXT;

-- Update existing registrations to have default values for required fields
UPDATE registrations 
SET 
  "firstName" = 'N/A',
  "lastName" = 'N/A',
  email = 'N/A',
  phone = 'N/A',
  "fullName" = 'N/A',
  "dateOfBirth" = '1900-01-01',
  "residentialAddress" = 'N/A',
  nationality = 'N/A',
  "maritalStatus" = 'N/A',
  occupation = 'N/A',
  "levelOfEducation" = 'N/A',
  "nameOfSchool" = 'N/A',
  "yearAttendedFrom" = 2000,
  "yearAttendedTo" = 2000,
  "parentGuardianName" = 'N/A',
  "parentGuardianOccupation" = 'N/A',
  "parentGuardianAddress" = 'N/A',
  "parentGuardianContact" = 'N/A',
  "preferredCourse" = 'N/A',
  "academicYear" = 'N/A',
  declaration = 'N/A'
WHERE "firstName" IS NULL;

-- Make required fields NOT NULL after setting default values
ALTER TABLE registrations 
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN phone SET NOT NULL,
ALTER COLUMN "fullName" SET NOT NULL,
ALTER COLUMN "dateOfBirth" SET NOT NULL,
ALTER COLUMN "residentialAddress" SET NOT NULL,
ALTER COLUMN nationality SET NOT NULL,
ALTER COLUMN "maritalStatus" SET NOT NULL,
ALTER COLUMN occupation SET NOT NULL,
ALTER COLUMN "levelOfEducation" SET NOT NULL,
ALTER COLUMN "nameOfSchool" SET NOT NULL,
ALTER COLUMN "yearAttendedFrom" SET NOT NULL,
ALTER COLUMN "yearAttendedTo" SET NOT NULL,
ALTER COLUMN "parentGuardianName" SET NOT NULL,
ALTER COLUMN "parentGuardianOccupation" SET NOT NULL,
ALTER COLUMN "parentGuardianAddress" SET NOT NULL,
ALTER COLUMN "parentGuardianContact" SET NOT NULL,
ALTER COLUMN "preferredCourse" SET NOT NULL,
ALTER COLUMN "academicYear" SET NOT NULL,
ALTER COLUMN declaration SET NOT NULL;

