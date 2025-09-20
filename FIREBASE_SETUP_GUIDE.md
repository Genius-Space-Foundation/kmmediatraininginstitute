# Firebase Project Setup Guide

## Prerequisites

- Node.js installed
- npm or yarn package manager
- Google Cloud Console access
- Firebase CLI installed (`npm install -g firebase-tools`)

## Step 1: Create Firebase Project

### 1.1 Create Project in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "kmmedia-app")
4. Enable Google Analytics (optional)
5. Choose Analytics account (optional)
6. Click "Create project"

### 1.2 Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll configure security rules later)
4. Select a location (choose closest to your users)
5. Click "Done"

### 1.3 Enable Authentication (if needed)

1. Go to "Authentication" in Firebase Console
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Configure any additional providers as needed

## Step 2: Create Service Account

### 2.1 Generate Service Account Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "IAM & Admin" > "Service Accounts"
4. Click "Create Service Account"
5. Enter name: "firebase-admin-sdk"
6. Enter description: "Service account for Firebase Admin SDK"
7. Click "Create and Continue"
8. Grant roles: "Firebase Admin SDK Administrator Service Agent"
9. Click "Continue" and "Done"

### 2.2 Generate Key File

1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Click "Create"
6. Download the JSON file and save it securely

## Step 3: Install Firebase Dependencies

### 3.1 Backend Dependencies

```bash
cd server
npm install firebase-admin
```

### 3.2 Frontend Dependencies

```bash
cd client
npm install firebase
```

## Step 4: Environment Configuration

### 4.1 Backend Environment Variables

Create or update `server/.env`:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

# Optional: Firebase Storage
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Existing variables (keep these)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kmmedia
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
PORT=3001
```

### 4.2 Frontend Environment Variables

Create or update `client/.env`:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id

# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
```

## Step 5: Configure Firebase Admin SDK

### 5.1 Backend Configuration

The `server/src/config/firebase.ts` file is already configured. Make sure your service account key is properly referenced.

### 5.2 Frontend Configuration

Create `client/src/config/firebase.ts`:

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
```

## Step 6: Security Rules Setup

### 6.1 Deploy Security Rules

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize project: `firebase init firestore`
4. Copy the security rules from `server/migration/firestore-security-rules.rules` to `firestore.rules`
5. Deploy: `firebase deploy --only firestore:rules`

### 6.2 Test Security Rules

1. Go to Firebase Console > Firestore > Rules
2. Use the Rules playground to test your rules
3. Verify access controls work as expected

## Step 7: Index Configuration

### 7.1 Create Composite Indexes

Firestore will prompt you to create indexes when you run queries. You can also create them manually:

1. Go to Firebase Console > Firestore > Indexes
2. Click "Create Index"
3. Add composite indexes for your common queries:
   - `courses`: `category` + `level` + `status`
   - `courses`: `instructorId` + `status`
   - `registrations`: `userId` + `status`
   - `payments`: `userId` + `status`

## Step 8: Backup and Monitoring

### 8.1 Enable Backup

1. Go to Firebase Console > Firestore > Backup
2. Enable automatic backups
3. Configure backup frequency and retention

### 8.2 Set up Monitoring

1. Go to Firebase Console > Project Settings > Integrations
2. Enable Google Cloud Monitoring
3. Set up alerts for read/write operations

## Step 9: Testing Connection

### 9.1 Test Backend Connection

Create a test script `server/test-firebase-connection.js`:

```javascript
const admin = require("firebase-admin");
const serviceAccount = require("./path-to-your-service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.firestore();

async function testConnection() {
  try {
    const testDoc = await db.collection("test").doc("connection").set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: "Firebase connection successful",
    });
    console.log("✅ Firebase connection successful");

    // Clean up test document
    await db.collection("test").doc("connection").delete();
    console.log("✅ Test document cleaned up");
  } catch (error) {
    console.error("❌ Firebase connection failed:", error);
  }
}

testConnection();
```

Run: `node test-firebase-connection.js`

### 9.2 Test Frontend Connection

Create a test component `client/src/components/FirebaseTest.jsx`:

```jsx
import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";

const FirebaseTest = () => {
  const [status, setStatus] = useState("Testing...");

  useEffect(() => {
    const testConnection = async () => {
      try {
        const testRef = await addDoc(collection(db, "test"), {
          timestamp: new Date(),
          message: "Frontend connection successful",
        });

        setStatus("✅ Frontend connection successful");

        // Clean up
        await deleteDoc(doc(db, "test", testRef.id));
      } catch (error) {
        setStatus(`❌ Frontend connection failed: ${error.message}`);
      }
    };

    testConnection();
  }, []);

  return <div>{status}</div>;
};

export default FirebaseTest;
```

## Step 10: Production Considerations

### 10.1 Environment Separation

- Create separate Firebase projects for development, staging, and production
- Use different service account keys for each environment
- Configure different security rules for each environment

### 10.2 Cost Optimization

- Set up billing alerts in Google Cloud Console
- Monitor read/write operations
- Implement caching strategies
- Use batch operations for bulk updates

### 10.3 Security Best Practices

- Rotate service account keys regularly
- Use least privilege principle for service accounts
- Implement proper authentication and authorization
- Regular security rule reviews

## Troubleshooting

### Common Issues

1. **Authentication Error**: Check service account key format and permissions
2. **Permission Denied**: Verify security rules and service account roles
3. **Connection Timeout**: Check network connectivity and Firebase project status
4. **Invalid API Key**: Verify environment variables are correctly set

### Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

## Next Steps

After completing this setup:

1. Run the data migration scripts
2. Update your application code to use Firestore
3. Test all functionality
4. Deploy to production
5. Monitor performance and costs

