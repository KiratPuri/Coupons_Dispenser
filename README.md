# CouponAPI - Deployable Package

## Overview
Complete coupon distribution REST API with web interface and admin dashboard. Distributes unique coupon codes to mobile numbers with one-per-number guarantee.

## Features
- ✅ Mobile number validation (Indian format support)
- ✅ Unique coupon code distribution
- ✅ Admin dashboard with statistics
- ✅ CSV bulk coupon upload
- ✅ Rate limiting protection
- ✅ Web interface for testing
- ✅ API documentation
- ✅ Memory storage (no database required)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Application
```bash
npm run build
```

### 3. Start Production Server
```bash
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Get Coupon Code
```
GET /api/coupon?mobileNumber={number}
```

### Admin Endpoints
- `GET /api/admin/stats` - View statistics
- `GET /api/admin/distributions` - View all distributions
- `GET /api/admin/coupons` - View all coupons
- `POST /api/admin/upload-coupons` - Upload CSV file

## Web Interface
- `/` - Main coupon request page
- `/admin` - Admin dashboard
- `/api-docs` - API documentation

## Environment Variables
```bash
NODE_ENV=production
PORT=5000
```

## Deployment Options

### Docker
```bash
docker build -t coupon-api .
docker run -p 5000:5000 coupon-api
```

### Heroku
```bash
git init
heroku create your-app-name
git add .
git commit -m "Initial commit"
git push heroku main
```

### DigitalOcean/AWS/Vercel
Upload the entire package and run:
```bash
npm install
npm run build
npm start
```

## File Structure
```
deployment-package/
├── package.json          # Dependencies and scripts
├── server/               # Backend API
├── client/               # Frontend React app
├── shared/               # Shared types and schemas
├── dist/                 # Built application (after npm run build)
├── Dockerfile           # Docker configuration
└── README.md            # This file
```

## Support
This package includes everything needed for deployment. No database setup required - uses reliable in-memory storage.