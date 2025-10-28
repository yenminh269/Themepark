import mysql from 'mysql';
import "dotenv/config";

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true }
});

db.connect((err) => {
  if (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

async function checkDuplicates() {
  try {
    console.log('\n🔍 Checking merchandise table for duplicates...\n');

    // Get all merchandise with counts
    const merchandise = await new Promise((resolve, reject) => {
      db.query(`
        SELECT name, type, COUNT(*) as count, GROUP_CONCAT(item_id) as item_ids
        FROM merchandise
        GROUP BY name, type
        HAVING count > 1
        ORDER BY name
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (merchandise.length === 0) {
      console.log('✅ No duplicate merchandise items found!');
    } else {
      console.log(`⚠️  Found ${merchandise.length} duplicate merchandise items:\n`);
      merchandise.forEach(m => {
        console.log(`   ${m.name} (${m.type}): ${m.count} copies (IDs: ${m.item_ids})`);
      });
    }

    // Show total count
    const totalCount = await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) as count FROM merchandise', (err, results) => {
        if (err) reject(err);
        else resolve(results[0].count);
      });
    });

    console.log(`\n📊 Total merchandise items in database: ${totalCount}`);
    console.log(`   Expected: 10 unique items`);
    console.log(`   Actual: ${totalCount} items`);

    // Show store inventory counts
    console.log('\n📦 Inventory per store:');
    const inventoryCounts = await new Promise((resolve, reject) => {
      db.query(`
        SELECT s.store_id, s.name, s.type, COUNT(DISTINCT si.item_id) as item_count
        FROM store s
        LEFT JOIN store_inventory si ON s.store_id = si.store_id
        WHERE s.deleted_at IS NULL
        GROUP BY s.store_id, s.name, s.type
        ORDER BY s.store_id
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    inventoryCounts.forEach(s => {
      console.log(`   Store ${s.store_id}: ${s.name} (${s.type}) - ${s.item_count} unique items`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.end();
    process.exit(0);
  }
}

checkDuplicates();
