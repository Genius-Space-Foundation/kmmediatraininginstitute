# 🔐 Admin Login Issue - Solution Guide

## Problem

You created an admin user in Firebase Authentication, but:

- Can't log in to the application
- User doesn't appear in the Firestore `users` collection
- Authentication works but app doesn't recognize the user

## Root Cause

Firebase Authentication and Firestore are separate services. When you create a user in Firebase Auth, it doesn't automatically create a corresponding user profile in Firestore. Your application expects both:

1. Firebase Auth user (for authentication)
2. Firestore user profile (for application data and role management)

## Solution Steps

### Option 1: Use the Firebase Test Page (Recommended)

1. Go to `http://localhost:3000/firebase-test`
2. Scroll down to the "👤 User Management" section
3. Fill in the form with your admin details:
   - **Email**: Your admin email
   - **Password**: Your admin password
   - **First Name**: Admin's first name
   - **Last Name**: Admin's last name
   - **Role**: Select "Admin"
   - **Phone**: Admin's phone number
4. Click "➕ Create Admin User"
5. This will create both Firebase Auth user AND Firestore profile
6. Test login with "🔐 Test Login" button

### Option 2: Create a New Admin User

If you want to create a completely new admin user:

1. Use the User Management section in Firebase Test page
2. Enter new email/password
3. Set role to "Admin"
4. Click "➕ Create Admin User"

### Option 3: Check Existing User

If you think the user should already exist:

1. Enter the email in the User Management form
2. Click "🔍 Check User in Firestore"
3. This will tell you if the user exists in Firestore
4. If not found, create the user profile using Option 1

## What the Solution Does

### Creates Firebase Auth User

- Sets up authentication credentials
- Configures display name
- Enables login functionality

### Creates Firestore User Profile

- Stores user details (name, role, phone, etc.)
- Sets proper role permissions
- Links to Firebase Auth user via UID
- Enables application functionality

### Syncs Both Systems

- Ensures both systems have the same user data
- Maintains data consistency
- Enables proper role-based access control

## Expected Result

After using the solution:

- ✅ You can log in with your admin credentials
- ✅ User appears in Firestore `users` collection
- ✅ Admin role is properly recognized
- ✅ You can access admin dashboard and features

## Troubleshooting

If you still have issues:

1. Check browser console for error messages
2. Verify Firebase configuration in `.env` file
3. Ensure Firestore security rules allow read/write
4. Try creating a fresh admin user with different email
5. Use "🔍 Check User in Firestore" to verify user exists

## Quick Test

1. Create admin user using Firebase Test page
2. Go to `http://localhost:3000/login`
3. Log in with your admin credentials
4. You should be redirected to admin dashboard
5. Verify you can access admin features

This solution ensures your admin user exists in both Firebase Auth and Firestore, enabling full application functionality.

