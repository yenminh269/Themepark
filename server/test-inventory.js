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
  console.log('Connected!');
});

const storeId = 3;
const sql = `
  SELECT si.store_id, si.item_id, si.stock_quantity,
         m.name as item_name, m.price, m.type as item_type
  FROM store_inventory si
  JOIN merchandise m ON si.item_id = m.item_id
  WHERE si.store_id = ?
  ORDER BY m.name
`;

db.query(sql, [storeId], (err, results) => {
  if (err) {
    console.error('Query error:', err);
    process.exit(1);
  }

  console.log(`\n=== Store ${storeId} Inventory ===`);
  console.log(`Total items: ${results.length}`);
  console.log('\nFirst 5 items:');
  results.slice(0, 5).forEach(r => {
    console.log(`  - ${r.item_name} (store_id: ${r.store_id}, stock: ${r.stock_quantity})`);
  });

  // Check if all items are for this store
  const wrongStore = results.filter(r => r.store_id != storeId);
  if (wrongStore.length > 0) {
    console.log(`\n⚠️  WARNING: Found ${wrongStore.length} items from other stores!`);
  } else {
    console.log(`\n✅ All items belong to store ${storeId}`);
  }

  db.end();
  process.exit(0);
});
