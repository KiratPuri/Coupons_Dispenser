import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const couponDistributions = pgTable("coupon_distributions", {
  id: serial("id").primaryKey(),
  mobileNumber: text("mobile_number").notNull().unique(),
  couponId: integer("coupon_id").notNull().references(() => coupons.id),
  distributedAt: timestamp("distributed_at").notNull().defaultNow(),
});

export const insertCouponSchema = createInsertSchema(coupons).pick({
  code: true,
});

export const insertDistributionSchema = createInsertSchema(couponDistributions).pick({
  mobileNumber: true,
  couponId: true,
});

export const mobileNumberSchema = z.object({
  mobileNumber: z.string()
    .transform(val => val.trim())
    .refine(val => {
      // Remove any spaces or special characters except +
      const cleaned = val.replace(/[^\d+]/g, '');
      
      // Handle Indian numbers with +91
      if (cleaned.startsWith('+91')) {
        const number = cleaned.slice(3); // Remove +91
        return number.length === 10 && /^[6-9]\d{9}$/.test(number);
      }
      
      // Handle Indian numbers with 91 (no +)
      if (cleaned.startsWith('91') && cleaned.length === 12) {
        const number = cleaned.slice(2); // Remove 91
        return /^[6-9]\d{9}$/.test(number);
      }
      
      // Handle 10-digit Indian numbers without country code
      if (cleaned.length === 10) {
        return /^[6-9]\d{9}$/.test(cleaned);
      }
      
      // Handle other international formats (+ followed by 1-4 digit country code + 8-14 digits)
      if (cleaned.startsWith('+')) {
        const withoutPlus = cleaned.slice(1);
        return /^[1-9]\d{7,17}$/.test(withoutPlus) && withoutPlus.length >= 8 && withoutPlus.length <= 18;
      }
      
      // Handle numbers without + that are 8-15 digits
      return /^[1-9]\d{7,14}$/.test(cleaned) && cleaned.length >= 8 && cleaned.length <= 15;
    }, "Invalid mobile number. Supported formats: +919996275888, 919996275888, 9996275888, or international numbers"),
});

export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;
export type InsertDistribution = z.infer<typeof insertDistributionSchema>;
export type Distribution = typeof couponDistributions.$inferSelect;
export type MobileNumberRequest = z.infer<typeof mobileNumberSchema>;
