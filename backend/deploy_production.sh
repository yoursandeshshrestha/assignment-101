#!/bin/bash

# Simple production deployment script using Python module execution
echo "🚀 Starting Swipe Interview API in production mode..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please ensure you have set the following environment variables:"
    echo "  - OPENAI_API_KEY"
    echo "  - PORT (optional, defaults to 7078)"
fi

# Install/update dependencies
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt

# Set production environment
export FLASK_ENV=production
export FLASK_DEBUG=False

# Get port from environment or use default
PORT=${PORT:-7078}

echo "🌐 Starting server on port $PORT using Python module..."

# Run with Gunicorn using Python module execution (works regardless of PATH)
python3 -m gunicorn --bind 0.0.0.0:$PORT \
         --workers 4 \
         --timeout 120 \
         --keep-alive 2 \
         --max-requests 1000 \
         --max-requests-jitter 100 \
         --access-logfile - \
         --error-logfile - \
         wsgi:app
