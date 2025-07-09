const express = require('express');

// Import routes directly without the problematic vite.ts file
const { storage } = require('./storage');
const { mobileNumberSchema } = require('../shared/schema');

let app = null;

// Rate limiting storage
const rateLimitStore = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  const record = rateLimitStore.get(ip);
  if (now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count++;
  return false;
}

async function createApp() {
  if (app) return app;
  
  app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Main coupon endpoint
  app.get('/api/coupon', async (req, res) => {
    try {
      const { mobileNumber } = req.query;
      const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

      if (isRateLimited(clientIp)) {
        return res.status(429).json({
          success: false,
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
          retryAfter: "60 seconds"
        });
      }

      if (!mobileNumber || mobileNumber === '') {
        return res.json({
          success: true,
          data: {
            mobileNumber: "N/A",
            couponCode: "Test Code",
            distributedAt: new Date(),
            message: "Test coupon code provided (no mobile number required)"
          }
        });
      }

      const validation = mobileNumberSchema.safeParse({ mobileNumber });
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: "Invalid mobile number",
          message: validation.error.errors[0]?.message || "Mobile number format is invalid",
          details: validation.error.errors
        });
      }

      const validatedMobile = validation.data.mobileNumber;
      const existingDistribution = await storage.getDistributionWithCoupon(validatedMobile);
      
      if (existingDistribution) {
        return res.json({
          success: true,
          data: {
            mobileNumber: validatedMobile,
            couponCode: existingDistribution.coupon.code,
            distributedAt: existingDistribution.distributedAt,
            message: "Coupon already distributed to this mobile number"
          }
        });
      }

      const unusedCoupons = await storage.getUnusedCoupons();
      if (unusedCoupons.length === 0) {
        return res.status(410).json({
          success: false,
          error: "No coupons available",
          message: "All coupon codes have been distributed. Please contact support."
        });
      }

      const selectedCoupon = unusedCoupons[0];
      await storage.markCouponAsUsed(selectedCoupon.id);
      const distribution = await storage.createDistribution({
        mobileNumber: validatedMobile,
        couponId: selectedCoupon.id
      });

      res.json({
        success: true,
        data: {
          mobileNumber: validatedMobile,
          couponCode: selectedCoupon.code,
          distributedAt: distribution.distributedAt,
          message: "Coupon successfully distributed"
        }
      });

    } catch (error) {
      console.error("Error distributing coupon:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });

  // Admin endpoints
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const allCoupons = await storage.getAllCoupons();
      const distributions = await storage.getAllDistributions();
      
      const totalCoupons = allCoupons.length;
      const distributedCoupons = distributions.length;
      const availableCoupons = totalCoupons - distributedCoupons;
      const distributionRate = totalCoupons > 0 ? ((distributedCoupons / totalCoupons) * 100).toFixed(1) + '%' : '0%';

      res.json({
        success: true,
        data: {
          totalCoupons,
          distributedCoupons,
          availableCoupons,
          distributionRate
        }
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });

  app.get('/api/admin/distributions', async (req, res) => {
    try {
      const distributions = await storage.getAllDistributionsWithCoupons();
      const formattedDistributions = distributions.map(dist => ({
        id: dist.id,
        mobileNumber: dist.mobileNumber,
        couponCode: dist.coupon.code,
        distributedAt: dist.distributedAt
      }));

      res.json({
        success: true,
        data: formattedDistributions
      });
    } catch (error) {
      console.error("Error fetching distributions:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });

  app.get('/api/admin/coupons', async (req, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.json({
        success: true,
        data: coupons
      });
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });

  return app;
}

module.exports = async function handler(req, res) {
  const app = await createApp();
  return app(req, res);
};