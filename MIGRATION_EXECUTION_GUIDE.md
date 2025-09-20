# Firestore Migration Execution Guide

## Overview

This guide provides step-by-step instructions for executing the PostgreSQL to Firestore migration for your KM Media learning platform.

## Prerequisites

### 1. Firebase Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init firestore
```

### 2. Environment Configuration

Create a `.env` file with the following variables:

```env
# PostgreSQL Configuration (for export)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kmmedia
DB_USER=postgres
DB_PASSWORD=your_password

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Client Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### 3. Dependencies Installation

```bash
# Backend dependencies
cd server
npm install firebase-admin

# Frontend dependencies
cd ../client
npm install firebase
```

## Migration Steps

### Phase 1: Data Export (PostgreSQL → JSON)

#### Step 1.1: Run Data Export Script

```bash
cd server/migration
node postgres-to-firestore-export.js
```

This will create `exported-data.json` with all your PostgreSQL data transformed for Firestore.

#### Step 1.2: Validate Export

```bash
# Check export file size and structure
ls -la exported-data.json
head -50 exported-data.json
```

Expected output structure:

```json
{
  "users": [...],
  "courses": [...],
  "registrations": [...],
  "payments": [...],
  "stories": [...],
  "metadata": {
    "exportDate": "2024-01-01T00:00:00.000Z",
    "totalRecords": 1000,
    "version": "1.0.0"
  }
}
```

### Phase 2: Data Import (JSON → Firestore)

#### Step 2.1: Deploy Security Rules

```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules
```

#### Step 2.2: Run Data Import Script

```bash
cd server/migration
node firestore-import.js
```

This will import all data into Firestore with proper batch operations.

#### Step 2.3: Validate Import

```bash
# Run migration tests
node test-firestore-migration.js
```

### Phase 3: Application Updates

#### Step 3.1: Update Backend Configuration

```bash
# Update server configuration
cd server/src/config
# Update index.ts with Firebase configuration
```

#### Step 3.2: Update Backend Services

```bash
# Replace repository implementations
cd server/src/repositories
# Use FirestoreUserRepository instead of UserRepository
# Use FirestoreCourseRepository instead of CourseRepository
```

#### Step 3.3: Update Frontend Services

```bash
# Update frontend services
cd client/src/services
# Use FirestoreService instead of API calls
# Update UserService and CourseService
```

### Phase 4: Testing and Validation

#### Step 4.1: Run Comprehensive Tests

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd ../client
npm test
```

#### Step 4.2: Manual Testing Checklist

- [ ] User registration and login
- [ ] Course creation and management
- [ ] Student enrollment process
- [ ] Payment processing
- [ ] Real-time updates (notifications, course materials)
- [ ] Admin dashboard functionality
- [ ] Trainer dashboard functionality
- [ ] Student dashboard functionality

#### Step 4.3: Performance Testing

```bash
# Run performance tests
cd server/migration
node test-firestore-migration.js
```

## Rollback Plan

### If Migration Fails

#### Step 1: Restore PostgreSQL

```bash
# Restore from backup
pg_restore -d kmmedia backup_file.sql
```

#### Step 2: Revert Code Changes

```bash
# Revert to previous commit
git reset --hard HEAD~1
```

#### Step 3: Update Environment Variables

```bash
# Switch back to PostgreSQL configuration
export DATABASE_TYPE=postgresql
```

## Post-Migration Tasks

### 1. Monitoring Setup

```bash
# Set up Firebase monitoring
firebase projects:list
firebase use your-project-id
```

### 2. Performance Optimization

- Review Firestore usage in Firebase Console
- Optimize queries based on actual usage patterns
- Implement caching strategies
- Set up cost alerts

### 3. Documentation Updates

- Update API documentation
- Update deployment guides
- Update troubleshooting guides

## Common Issues and Solutions

### Issue 1: Import Timeout

**Problem**: Large datasets causing import timeouts
**Solution**:

```bash
# Increase timeout in import script
node --max-old-space-size=4096 firestore-import.js
```

### Issue 2: Security Rules Denied

**Problem**: Import fails due to security rules
**Solution**:

```bash
# Temporarily disable security rules for import
# Update rules to allow admin access during migration
```

### Issue 3: Memory Issues

**Problem**: Out of memory during export/import
**Solution**:

```bash
# Process data in smaller batches
# Increase Node.js memory limit
node --max-old-space-size=8192 migration-script.js
```

### Issue 4: Real-time Updates Not Working

**Problem**: Real-time listeners not functioning
**Solution**:

- Check Firebase project configuration
- Verify authentication setup
- Ensure proper listener cleanup

## Performance Optimization Checklist

### Immediate Optimizations

- [ ] Enable Firestore offline persistence
- [ ] Implement proper pagination
- [ ] Use compound indexes for complex queries
- [ ] Batch write operations
- [ ] Implement query result caching

### Ongoing Optimizations

- [ ] Monitor Firestore usage metrics
- [ ] Optimize based on actual usage patterns
- [ ] Implement lazy loading for large datasets
- [ ] Set up cost monitoring and alerts
- [ ] Regular performance reviews

## Cost Management

### Budget Planning

```bash
# Estimate costs based on expected usage
# Document reads: $0.06 per 100,000
# Document writes: $0.18 per 100,000
# Document deletes: $0.02 per 100,000
```

### Cost Monitoring

- Set up Firebase billing alerts
- Monitor daily usage patterns
- Implement usage quotas if needed
- Regular cost reviews

## Security Considerations

### Access Control

- Review and test all security rules
- Implement proper user authentication
- Set up admin access controls
- Regular security audits

### Data Protection

- Ensure data encryption in transit
- Implement proper backup strategies
- Set up data retention policies
- Regular security updates

## Support and Maintenance

### Monitoring

- Set up application performance monitoring
- Implement error tracking and alerting
- Regular health checks
- Performance metrics tracking

### Backup Strategy

- Regular Firestore exports
- Cross-region replication if needed
- Disaster recovery planning
- Regular backup testing

## Success Metrics

### Technical Metrics

- Migration completion time
- Data integrity validation
- Performance benchmarks
- Error rates

### Business Metrics

- User experience impact
- Feature functionality
- Cost comparison
- Scalability improvements

This guide provides a comprehensive approach to executing your Firestore migration successfully. Follow each step carefully and ensure proper testing at each phase.


