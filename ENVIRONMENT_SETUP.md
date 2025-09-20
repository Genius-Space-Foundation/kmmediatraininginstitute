# Environment Setup Guide

This guide explains how to set up the environment variables for the Firebase-migrated KM Media application.

## Backend Environment Variables (server/.env)

Copy `server/env.example` to `server/.env` and update the following variables:

### Required Firebase Configuration

```bash
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

### How to Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Extract the values and add them to your `.env` file

### Server Configuration

```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

### CORS Configuration

```bash
CORS_ORIGIN_DEV=http://localhost:3000,http://localhost:3001
CORS_ORIGIN_PROD=https://kmmediatraininginstitute.com,https://www.kmmediatraininginstitute.com
```

## Frontend Environment Variables (client/.env)

Copy `client/env.firebase.example` to `client/.env` and update the following variables:

### Required Firebase Configuration

```bash
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### How to Get Frontend Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → General
4. Scroll down to "Your apps" section
5. Click on the web app icon (</>) to add a web app
6. Copy the config values to your `.env` file

### API Configuration

```bash
REACT_APP_API_URL=http://localhost:3003/api
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

## Firestore Security Rules

Update your Firestore security rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }

    // Public read access for courses
    match /courses/{document} {
      allow read: if resource.data.isActive == true;
      allow write: if request.auth != null && request.auth.token.role in ['admin', 'trainer'];
    }

    // User management
    match /users/{userId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == userId || request.auth.token.role == 'admin');
    }
  }
}
```

## Testing the Setup

1. Start the backend server:

   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend:

   ```bash
   cd client
   npm start
   ```

3. Test the connection:
   - Backend: http://localhost:3003/api/health
   - Frontend: http://localhost:3000

## Troubleshooting

### Common Issues

1. **Permission Denied Error**: Make sure Firestore rules allow read/write access
2. **Connection Timeout**: Check if Firebase project ID and credentials are correct
3. **CORS Issues**: Verify CORS_ORIGIN_DEV includes the frontend URL
4. **Port Conflicts**: Make sure ports 3000 (frontend) and 3003 (backend) are available

### Validation Scripts

Run the validation scripts to check your setup:

```bash
# Backend validation
cd server
node scripts/validate-firebase-config.js

# Test Firebase connection
node test-firebase-connection.js
```

## Production Deployment

For production deployment:

1. Update `NODE_ENV=production`
2. Use production Firebase project
3. Set up proper Firestore security rules
4. Configure CORS for production domains
5. Use environment-specific JWT secrets

