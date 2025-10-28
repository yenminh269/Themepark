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

async function addOnlineFlag() {
  try {
    console.log('\n🛒 Adding online shopping configuration...\n');

    // Add available_online column
    console.log('1️⃣  Adding available_online column to store table...');
    await new Promise((resolve, reject) => {
      db.query(`
        ALTER TABLE store
        ADD COLUMN available_online BOOLEAN DEFAULT TRUE
      `, (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('   ✓ Column already exists');
            resolve(result);
          } else {
            reject(err);
          }
        } else {
          console.log('   ✓ Column added successfully');
          resolve(result);
        }
      });
    });

    // Update stores based on type
    console.log('\n2️⃣  Configuring stores...\n');

    // Merchandise stores = Available online
    const merchandiseUpdate = await new Promise((resolve, reject) => {
      db.query(`
        UPDATE store
        SET available_online = TRUE
        WHERE type = 'merchandise'
      `, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    console.log(`   ✅ Merchandise stores: ONLINE shopping enabled (${merchandiseUpdate.affectedRows} stores)`);

    // Food/drink stores = In-park only
    const foodUpdate = await new Promise((resolve, reject) => {
      db.query(`
        UPDATE store
        SET available_online = FALSE
        WHERE type = 'food/drink'
      `, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    console.log(`   🎢 Food/Drink stores: IN-PARK only (${foodUpdate.affectedRows} stores)`);

    // Show configuration
    console.log('\n3️⃣  Current store configuration:\n');
    const stores = await new Promise((resolve, reject) => {
      db.query(`
        SELECT store_id, name, type, available_online
        FROM store
        WHERE deleted_at IS NULL
        ORDER BY type, name
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    stores.forEach(s => {
      const badge = s.available_online ? '🌐 ONLINE' : '🎢 IN-PARK ONLY';
      console.log(`   ${badge} - ${s.name} (${s.type})`);
    });

    console.log('\n✅ Configuration complete!\n');
    console.log('📝 Summary:');
    console.log('   • Merchandise stores: Can be purchased online');
    console.log('   • Food/Drink stores: Must visit park to purchase');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.end();
    process.exit(0);
  }
}

addOnlineFlag();
