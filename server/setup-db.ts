import { Pool } from 'pg';

async function setupDatabase() {
  const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432'),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Setting up database tables...');
    
    // Create coupons table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(255) NOT NULL UNIQUE,
        is_used BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create coupon_distributions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupon_distributions (
        id SERIAL PRIMARY KEY,
        mobile_number VARCHAR(255) NOT NULL UNIQUE,
        coupon_id INTEGER NOT NULL REFERENCES coupons(id),
        distributed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if we need to add initial coupons
    const result = await pool.query('SELECT COUNT(*) FROM coupons');
    const couponCount = parseInt(result.rows[0].count);

    if (couponCount === 0) {
      console.log('Adding initial coupon codes...');
      const presetCodes = [
        "SAVE10", "WELCOME20", "FIRST15", "SPECIAL25", "BONUS30",
        "DEAL40", "OFFER35", "DISCOUNT50", "PROMO12", "GIFT18",
        "LUCKY7", "MEGA60", "SUPER45", "ULTRA20", "PREMIUM25",
        "ELITE30", "GOLD40", "SILVER15", "BRONZE10", "DIAMOND50",
        "RUBY35", "EMERALD25", "SAPPHIRE20", "PEARL15", "CRYSTAL30"
      ];

      for (const code of presetCodes) {
        await pool.query('INSERT INTO coupons (code) VALUES ($1)', [code]);
      }
      
      console.log(`Successfully added ${presetCodes.length} coupon codes.`);
    } else {
      console.log(`Database already contains ${couponCount} coupon codes.`);
    }

    console.log('Database setup completed successfully.');
    await pool.end();
    return true;
  } catch (error) {
    console.error('Database setup failed:', error);
    await pool.end();
    return false;
  }
}

export { setupDatabase };