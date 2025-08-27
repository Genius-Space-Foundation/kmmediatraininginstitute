#!/bin/bash

# Deployment script for KM Media Course Registration System
# Usage: ./scripts/deploy.sh [environment] [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}

# Configuration
REGISTRY="ghcr.io"
IMAGE_NAME="kmmedia/kmmedia-course-registration"

echo -e "${GREEN}🚀 Starting deployment to ${ENVIRONMENT} environment${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Function to deploy to different environments
deploy_staging() {
    echo -e "${YELLOW}🏗️  Deploying to staging...${NC}"
    
    # Pull latest images
    docker-compose -f docker-compose.staging.yml pull
    
    # Deploy with new images
    docker-compose -f docker-compose.staging.yml up -d
    
    echo -e "${GREEN}✅ Staging deployment completed${NC}"
}

deploy_production() {
    echo -e "${YELLOW}🏗️  Deploying to production...${NC}"
    
    # Pull latest images
    docker-compose -f docker-compose.production.yml pull
    
    # Deploy with new images
    docker-compose -f docker-compose.production.yml up -d
    
    echo -e "${GREEN}✅ Production deployment completed${NC}"
}

deploy_local() {
    echo -e "${YELLOW}🏗️  Deploying locally...${NC}"
    
    # Build and start services
    docker-compose up -d --build
    
    echo -e "${GREEN}✅ Local deployment completed${NC}"
}

# Main deployment logic
case $ENVIRONMENT in
    "local")
        deploy_local
        ;;
    "staging")
        deploy_staging
        ;;
    "production")
        deploy_production
        ;;
    *)
        echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
        echo "Valid environments: local, staging, production"
        exit 1
        ;;
esac

# Health check
echo -e "${YELLOW}🏥 Running health checks...${NC}"
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ All services are running${NC}"
else
    echo -e "${RED}❌ Some services failed to start${NC}"
    docker-compose ps
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${YELLOW}📊 Check service status with: docker-compose ps${NC}"
echo -e "${YELLOW}📋 View logs with: docker-compose logs -f${NC}"
