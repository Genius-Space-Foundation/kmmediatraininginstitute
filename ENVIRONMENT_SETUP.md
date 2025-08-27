# Environment Setup Guide

This guide will help you set up the environment variables for the KM Media Training Institute application.

## 🚀 Quick Start

### 1. Automatic Setup (Recommended)

Run the setup script to automatically create your `.env` file:

```bash
# Make sure you're in the project root directory
./scripts/setup-env.sh
```

This script will:

- ✅ Copy the template to `.env`
- ✅ Generate secure JWT and session secrets
- ✅ Create necessary directories
- ✅ Set proper file permissions

### 2. Manual Setup

If you prefer to set up manually:

```bash
# Copy the template
cp env.example .env

# Edit the file with your preferred editor
nano .env
# or
code .env
```

## 📋 Essential Environment Variables

### Required Variables

These variables must be configured for the application to work:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Database
DB_PATH=./database.sqlite

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Client Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

### Domain Configuration

Update these with your actual domain:

```env
DOMAIN=kmmediatraininginstitute.com
WWW_DOMAIN=www.kmmediatraininginstitute.com
API_DOMAIN=api.kmmediatraininginstitute.com
STAGING_DOMAIN=staging.kmmediatraininginstitute.com
```

## 🔧 Environment-Specific Configurations

### Development Environment

```env
NODE_ENV=development
DEBUG_ENABLED=true
LOG_LEVEL=debug
REACT_APP_API_URL=http://localhost:5000/api
```

### Staging Environment

```env
NODE_ENV=staging
DEBUG_ENABLED=true
LOG_LEVEL=info
REACT_APP_API_URL=http://api-staging.kmmediatraininginstitute.com
```

### Production Environment

```env
NODE_ENV=production
DEBUG_ENABLED=false
LOG_LEVEL=warn
REACT_APP_API_URL=https://api.kmmediatraininginstitute.com
EMAIL_ENABLED=true
```

## 🔒 Security Configuration

### JWT Secrets

Generate secure secrets for production:

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate session secret
openssl rand -base64 32
```

### Password Policy

Configure password requirements:

```env
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL_CHARS=true
```

## 📧 Email Configuration (Optional)

Enable email functionality for notifications:

```env
EMAIL_ENABLED=true
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@kmmediatraininginstitute.com
```

## 📁 Directory Structure

The setup script creates these directories:

```
project-root/
├── logs/           # Application logs
├── uploads/        # File uploads
│   └── temp/       # Temporary uploads
├── backups/        # Database backups
└── migrations/     # Database migrations
```

## 🔍 Validation

### Check Environment Variables

Verify your configuration:

```bash
# Check if .env file exists
ls -la .env

# Validate environment variables
node -e "
  require('dotenv').config();
  console.log('Environment loaded successfully');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
"
```

### Test Database Connection

```bash
# Test database configuration
node -e "
  require('dotenv').config();
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database(process.env.DB_PATH);
  console.log('Database connection test:', db ? 'Success' : 'Failed');
  db.close();
"
```

## 🚨 Security Best Practices

### 1. Never Commit .env Files

Ensure `.env` is in your `.gitignore`:

```bash
# Check if .env is ignored
git check-ignore .env
```

### 2. Use Different Secrets for Each Environment

- **Development**: Use simple secrets for local development
- **Staging**: Use different secrets from production
- **Production**: Use strong, unique secrets

### 3. Rotate Secrets Regularly

Update JWT and session secrets periodically:

```bash
# Generate new secrets
openssl rand -base64 32
```

### 4. Limit File Permissions

```bash
# Set restrictive permissions on .env
chmod 600 .env
```

## 🔄 Environment Updates

### Adding New Variables

1. Add to `env.example`
2. Update this documentation
3. Update application code to use the new variable

### Updating Existing Variables

1. Update the variable in `.env`
2. Restart the application
3. Test the change

## 🐛 Troubleshooting

### Common Issues

1. **Environment not loading**

   ```bash
   # Check if dotenv is installed
   npm list dotenv

   # Verify .env file exists
   ls -la .env
   ```

2. **Permission denied**

   ```bash
   # Fix file permissions
   chmod 600 .env
   ```

3. **Invalid variable format**
   ```bash
   # Check for syntax errors
   grep -E "^[A-Z_]+=" .env
   ```

### Debug Commands

```bash
# View all environment variables
env | grep -E "(NODE_ENV|PORT|JWT|DB)"

# Check specific variable
echo $NODE_ENV

# Validate .env syntax
grep -v "^#" .env | grep -v "^$"
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Verify file permissions
3. Ensure all required variables are set
4. Test with the validation commands above

---

**Last Updated**: December 2024
**Version**: 1.0.0

