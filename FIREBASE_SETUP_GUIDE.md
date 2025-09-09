# Firebase Storage Setup Guide

This guide will help you migrate from AWS S3 to Firebase Storage for file uploads in the KM Media Training Institute application.

## Prerequisites

1. A Google account
2. Access to the [Firebase Console](https://console.firebase.google.com/)

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "km-media-training")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firebase Storage

1. In your Firebase project console, click on "Storage" in the left sidebar
2. Click "Get started"
3. Choose your security rules (start in test mode for development)
4. Select a location for your storage bucket (choose one close to your users)
5. Click "Done"

## Step 3: Create a Service Account

1. Go to Project Settings (gear icon) → "Service accounts" tab
2. Click "Generate new private key"
3. Download the JSON file and keep it secure
4. Note the following values from the JSON file:
   - `project_id`
   - `client_email`
   - `private_key`

## Step 4: Configure Environment Variables

Update your `.env` file with the Firebase configuration:

```env
# Firebase Storage Configuration
FIREBASE_PROJECT_ID=your-project-id-from-json
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

**Important Notes:**
- Replace `your-project-id-from-json` with the actual project ID from your service account JSON
- Replace the client email with the one from your service account JSON
- Replace the private key with the actual private key from your service account JSON (keep the quotes and newlines)
- Replace `your-project.appspot.com` with your actual storage bucket name

## Step 5: Update Storage Rules (Optional)

For production, you may want to update your Firebase Storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /course-materials/{allPaths=**} {
      allow read: if true; // Allow public read access
      allow write: if request.auth != null; // Only authenticated users can upload
    }
  }
}
```

## Step 6: Install Dependencies

The Firebase Admin SDK has already been added to your project. If you need to reinstall:

```bash
npm install firebase-admin
```

## Step 7: Remove AWS Dependencies (Optional)

You can now remove AWS S3 dependencies from your package.json:

```bash
npm uninstall @aws-sdk/client-s3
```

## Migration Benefits

- **Easier Setup**: Firebase requires fewer configuration steps
- **Better Integration**: Works seamlessly with other Firebase services
- **Automatic CDN**: Firebase Storage includes global CDN by default
- **Simpler Authentication**: Integrates with Firebase Auth if you decide to use it later
- **Cost-Effective**: Generous free tier and competitive pricing

## Testing the Migration

1. Start your server: `npm run dev`
2. Try uploading a file through your course management interface
3. Check the Firebase Storage console to see if files are being uploaded
4. Test file deletion functionality

## Troubleshooting

### Common Issues:

1. **Authentication Error**: Make sure your service account JSON is correct and the private key is properly formatted with newlines
2. **Permission Denied**: Check your Firebase Storage rules
3. **Bucket Not Found**: Verify your `FIREBASE_STORAGE_BUCKET` environment variable
4. **Module Not Found**: Ensure `firebase-admin` is installed: `npm install firebase-admin`

### Getting Help:

- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
