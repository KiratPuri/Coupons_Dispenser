import { db } from "./db";
import { coupons } from "@shared/schema";

async function initializeDatabase() {
  try {
    // Check if coupons already exist
    const existingCoupons = await db.select().from(coupons);
    
    if (existingCoupons.length === 0) {
      console.log("Initializing database with preset coupon codes...");
      
      const presetCodes = [
        "SAVE10", "WELCOME20", "FIRST15", "SPECIAL25", "BONUS30",
        "DEAL40", "OFFER35", "DISCOUNT50", "PROMO12", "GIFT18",
        "LUCKY7", "MEGA60", "SUPER45", "ULTRA20", "PREMIUM25",
        "ELITE30", "GOLD40", "SILVER15", "BRONZE10", "DIAMOND50",
        "RUBY35", "EMERALD25", "SAPPHIRE20", "PEARL15", "CRYSTAL30"
      ];

      for (const code of presetCodes) {
        await db.insert(coupons).values({ code });
      }
      
      console.log(`Successfully added ${presetCodes.length} coupon codes to the database.`);
    } else {
      console.log(`Database already contains ${existingCoupons.length} coupon codes.`);
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

export { initializeDatabase };