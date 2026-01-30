#!/bin/bash

echo "🌿 Starting Sage Chat Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed"
    exit 1
fi

# Check if Redis is running
if ! command -v redis-cli &> /dev/null; then
    echo "Redis CLI not found. Make sure Redis is installed and running."
    echo "You can install Redis with: brew install redis (on macOS)"
    echo "   Then start it with: brew services start redis"
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
./venv/bin/pip install -r requirements.txt

# Check Redis connection
echo "Checking Redis connection..."
redis-cli ping > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "Redis is running"
else
    echo "Redis is not running. Starting Redis..."
    # Try to start Redis
    if command -v brew &> /dev/null; then
        brew services start redis
        sleep 2
    else
        echo "Please start Redis manually: redis-server"
        echo "The backend will still work but without message persistence."
    fi
fi

# Set environment variables
export DEBUG=True
export LOG_LEVEL=INFO

echo "Starting FastAPI server..."
echo "   Server will be available at: http://localhost:8000"
echo "   WebSocket endpoint: ws://localhost:8000/chat/ws"
echo "   Health check: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"

# Start the server
./venv/bin/python main.py