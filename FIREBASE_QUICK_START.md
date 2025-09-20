# Firebase Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Install project dependencies
cd server && npm install firebase-admin
cd ../client && npm install firebase
```

### 2. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name: `kmmedia-app`
4. Enable Firestore Database (start in test mode)
5. Choose location closest to your users

### 3. Get Firebase Credentials

#### Backend Credentials (Service Account)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "IAM & Admin" > "Service Accounts"
4. Create service account with "Firebase Admin SDK Administrator" role
5. Generate JSON key file

#### Frontend Credentials (Web App)

1. Go to Firebase Console > Project Settings
2. Scroll to "Your apps" section
3. Click "Add app" > Web app
4. Register app and copy config

### 4. Configure Environment Variables

#### Backend (`server/.env`)

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

#### Frontend (`client/.env`)

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### 5. Test Connection

```bash
# Test backend connection
cd server && node test-firebase-connection.js

# Test frontend (add FirebaseTest component to your app)
```

## 🔧 Automated Setup

### Option 1: Run Setup Script

```bash
# Linux/Mac
./scripts/setup-firebase.sh

# Windows
scripts\setup-firebase.bat
```

### Option 2: Manual Setup

Follow the detailed guide in `FIREBASE_SETUP_GUIDE.md`

## 📋 Checklist

- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] Service account created and key downloaded
- [ ] Web app registered in Firebase Console
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Connection tested
- [ ] Security rules deployed

## 🚨 Common Issues

### "Permission denied" error

- Check Firestore security rules
- Verify service account permissions
- Ensure project ID is correct

### "Invalid API key" error

- Check environment variable names
- Verify API key from Firebase Console
- Restart your development server

### Connection timeout

- Check network connectivity
- Verify Firebase project status
- Check firewall settings

## 📚 Next Steps

1. **Run Migration**: Use the migration scripts to transfer data
2. **Update Code**: Replace PostgreSQL queries with Firestore
3. **Test Features**: Verify all functionality works
4. **Deploy**: Update production environment
5. **Monitor**: Set up Firebase monitoring and alerts

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)

## 💡 Pro Tips

- **Start with test mode** for Firestore security rules
- **Use composite indexes** for complex queries
- **Monitor costs** with Firebase usage dashboard
- **Enable backups** for production data
- **Test offline functionality** with Firestore persistence

