#!/bin/bash

echo "🚀 Setting up PostgreSQL for KM Media Application"
echo "================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create .env file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating .env file for server..."
    cp server/env.example server/.env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Install PostgreSQL dependencies
echo "📦 Installing PostgreSQL dependencies..."
cd server
npm install pg @types/pg
cd ..

echo "🐳 Starting PostgreSQL database..."
docker-compose up -d postgres

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

echo "🔧 Creating database and tables..."
docker-compose up server

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. The PostgreSQL database is running on localhost:5432"
echo "2. Database name: kmmedia"
echo "3. Username: postgres"
echo "4. Password: postgres123"
echo "5. Start the application with: docker-compose up"
echo ""
echo "🔗 Default admin credentials:"
echo "   Email: admin@kmmedia.com"
echo "   Password: admin123"
echo ""
echo "🔗 Default trainer credentials:"
echo "   Email: trainer@kmmedia.com"
echo "   Password: trainer123"
