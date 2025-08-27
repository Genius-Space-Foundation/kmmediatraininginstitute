#!/bin/bash

# Environment Setup Script for KM Media Training Institute
# This script helps you create a .env file from the template

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 KM Media Training Institute - Environment Setup${NC}"
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file already exists!${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Setup cancelled.${NC}"
        exit 0
    fi
fi

# Copy the template
if [ -f "env.example" ]; then
    cp env.example .env
    echo -e "${GREEN}✅ Created .env file from template${NC}"
else
    echo -e "${RED}❌ env.example file not found!${NC}"
    exit 1
fi

# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your-super-secret-jwt-key-change-this-in-production")

# Update the JWT secret in the .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
else
    # Linux
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
fi

echo -e "${GREEN}✅ Generated secure JWT secret${NC}"

# Generate a secure session secret
SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your-session-secret-key-change-this")

# Update the session secret in the .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" .env
else
    # Linux
    sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" .env
fi

echo -e "${GREEN}✅ Generated secure session secret${NC}"

# Create necessary directories
echo -e "${BLUE}📁 Creating necessary directories...${NC}"
mkdir -p logs
mkdir -p uploads
mkdir -p uploads/temp
mkdir -p backups
mkdir -p migrations
echo -e "${GREEN}✅ Created directories${NC}"

# Set proper permissions
echo -e "${BLUE}🔒 Setting proper permissions...${NC}"
chmod 600 .env
chmod 755 logs uploads backups migrations
echo -e "${GREEN}✅ Set permissions${NC}"

echo ""
echo -e "${GREEN}🎉 Environment setup completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Review and customize the .env file if needed"
echo "2. Update domain settings for your environment"
echo "3. Configure email settings if required"
echo "4. Set up SSL certificates for production"
echo ""
echo -e "${BLUE}📋 Important notes:${NC}"
echo "- Never commit .env files to version control"
echo "- Keep your JWT and session secrets secure"
echo "- Update production secrets before deployment"
echo ""
echo -e "${GREEN}✅ You're ready to start development!${NC}"

