
const express = require('express');

// Memory storage implementation
class MemoryStorage {
  constructor() {
    this.coupons = new Map();
    this.distributions = new Map();
    this.nextCouponId = 1;
    this.nextDistributionId = 1;

    // Initialize with preset coupon codes
    const presetCodes = [
      "SAVE10", "WELCOME20", "FIRST15", "SPECIAL25", "BONUS30",
      "DEAL40", "OFFER35", "DISCOUNT50", "PROMO12", "GIFT18",
      "LUCKY7", "MEGA60", "SUPER45", "ULTRA20", "PREMIUM25",
      "ELITE30", "GOLD40", "SILVER15", "BRONZE10", "DIAMOND50",
      "RUBY35", "EMERALD25", "SAPPHIRE20", "PEARL15", "CRYSTAL30"
    ];

    presetCodes.forEach(code => {
      const coupon = {
        id: this.nextCouponId++,
        code,
        isUsed: false,
        createdAt: new Date()
      };
      this.coupons.set(coupon.id, coupon);
    });
  }

  async getCoupon(id) {
    return this.coupons.get(id);
  }

  async getAllCoupons() {
    return Array.from(this.coupons.values());
  }

  async getUnusedCoupons() {
    return Array.from(this.coupons.values()).filter(coupon => !coupon.isUsed);
  }

  async createCoupon(insertCoupon) {
    const coupon = {
      id: this.nextCouponId++,
      code: insertCoupon.code,
      isUsed: false,
      createdAt: new Date()
    };
    this.coupons.set(coupon.id, coupon);
    return coupon;
  }

  async markCouponAsUsed(id) {
    const coupon = this.coupons.get(id);
    if (coupon) {
      coupon.isUsed = true;
      this.coupons.set(id, coupon);
      return coupon;
    }
    return undefined;
  }

  async getDistribution(mobileNumber) {
    return this.distributions.get(mobileNumber);
  }

  async getAllDistributions() {
    return Array.from(this.distributions.values());
  }

  async createDistribution(insertDistribution) {
    const distribution = {
      id: this.nextDistributionId++,
      mobileNumber: insertDistribution.mobileNumber,
      couponId: insertDistribution.couponId,
      distributedAt: new Date()
    };
    this.distributions.set(insertDistribution.mobileNumber, distribution);
    return distribution;
  }

  async getDistributionWithCoupon(mobileNumber) {
    const distribution = this.distributions.get(mobileNumber);
    if (distribution) {
      const coupon = this.coupons.get(distribution.couponId);
      if (coupon) {
        return { ...distribution, coupon };
      }
    }
    return undefined;
  }

  async getAllDistributionsWithCoupons() {
    const results = [];
    const distributionArray = Array.from(this.distributions.values());
    for (const distribution of distributionArray) {
      const coupon = this.coupons.get(distribution.couponId);
      if (coupon) {
        results.push({ ...distribution, coupon });
      }
    }
    return results;
  }
}

// Mobile number validation
function validateMobileNumber(mobileNumber) {
  const cleanNumber = String(mobileNumber).replace(/[^0-9+]/g, '');
  
  if (cleanNumber.startsWith('+91')) {
    const number = cleanNumber.substring(3);
    return number.length === 10 && /^[6-9]/.test(number) ? `91${number}` : null;
  } else if (cleanNumber.startsWith('91')) {
    const number = cleanNumber.substring(2);
    return number.length === 10 && /^[6-9]/.test(number) ? cleanNumber : null;
  } else if (cleanNumber.length === 10 && /^[6-9]/.test(cleanNumber)) {
    return `91${cleanNumber}`;
  } else if (cleanNumber.startsWith('+') && cleanNumber.length >= 10) {
    return cleanNumber.substring(1);
  }
  
  return null;
}

const storage = new MemoryStorage();
let app = null;

// Rate limiting
const rateLimitStore = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
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

function createApp() {
  if (app) return app;
  
  app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // CORS
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

      const validatedMobile = validateMobileNumber(mobileNumber);
      if (!validatedMobile) {
        return res.status(400).json({
          success: false,
          error: "Invalid mobile number",
          message: "Invalid mobile number. Supported formats: +919996275888, 919996275888, 9996275888, or international numbers"
        });
      }

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
  const app = createApp();
  return app(req, res);
};
