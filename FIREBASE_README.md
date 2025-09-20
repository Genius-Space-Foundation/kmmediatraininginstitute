# Firebase Migration Setup

This directory contains all the necessary files and scripts to migrate your KM Media application from PostgreSQL to Firebase Firestore.

## 📁 File Structure

```
├── FIREBASE_SETUP_GUIDE.md          # Detailed setup instructions
├── FIREBASE_QUICK_START.md          # Quick 5-minute setup guide
├── FIREBASE_README.md               # This file
├── scripts/
│   ├── setup-firebase.sh            # Automated setup script (Linux/Mac)
│   ├── setup-firebase.bat           # Automated setup script (Windows)
│   ├── validate-firebase-config.js  # Configuration validation
│   └── get-firebase-credentials.js  # Interactive credentials setup
├── server/
│   ├── env.firebase.example         # Backend environment template
│   ├── test-firebase-connection.js  # Backend connection test
│   └── src/config/firebase.ts       # Backend Firebase configuration
└── client/
    ├── env.firebase.example         # Frontend environment template
    ├── src/config/firebase.ts       # Frontend Firebase configuration
    └── src/components/FirebaseTest.tsx # Frontend connection test
```

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Linux/Mac
./scripts/setup-firebase.sh

# Windows
scripts\setup-firebase.bat
```

### Option 2: Interactive Setup

```bash
# Get help with credentials
node scripts/get-firebase-credentials.js

# Validate configuration
node scripts/validate-firebase-config.js
```

### Option 3: Manual Setup

Follow the detailed guide in `FIREBASE_SETUP_GUIDE.md`

## 📋 Prerequisites

- Node.js installed
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud Console access
- Firebase project created

## 🔧 Setup Steps

1. **Create Firebase Project**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project
   - Enable Firestore Database

2. **Get Credentials**

   - Backend: Create service account in Google Cloud Console
   - Frontend: Register web app in Firebase Console

3. **Configure Environment**

   - Copy environment templates
   - Fill in your Firebase credentials

4. **Test Connection**

   - Run validation script
   - Test backend connection
   - Test frontend connection

5. **Run Migration**
   - Export data from PostgreSQL
   - Import data to Firestore
   - Update application code

## 📚 Documentation

- **FIREBASE_SETUP_GUIDE.md**: Comprehensive setup instructions
- **FIREBASE_QUICK_START.md**: 5-minute quick start guide
- **FIREBASE_PERFORMANCE_GUIDE.md**: Performance optimization tips
- **MIGRATION_EXECUTION_GUIDE.md**: Step-by-step migration process

## 🛠️ Scripts

### Setup Scripts

- `setup-firebase.sh` / `setup-firebase.bat`: Automated setup
- `get-firebase-credentials.js`: Interactive credentials helper

### Validation Scripts

- `validate-firebase-config.js`: Configuration validation
- `test-firebase-connection.js`: Connection testing

### Migration Scripts

- `postgres-to-firestore-export.js`: Data export
- `firestore-import.js`: Data import
- `test-firestore-migration.js`: Migration testing

## 🔒 Security

- Service account keys are sensitive - keep them secure
- Never commit `.env` files to version control
- Use different projects for development/staging/production
- Regularly rotate service account keys

## 🚨 Troubleshooting

### Common Issues

1. **Permission Denied**

   - Check Firestore security rules
   - Verify service account permissions
   - Ensure project ID is correct

2. **Invalid API Key**

   - Check environment variable names
   - Verify API key from Firebase Console
   - Restart development server

3. **Connection Timeout**
   - Check network connectivity
   - Verify Firebase project status
   - Check firewall settings

### Getting Help

1. Check the troubleshooting section in `FIREBASE_SETUP_GUIDE.md`
2. Run the validation script: `node scripts/validate-firebase-config.js`
3. Check Firebase Console for project status
4. Review Firebase documentation

## 📊 Monitoring

After setup, monitor:

- Firebase usage dashboard
- Read/write operations
- Cost alerts
- Performance metrics

## 🔄 Next Steps

1. **Complete Setup**: Ensure all validations pass
2. **Run Migration**: Use the migration scripts
3. **Update Code**: Replace PostgreSQL with Firestore
4. **Test Features**: Verify all functionality
5. **Deploy**: Update production environment
6. **Monitor**: Set up alerts and monitoring

## 💡 Tips

- Start with test mode for Firestore security rules
- Use composite indexes for complex queries
- Enable offline persistence for better UX
- Set up automated backups
- Monitor costs regularly

## 📞 Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

**Ready to get started?** Run `./scripts/setup-firebase.sh` or follow the quick start guide!

