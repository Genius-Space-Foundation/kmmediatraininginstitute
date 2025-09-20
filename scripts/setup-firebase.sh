#!/bin/bash

# Firebase Setup Script for KM Media Application
# This script helps automate the Firebase project setup process

set -e

echo "🔥 Firebase Setup Script for KM Media Application"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Firebase CLI is installed
check_firebase_cli() {
    print_status "Checking Firebase CLI installation..."
    
    if command -v firebase &> /dev/null; then
        print_success "Firebase CLI is installed"
        firebase --version
    else
        print_error "Firebase CLI is not installed"
        echo "Please install it using: npm install -g firebase-tools"
        exit 1
    fi
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    
    if command -v node &> /dev/null; then
        print_success "Node.js is installed"
        node --version
    else
        print_error "Node.js is not installed"
        echo "Please install Node.js from https://nodejs.org/"
        exit 1
    fi
}

# Install Firebase dependencies
install_dependencies() {
    print_status "Installing Firebase dependencies..."
    
    # Backend dependencies
    if [ -d "server" ]; then
        print_status "Installing backend dependencies..."
        cd server
        npm install firebase-admin
        cd ..
        print_success "Backend dependencies installed"
    else
        print_warning "Server directory not found, skipping backend dependencies"
    fi
    
    # Frontend dependencies
    if [ -d "client" ]; then
        print_status "Installing frontend dependencies..."
        cd client
        npm install firebase
        cd ..
        print_success "Frontend dependencies installed"
    else
        print_warning "Client directory not found, skipping frontend dependencies"
    fi
}

# Create environment files
create_env_files() {
    print_status "Creating environment configuration files..."
    
    # Backend environment file
    if [ -d "server" ]; then
        if [ ! -f "server/.env" ]; then
            cp server/env.firebase.example server/.env
            print_success "Created server/.env from template"
            print_warning "Please update server/.env with your Firebase credentials"
        else
            print_warning "server/.env already exists, skipping creation"
        fi
    fi
    
    # Frontend environment file
    if [ -d "client" ]; then
        if [ ! -f "client/.env" ]; then
            cp client/env.firebase.example client/.env
            print_success "Created client/.env from template"
            print_warning "Please update client/.env with your Firebase credentials"
        else
            print_warning "client/.env already exists, skipping creation"
        fi
    fi
}

# Initialize Firebase project
init_firebase() {
    print_status "Initializing Firebase project..."
    
    # Check if firebase.json exists
    if [ -f "firebase.json" ]; then
        print_warning "firebase.json already exists, skipping initialization"
        return
    fi
    
    # Initialize Firebase
    firebase init firestore --project default
    
    print_success "Firebase project initialized"
}

# Deploy security rules
deploy_rules() {
    print_status "Deploying Firestore security rules..."
    
    if [ -f "firestore.rules" ]; then
        firebase deploy --only firestore:rules
        print_success "Security rules deployed"
    else
        print_warning "firestore.rules not found, skipping deployment"
        echo "Please copy the rules from server/migration/firestore-security-rules.rules to firestore.rules"
    fi
}

# Test Firebase connection
test_connection() {
    print_status "Testing Firebase connection..."
    
    if [ -f "server/test-firebase-connection.js" ]; then
        cd server
        node test-firebase-connection.js
        cd ..
        print_success "Firebase connection test completed"
    else
        print_warning "Firebase connection test script not found"
    fi
}

# Main execution
main() {
    echo
    print_status "Starting Firebase setup process..."
    echo
    
    # Check prerequisites
    check_node
    check_firebase_cli
    
    echo
    print_status "Installing dependencies..."
    install_dependencies
    
    echo
    print_status "Setting up environment files..."
    create_env_files
    
    echo
    print_status "Initializing Firebase project..."
    init_firebase
    
    echo
    print_status "Deploying security rules..."
    deploy_rules
    
    echo
    print_status "Testing connection..."
    test_connection
    
    echo
    print_success "Firebase setup completed!"
    echo
    echo "Next steps:"
    echo "1. Update your environment files with Firebase credentials"
    echo "2. Run the data migration scripts"
    echo "3. Test your application"
    echo
    echo "For detailed instructions, see FIREBASE_SETUP_GUIDE.md"
}

# Run main function
main "$@"

