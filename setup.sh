#!/bin/bash

# Function to check if a command was successful
check_error() {
    if [ $? -ne 0 ]; then
        echo "Error: $1"
        exit 1
    fi
}

echo "Setting up Online Examination Platform..."

# Create necessary directories
echo "Creating directories..."
mkdir -p server/uploads/{videos,course,temp}
check_error "Failed to create directories"

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm cache clean --force
npm config set registry https://registry.npmmirror.com
npm install
check_error "Failed to install server dependencies"

# Install client dependencies
echo "Installing client dependencies..."
cd ../client
npm cache clean --force
npm config set registry https://registry.npmmirror.com
npm install
check_error "Failed to install client dependencies"

# Start MongoDB service
echo "Starting MongoDB service..."
sudo systemctl start mongod
sudo systemctl enable mongod
check_error "Failed to start MongoDB"

# Start Redis service
echo "Starting Redis service..."
sudo systemctl start redis-server
sudo systemctl enable redis-server
check_error "Failed to start Redis"

# Create uploads directory and set permissions
echo "Setting up uploads directory..."
cd ../server
mkdir -p uploads/{videos,course,temp}
chmod -R 755 uploads
check_error "Failed to set up uploads directory"

echo "Setup completed successfully!"
echo "To start the application:"
echo "1. Terminal 1: cd server && npm run dev"
echo "2. Terminal 2: cd client && npm start"
