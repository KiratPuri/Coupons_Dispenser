#!/bin/bash

echo "🚀 CouponAPI Deployment Setup"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Create production environment file
if [ ! -f .env ]; then
    echo "📝 Creating production environment file..."
    cat > .env << EOF
NODE_ENV=production
PORT=5000
EOF
    echo "✅ Environment file created"
fi

echo ""
echo "🎉 Deployment setup complete!"
echo ""
echo "To start the application:"
echo "  npm start"
echo ""
echo "To run in development mode:"
echo "  npm run dev"
echo ""
echo "The API will be available at: http://localhost:5000"
echo ""
echo "Available endpoints:"
echo "  GET  /                     - Web interface"
echo "  GET  /api/coupon          - Get coupon code"
echo "  GET  /admin               - Admin dashboard"
echo "  GET  /api-docs            - API documentation"
echo ""