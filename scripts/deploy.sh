#!/bin/bash

# KM Media Training Institute - Deployment Script
# This script handles deployment to different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-ghcr.io}
IMAGE_PREFIX=${IMAGE_PREFIX:-kmmedia}

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
    exit 1
}

# Check if required tools are installed
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not in PATH"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed or not in PATH"
    fi
    
    success "All dependencies are available"
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    # Build server image
    log "Building server image..."
    docker build -f server/Dockerfile.optimized -t ${DOCKER_REGISTRY}/${IMAGE_PREFIX}-server:${VERSION} ./server
    
    # Build client image
    log "Building client image..."
    docker build -f client/Dockerfile.optimized -t ${DOCKER_REGISTRY}/${IMAGE_PREFIX}-client:${VERSION} ./client
    
    success "Images built successfully"
}

# Push images to registry
push_images() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Pushing images to registry..."
        
        docker push ${DOCKER_REGISTRY}/${IMAGE_PREFIX}-server:${VERSION}
        docker push ${DOCKER_REGISTRY}/${IMAGE_PREFIX}-client:${VERSION}
        
        success "Images pushed to registry"
    else
        warning "Skipping image push for non-production environment"
    fi
}

# Deploy to environment
deploy() {
    log "Deploying to ${ENVIRONMENT} environment..."
    
    # Set environment variables
    export ENVIRONMENT=${ENVIRONMENT}
    export VERSION=${VERSION}
    export DOCKER_REGISTRY=${DOCKER_REGISTRY}
    export IMAGE_PREFIX=${IMAGE_PREFIX}
    
    # Choose appropriate compose file
    if [ "$ENVIRONMENT" = "production" ]; then
        COMPOSE_FILE="docker-compose.production.yml"
    elif [ "$ENVIRONMENT" = "staging" ]; then
        COMPOSE_FILE="docker-compose.staging.yml"
    else
        COMPOSE_FILE="docker-compose.yml"
    fi
    
    # Check if compose file exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        warning "Compose file $COMPOSE_FILE not found, using default docker-compose.yml"
        COMPOSE_FILE="docker-compose.yml"
    fi
    
    # Deploy with monitoring if requested
    if [ "$3" = "with-monitoring" ]; then
        log "Deploying with monitoring stack..."
        docker-compose -f $COMPOSE_FILE -f docker-compose.monitoring.yml up -d
    else
        log "Deploying without monitoring..."
        docker-compose -f $COMPOSE_FILE up -d
    fi
    
    success "Deployment completed"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait for services to be ready
    sleep 30
    
    # Check server health
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        success "Server is healthy"
    else
        error "Server health check failed"
    fi
    
    # Check client health
    if curl -f http://localhost/ > /dev/null 2>&1; then
        success "Client is healthy"
    else
        error "Client health check failed"
    fi
    
    success "All health checks passed"
}

# Rollback function
rollback() {
    log "Rolling back to previous version..."
    
    # Get previous version (this would need to be stored somewhere)
    PREVIOUS_VERSION=${PREVIOUS_VERSION:-latest}
    
    export VERSION=${PREVIOUS_VERSION}
    deploy
    
    success "Rollback completed"
}

# Cleanup function
cleanup() {
    log "Cleaning up old images and containers..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused containers
    docker container prune -f
    
    success "Cleanup completed"
}

# Main deployment flow
main() {
    log "Starting deployment process..."
    log "Environment: ${ENVIRONMENT}"
    log "Version: ${VERSION}"
    log "Registry: ${DOCKER_REGISTRY}"
    
    check_dependencies
    build_images
    push_images
    deploy
    health_check
    cleanup
    
    success "Deployment process completed successfully! 🚀"
}

# Handle script arguments
case "${1:-}" in
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        main
        ;;
esac