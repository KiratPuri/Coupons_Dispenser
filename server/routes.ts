import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mobileNumberSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { parse } from "csv-parse/sync";

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  
  record.count++;
  return false;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed'));
      }
    }
  });

  // Rate limiting middleware (temporarily disabled for testing)
  // app.use("/api/coupon", (req, res, next) => {
  //   const ip = req.ip || req.connection.remoteAddress || "unknown";
  //   
  //   if (isRateLimited(ip)) {
  //     const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  //     return res.status(429).json({
  //       success: false,
  //       error: "Rate limit exceeded",
  //       message: "Too many requests. Please try again later.",
  //       retryAfter: "60 seconds",
  //       requestUrl: fullUrl
  //     });
  //   }
  //   
  //   next();
  // });

  // GET /api/coupon - Get coupon for mobile number
  app.get("/api/coupon", async (req, res) => {
    try {
      const { mobileNumber } = req.query;
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

      // If no mobile number provided, return test code
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

      // Validate mobile number if provided
      const validation = mobileNumberSchema.safeParse({ mobileNumber });
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: "Invalid mobile number",
          message: validation.error.errors[0]?.message || "Mobile number format is invalid",
          details: validation.error.errors,
          requestUrl: fullUrl
        });
      }

      const validatedMobile = validation.data.mobileNumber;

      // Check if mobile number already has a coupon
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

      // Get next available coupon
      const unusedCoupons = await storage.getUnusedCoupons();
      if (unusedCoupons.length === 0) {
        return res.status(410).json({
          success: false,
          error: "No coupons available",
          message: "All coupon codes have been distributed. Please contact support.",
          requestUrl: fullUrl
        });
      }

      // Use the first available coupon
      const selectedCoupon = unusedCoupons[0];
      
      // Mark coupon as used and create distribution record
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
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request",
        requestUrl: fullUrl
      });
    }
  });

  // GET /api/admin/stats - Get distribution statistics
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const allCoupons = await storage.getAllCoupons();
      const allDistributions = await storage.getAllDistributions();
      const unusedCoupons = await storage.getUnusedCoupons();

      res.json({
        success: true,
        data: {
          totalCoupons: allCoupons.length,
          distributedCoupons: allDistributions.length,
          availableCoupons: unusedCoupons.length,
          distributionRate: allCoupons.length > 0 ? (allDistributions.length / allCoupons.length * 100).toFixed(2) : "0.00"
        }
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "Failed to fetch statistics",
        requestUrl: fullUrl
      });
    }
  });

  // GET /api/admin/distributions - Get all distributions
  app.get("/api/admin/distributions", async (req, res) => {
    try {
      const distributions = await storage.getAllDistributionsWithCoupons();
      
      res.json({
        success: true,
        data: distributions.map(dist => ({
          id: dist.id,
          mobileNumber: dist.mobileNumber,
          couponCode: dist.coupon.code,
          distributedAt: dist.distributedAt
        }))
      });
    } catch (error) {
      console.error("Error fetching distributions:", error);
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "Failed to fetch distributions",
        requestUrl: fullUrl
      });
    }
  });

  // GET /api/admin/coupons - Get all coupons
  app.get("/api/admin/coupons", async (req, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      
      res.json({
        success: true,
        data: coupons.map(coupon => ({
          id: coupon.id,
          code: coupon.code,
          isUsed: coupon.isUsed,
          createdAt: coupon.createdAt
        }))
      });
    } catch (error) {
      console.error("Error fetching coupons:", error);
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "Failed to fetch coupons",
        requestUrl: fullUrl
      });
    }
  });

  // POST /api/admin/upload-coupons - Upload coupons via CSV
  app.post("/api/admin/upload-coupons", upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
          message: "Please select a CSV file to upload",
          requestUrl: fullUrl
        });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      
      // Parse CSV content
      let records;
      try {
        records = parse(csvContent, {
          columns: false,
          skip_empty_lines: true,
          trim: true
        });
      } catch (parseError) {
        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        return res.status(400).json({
          success: false,
          error: "Invalid CSV format",
          message: "Failed to parse CSV file. Please ensure it's properly formatted.",
          requestUrl: fullUrl
        });
      }

      if (records.length === 0) {
        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        return res.status(400).json({
          success: false,
          error: "Empty file",
          message: "The CSV file appears to be empty",
          requestUrl: fullUrl
        });
      }

      // Clear existing coupons and distributions
      await storage.clearAllCoupons();

      // Process each record and create coupons
      const addedCoupons = [];
      const errors = [];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        // Handle both single column and multi-column CSV (take first column)
        const couponCode = Array.isArray(record) ? record[0] : record;
        
        if (!couponCode || typeof couponCode !== 'string') {
          errors.push(`Row ${i + 1}: Invalid coupon code`);
          continue;
        }

        const trimmedCode = couponCode.trim();
        if (trimmedCode.length === 0) {
          errors.push(`Row ${i + 1}: Empty coupon code`);
          continue;
        }

        // Validate coupon code format (alphanumeric + some special chars)
        if (!/^[A-Za-z0-9_-]+$/.test(trimmedCode)) {
          errors.push(`Row ${i + 1}: Invalid characters in coupon code "${trimmedCode}"`);
          continue;
        }

        try {
          const newCoupon = await storage.createCoupon({ code: trimmedCode });
          addedCoupons.push(newCoupon);
        } catch (error) {
          errors.push(`Row ${i + 1}: Failed to add coupon "${trimmedCode}"`);
        }
      }

      res.json({
        success: true,
        data: {
          totalProcessed: records.length,
          successfullyAdded: addedCoupons.length,
          errors: errors.length,
          errorDetails: errors
        },
        message: `Successfully uploaded ${addedCoupons.length} coupon codes${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
      });

    } catch (error) {
      console.error("Error uploading coupons:", error);
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred while processing the CSV file",
        requestUrl: fullUrl
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
