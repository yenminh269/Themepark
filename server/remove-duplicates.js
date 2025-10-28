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

async function removeDuplicates() {
  try {
    console.log('\n🧹 Cleaning up duplicate merchandise...\n');

    // Find duplicates (keep the one with lower ID, remove higher ID)
    const duplicates = await new Promise((resolve, reject) => {
      db.query(`
        SELECT m1.item_id as keep_id, m2.item_id as remove_id, m1.name, m1.type
        FROM merchandise m1
        JOIN merchandise m2 ON m1.name = m2.name AND m1.type = m2.type AND m1.item_id < m2.item_id
        ORDER BY m1.name
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      db.end();
      process.exit(0);
      return;
    }

    console.log(`Found ${duplicates.length} duplicate pairs to clean:\n`);
    duplicates.forEach(d => {
      console.log(`   ${d.name} (${d.type}): Keeping ID ${d.keep_id}, removing ID ${d.remove_id}`);
    });

    // Remove inventory entries for duplicate items
    console.log('\n🗑️  Removing duplicate inventory entries...');
    for (const dup of duplicates) {
      await new Promise((resolve, reject) => {
        db.query('DELETE FROM store_inventory WHERE item_id = ?', [dup.remove_id], (err, result) => {
          if (err) reject(err);
          else {
            console.log(`   Removed ${result.affectedRows} inventory entries for item ID ${dup.remove_id}`);
            resolve(result);
          }
        });
      });
    }

    // Delete duplicate merchandise items
    console.log('\n🗑️  Removing duplicate merchandise items...');
    const removeIds = duplicates.map(d => d.remove_id);
    await new Promise((resolve, reject) => {
      db.query(`DELETE FROM merchandise WHERE item_id IN (${removeIds.join(',')})`, (err, result) => {
        if (err) reject(err);
        else {
          console.log(`   Removed ${result.affectedRows} duplicate merchandise items`);
          resolve(result);
        }
      });
    });

    // Verify cleanup
    console.log('\n✅ Cleanup complete! Verifying...\n');

    const finalCount = await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) as count FROM merchandise', (err, results) => {
        if (err) reject(err);
        else resolve(results[0].count);
      });
    });

    console.log(`📊 Merchandise count: ${finalCount} (should be 10)`);

    // Show inventory per store
    const inventoryCounts = await new Promise((resolve, reject) => {
      db.query(`
        SELECT s.store_id, s.name, COUNT(si.item_id) as item_count
        FROM store s
        LEFT JOIN store_inventory si ON s.store_id = si.store_id
        WHERE s.deleted_at IS NULL
        GROUP BY s.store_id, s.name
        ORDER BY s.store_id
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log('\n📦 Inventory per store:');
    inventoryCounts.forEach(s => {
      console.log(`   ${s.name}: ${s.item_count} items`);
    });

    console.log('\n✅ All done!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.end();
    process.exit(0);
  }
}

removeDuplicates();
