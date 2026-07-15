#!/bin/bash

# Production Build and Deploy Script for ERD Visualizer
# This script builds the frontend and prepares the backend for production

set -e  # Exit on any error

echo "🚀 Starting production build process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Building frontend..."
cd frontend
npm install
npm run build
print_status "Frontend build completed"

cd ../backend
print_status "Installing backend dependencies..."
npm install --production

print_status "Creating production directories..."
mkdir -p ../data
mkdir -p ../logs

print_status "Setting up PM2..."
npm install -g pm2

print_status "Production build completed successfully!"
print_status "Next steps:"
echo "1. Upload the entire project to your EC2 instance"
echo "2. Run: cd backend && pm2 start ecosystem.config.js"
echo "3. Run: pm2 startup && pm2 save"
echo "4. Configure your security groups to allow HTTP traffic on port 80"

print_status "Build process completed! 🎉"
