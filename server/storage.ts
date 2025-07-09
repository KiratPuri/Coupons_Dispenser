import { coupons, couponDistributions, type Coupon, type InsertCoupon, type Distribution, type InsertDistribution } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getCoupon(id: number): Promise<Coupon | undefined>;
  getAllCoupons(): Promise<Coupon[]>;
  getUnusedCoupons(): Promise<Coupon[]>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  markCouponAsUsed(id: number): Promise<Coupon | undefined>;
  clearAllCoupons(): Promise<void>;
  
  getDistribution(mobileNumber: string): Promise<Distribution | undefined>;
  getAllDistributions(): Promise<Distribution[]>;
  createDistribution(distribution: InsertDistribution): Promise<Distribution>;
  
  getDistributionWithCoupon(mobileNumber: string): Promise<(Distribution & { coupon: Coupon }) | undefined>;
  getAllDistributionsWithCoupons(): Promise<(Distribution & { coupon: Coupon })[]>;
}

export class DatabaseStorage implements IStorage {
  async getCoupon(id: number): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon || undefined;
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons);
  }

  async getUnusedCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons).where(eq(coupons.isUsed, false));
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const [coupon] = await db
      .insert(coupons)
      .values(insertCoupon)
      .returning();
    return coupon;
  }

  async markCouponAsUsed(id: number): Promise<Coupon | undefined> {
    const [updatedCoupon] = await db
      .update(coupons)
      .set({ isUsed: true })
      .where(eq(coupons.id, id))
      .returning();
    return updatedCoupon || undefined;
  }

  async clearAllCoupons(): Promise<void> {
    await db.delete(couponDistributions);
    await db.delete(coupons);
  }

  async getDistribution(mobileNumber: string): Promise<Distribution | undefined> {
    const [distribution] = await db
      .select()
      .from(couponDistributions)
      .where(eq(couponDistributions.mobileNumber, mobileNumber));
    return distribution || undefined;
  }

  async getAllDistributions(): Promise<Distribution[]> {
    return await db.select().from(couponDistributions);
  }

  async createDistribution(insertDistribution: InsertDistribution): Promise<Distribution> {
    const [distribution] = await db
      .insert(couponDistributions)
      .values(insertDistribution)
      .returning();
    return distribution;
  }

  async getDistributionWithCoupon(mobileNumber: string): Promise<(Distribution & { coupon: Coupon }) | undefined> {
    const result = await db
      .select({
        id: couponDistributions.id,
        mobileNumber: couponDistributions.mobileNumber,
        couponId: couponDistributions.couponId,
        distributedAt: couponDistributions.distributedAt,
        coupon: coupons
      })
      .from(couponDistributions)
      .innerJoin(coupons, eq(couponDistributions.couponId, coupons.id))
      .where(eq(couponDistributions.mobileNumber, mobileNumber));

    const row = result[0];
    if (row) {
      return {
        id: row.id,
        mobileNumber: row.mobileNumber,
        couponId: row.couponId,
        distributedAt: row.distributedAt,
        coupon: row.coupon
      };
    }
    return undefined;
  }

  async getAllDistributionsWithCoupons(): Promise<(Distribution & { coupon: Coupon })[]> {
    const result = await db
      .select({
        id: couponDistributions.id,
        mobileNumber: couponDistributions.mobileNumber,
        couponId: couponDistributions.couponId,
        distributedAt: couponDistributions.distributedAt,
        coupon: coupons
      })
      .from(couponDistributions)
      .innerJoin(coupons, eq(couponDistributions.couponId, coupons.id));

    return result.map(row => ({
      id: row.id,
      mobileNumber: row.mobileNumber,
      couponId: row.couponId,
      distributedAt: row.distributedAt,
      coupon: row.coupon
    }));
  }
}

import { MemoryStorage } from './memory-storage';

export const storage = new MemoryStorage();
