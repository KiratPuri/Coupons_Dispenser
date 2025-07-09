# CouponAPI Deployment Guide

## Package Contents

Your complete deployable CouponAPI package includes:

### Core Application Files
- `server/` - Express.js backend API
- `client/` - React frontend application
- `shared/` - TypeScript schemas and types
- `package.json` - Dependencies and build scripts

### Configuration Files
- `vite.config.ts` - Frontend build configuration
- `tailwind.config.ts` - Styling configuration
- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - CSS processing

### Deployment Files
- `Dockerfile` - Docker containerization
- `Procfile` - Heroku deployment
- `vercel.json` - Vercel deployment
- `app.json` - Platform app configuration
- `deploy.sh` - Automated setup script

## Quick Deployment Options

### Option 1: Local/VPS Deployment
```bash
# Extract package and navigate
cd deployment-package

# Run automated setup
./deploy.sh

# Start application
npm start
```

### Option 2: Docker Deployment
```bash
cd deployment-package
docker build -t coupon-api .
docker run -p 5000:5000 coupon-api
```

### Option 3: Heroku Deployment
```bash
cd deployment-package
git init
heroku create your-app-name
git add .
git commit -m "Initial deployment"
git push heroku main
```

### Option 4: Vercel Deployment
```bash
cd deployment-package
npm install -g vercel
vercel --prod
```

## Features Included

✅ **Core API Functions**
- Mobile number validation (Indian format)
- Unique coupon distribution
- One coupon per mobile number guarantee
- Rate limiting protection

✅ **Web Interface**
- User-friendly coupon request page
- Real-time form validation
- Responsive design

✅ **Admin Dashboard**
- Distribution statistics
- Coupon management
- CSV bulk upload
- Distribution history

✅ **API Documentation**
- Interactive documentation page
- Request/response examples
- Error code explanations

✅ **Production Ready**
- Memory-based storage (no database required)
- Error handling and logging
- Security features
- Performance optimizations

## Environment Configuration

The application uses these environment variables:
- `NODE_ENV=production`
- `PORT=5000` (configurable)

## API Endpoints

Once deployed, your API will be available at:

- `GET /` - Main application interface
- `GET /api/coupon?mobileNumber={number}` - Get coupon code
- `GET /admin` - Admin dashboard
- `GET /api-docs` - API documentation
- `GET /api/admin/stats` - Statistics
- `GET /api/admin/distributions` - Distribution history
- `GET /api/admin/coupons` - Coupon list
- `POST /api/admin/upload-coupons` - CSV upload

## Support

This package is completely self-contained and requires no external database setup. The memory storage system automatically initializes with 25 preset coupon codes and handles all data persistence during runtime.

For any deployment issues, ensure Node.js 16+ is installed and all dependencies are properly installed via `npm install`.