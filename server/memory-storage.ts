import { IStorage } from './storage';
import type { Coupon, InsertCoupon, Distribution, InsertDistribution } from '@shared/schema';

export class MemoryStorage implements IStorage {
  private coupons: Map<number, Coupon> = new Map();
  private distributions: Map<string, Distribution> = new Map();
  private nextCouponId = 1;
  private nextDistributionId = 1;

  constructor() {
    // Initialize with preset coupon codes
    const presetCodes = [
      "SAVE10", "WELCOME20", "FIRST15", "SPECIAL25", "BONUS30",
      "DEAL40", "OFFER35", "DISCOUNT50", "PROMO12", "GIFT18",
      "LUCKY7", "MEGA60", "SUPER45", "ULTRA20", "PREMIUM25",
      "ELITE30", "GOLD40", "SILVER15", "BRONZE10", "DIAMOND50",
      "RUBY35", "EMERALD25", "SAPPHIRE20", "PEARL15", "CRYSTAL30"
    ];

    presetCodes.forEach(code => {
      const coupon: Coupon = {
        id: this.nextCouponId++,
        code,
        isUsed: false,
        createdAt: new Date()
      };
      this.coupons.set(coupon.id, coupon);
    });
  }

  async getCoupon(id: number): Promise<Coupon | undefined> {
    return this.coupons.get(id);
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return Array.from(this.coupons.values());
  }

  async getUnusedCoupons(): Promise<Coupon[]> {
    return Array.from(this.coupons.values()).filter(coupon => !coupon.isUsed);
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const coupon: Coupon = {
      id: this.nextCouponId++,
      code: insertCoupon.code,
      isUsed: false,
      createdAt: new Date()
    };
    this.coupons.set(coupon.id, coupon);
    return coupon;
  }

  async markCouponAsUsed(id: number): Promise<Coupon | undefined> {
    const coupon = this.coupons.get(id);
    if (coupon) {
      coupon.isUsed = true;
      this.coupons.set(id, coupon);
      return coupon;
    }
    return undefined;
  }

  async clearAllCoupons(): Promise<void> {
    this.coupons.clear();
    this.nextCouponId = 1;
  }

  async getDistribution(mobileNumber: string): Promise<Distribution | undefined> {
    return this.distributions.get(mobileNumber);
  }

  async getAllDistributions(): Promise<Distribution[]> {
    return Array.from(this.distributions.values());
  }

  async createDistribution(insertDistribution: InsertDistribution): Promise<Distribution> {
    const distribution: Distribution = {
      id: this.nextDistributionId++,
      mobileNumber: insertDistribution.mobileNumber,
      couponId: insertDistribution.couponId,
      distributedAt: new Date()
    };
    this.distributions.set(insertDistribution.mobileNumber, distribution);
    return distribution;
  }

  async getDistributionWithCoupon(mobileNumber: string): Promise<(Distribution & { coupon: Coupon }) | undefined> {
    const distribution = this.distributions.get(mobileNumber);
    if (distribution) {
      const coupon = this.coupons.get(distribution.couponId);
      if (coupon) {
        return { ...distribution, coupon };
      }
    }
    return undefined;
  }

  async getAllDistributionsWithCoupons(): Promise<(Distribution & { coupon: Coupon })[]> {
    const results: (Distribution & { coupon: Coupon })[] = [];
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