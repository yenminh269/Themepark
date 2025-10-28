import mysql from 'mysql';
import "dotenv/config";

// Create a dedicated connection for this script
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
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to the MySQL server.');
});

async function insertInventory() {
  try {
    console.log('🔍 Fetching stores from database...');

    // Get all stores
    const stores = await new Promise((resolve, reject) => {
      db.query('SELECT store_id, name, type FROM store WHERE deleted_at IS NULL', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log(`📍 Found ${stores.length} stores:`);
    stores.forEach(s => console.log(`   - ${s.name} (${s.type})`));

    console.log('\n🔍 Fetching merchandise from database...');

    // Get all merchandise
    const merchandise = await new Promise((resolve, reject) => {
      db.query('SELECT item_id, name, type FROM merchandise', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log(`🛍️  Found ${merchandise.length} merchandise items:`);
    merchandise.forEach(m => console.log(`   - ${m.name} (${m.type})`));

    console.log('\n📦 Inserting inventory data...');

    let insertCount = 0;

    // For each store, add appropriate items to inventory
    for (const store of stores) {
      console.log(`\n🏪 Processing store: ${store.name} (${store.type})`);

      // Determine which items belong to this store type
      const relevantItems = merchandise.filter(item => {
        if (store.type === 'merchandise') {
          // Merchandise stores get: apparel, toys, accessories, drinkware
          return ['apparel', 'toys', 'accessories', 'drinkware'].includes(item.type);
        } else if (store.type === 'food/drink') {
          // Food/drink stores get: snacks, beverages
          return ['snacks', 'beverages'].includes(item.type);
        }
        return false;
      });

      console.log(`   Found ${relevantItems.length} relevant items for this store`);

      for (const item of relevantItems) {
        // Generate random stock quantity between 10 and 30
        const stockQuantity = Math.floor(Math.random() * 21) + 10;

        try {
          await new Promise((resolve, reject) => {
            const sql = `
              INSERT INTO store_inventory (store_id, item_id, stock_quantity)
              VALUES (?, ?, ?)
              ON DUPLICATE KEY UPDATE stock_quantity = VALUES(stock_quantity)
            `;

            db.query(sql, [store.store_id, item.item_id, stockQuantity], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });

          console.log(`   ✓ Added ${item.name} (stock: ${stockQuantity})`);
          insertCount++;
        } catch (err) {
          console.log(`   ✗ Failed to add ${item.name}: ${err.message}`);
        }
      }
    }

    console.log('\n✅ Inventory insertion completed!');
    console.log(`📊 Summary:`);
    console.log(`   - ${stores.length} stores processed`);
    console.log(`   - ${merchandise.length} total merchandise items`);
    console.log(`   - ${insertCount} inventory entries created/updated`);

    // Verify the data
    console.log('\n🔍 Verifying inventory data...');
    const inventoryCount = await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) as count FROM store_inventory', (err, results) => {
        if (err) reject(err);
        else resolve(results[0].count);
      });
    });

    console.log(`✅ Total inventory records in database: ${inventoryCount}`);

  } catch (error) {
    console.error('❌ Error inserting inventory:', error);
    process.exit(1);
  } finally {
    db.end();
    console.log('\n👋 Database connection closed.');
    process.exit(0);
  }
}

// Run the function
insertInventory();
