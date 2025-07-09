# Vercel Monorepo Deployment Guide

## Project Structure

This CouponAPI package is now optimized for Vercel monorepo deployment:

```
deployment-package/
├── package.json              # Root package.json (required by Vercel)
├── vercel.json               # Vercel configuration
├── api/                      # Serverless functions directory
│   └── index.js             # Main API handler (built from server/)
├── server/                   # Backend source code
│   ├── index.ts             # Express server
│   ├── vercel-adapter.ts    # Vercel serverless adapter
│   ├── routes.ts            # API routes
│   └── ...                  # Other server files
├── client/                   # Frontend source code
│   └── src/                 # React application
├── shared/                   # Shared TypeScript types
└── dist/                     # Built frontend (output directory)
    └── public/              # Static files served by Vercel
```

## Deployment Steps

### 1. Prepare for Deployment
```bash
cd deployment-package
npm install
npm run vercel-build
```

### 2. Deploy to Vercel

**Option A: Vercel CLI**
```bash
npm install -g vercel
vercel --prod
```

**Option B: GitHub Integration**
1. Push code to GitHub repository
2. Connect repository to Vercel dashboard
3. Configure build settings (auto-detected)

### 3. Vercel Configuration

The `vercel.json` file includes:

- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist/public`
- **API Functions**: Serverless functions in `api/` directory
- **Routing**: Proper routing for SPA + API

### 4. Environment Variables

Set these in Vercel dashboard:
```
NODE_ENV=production
```

## How It Works

### Frontend (SPA)
- Built with Vite to `dist/public/`
- Served as static files by Vercel CDN
- React Router handles client-side routing

### Backend (Serverless API)
- Express app adapted for Vercel serverless functions
- All `/api/*` routes handled by `api/index.js`
- Memory storage system (no database required)
- Automatic scaling and cold start optimization

### Build Process
1. `build:client` - Builds React frontend to `dist/public/`
2. `build:server` - Bundles Express server to `api/index.js`
3. Vercel deploys both as optimized static + serverless setup

## Features Included

✅ **API Endpoints**
- `GET /api/coupon` - Coupon distribution
- `GET /api/admin/*` - Admin dashboard APIs
- `POST /api/admin/upload-coupons` - CSV upload

✅ **Web Interface**
- `/` - Main coupon request page
- `/admin` - Admin dashboard
- `/api-docs` - API documentation

✅ **Production Optimizations**
- CDN static file serving
- Serverless function optimization
- Automatic HTTPS and custom domains
- Global edge network deployment

## Post-Deployment

After successful deployment:
1. Your API will be available at `https://your-app.vercel.app`
2. All endpoints work exactly as in development
3. Memory storage resets with each serverless function cold start
4. Performance is optimized for global access

## Troubleshooting

**Build Failures**
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel dashboard

**API Not Working**
- Verify `/api` routes in Vercel functions tab
- Check serverless function logs

**Frontend Issues**
- Ensure `dist/public/` contains built files
- Check routing configuration in `vercel.json`

This deployment structure follows Vercel's best practices for monorepo applications with serverless backend and static frontend.