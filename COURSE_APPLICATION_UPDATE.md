# Course Application Form Update

## Overview

The course application form has been updated to match the KM Media Training Institute admission form structure. This update includes comprehensive personal information, educational background, parent/guardian information, and course-specific details.

## Changes Made

### Frontend Changes (Client)

1. **Updated ApplicationForm Interface** (`client/src/pages/CourseDetail.tsx`)

   - Replaced generic form fields with specific KM Media Training Institute fields
   - Added comprehensive personal information fields
   - Added educational background section
   - Added parent/guardian information section
   - Added course information and declaration fields

2. **Form Fields Updated**
   - **Personal Information**: Full name, date of birth, residential address, nationality, religion, marital status, occupation, telephone
   - **Educational Background**: Level of education, name of school, years attended, certificate obtained
   - **Parent/Guardian Information**: Name, occupation, address, contact numbers
   - **Course Information**: Preferred course of study, academic year
   - **Declaration**: Required declaration about provided information

### Backend Changes (Server)

1. **Updated RegistrationRequest Interface** (`server/src/types/index.ts`)

   - Added all new form fields to the interface
   - Made appropriate fields required vs optional

2. **Enhanced Validation** (`server/src/routes/registrations.ts`)

   - Added comprehensive validation for all new fields
   - Updated registration creation logic to handle all form data

3. **Database Schema Update** (`server/src/database/init.ts`)
   - Added new columns to registrations table
   - All required fields marked as NOT NULL
   - Optional fields allow NULL values

## Migration Process

### For New Installations

The updated schema will be automatically applied when the application starts.

### For Existing Installations

Run the migration script to update the existing database:

```bash
# Connect to your PostgreSQL database
psql -d your_database_name -f server/src/database/migration.sql
```

Or run the migration manually:

```sql
-- Add new columns to registrations table
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS "firstName" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "lastName" VARCHAR(255),
-- ... (see migration.sql for complete list)

-- Update existing registrations with default values
UPDATE registrations
SET "firstName" = 'N/A', "lastName" = 'N/A', ...
WHERE "firstName" IS NULL;

-- Make required fields NOT NULL
ALTER TABLE registrations
ALTER COLUMN "firstName" SET NOT NULL,
-- ... (see migration.sql for complete list)
```

## Form Structure

The updated application form now includes:

### Personal Information Section

- First Name, Last Name, Email, Phone
- Full Name of Applicant
- Date of Birth
- Residential Address
- Nationality, Religion, Marital Status
- Occupation, Telephone

### Educational Background Section

- Level of Education
- Name of School
- Year Attended (From/To)
- Certificate Obtained

### Parent/Guardian Information Section

- Name of Parent or Guardian
- Parent or Guardian Occupation
- Parent or Guardian Residential Address
- Contact Number, Telephone

### Course Information Section

- Preferred Course of Study
- Academic Year

### Declaration and Comments Section

- Declaration (required)
- Comments (optional)

## Validation Rules

### Required Fields

- All personal information fields
- Educational background fields
- Parent/guardian information fields
- Course information fields
- Declaration

### Optional Fields

- Religion
- Telephone
- Certificate Obtained
- Parent Guardian Telephone
- Comments

## Testing

1. **Test Form Submission**

   - Fill out all required fields
   - Submit the form
   - Verify data is saved correctly in database

2. **Test Validation**

   - Try submitting with missing required fields
   - Verify appropriate error messages appear

3. **Test User Pre-fill**
   - Login with existing user
   - Verify user data is pre-filled in form

## Notes

- The form maintains the same modern UI/UX design
- All existing functionality is preserved
- The update is backward compatible with existing registrations
- Default values are provided for existing registrations during migration

## References

- Original KM Media Training Institute form: https://paystack.shop/pay/4-01rfg8g4?sfnsn=wa
- Form structure matches the official admission requirements

