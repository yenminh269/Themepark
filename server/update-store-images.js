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

// PERFECT matching images from Unsplash
const storeImages = {
  // Gift shops - TOYS, SOUVENIRS, T-SHIRTS, MUGS, KEYCHAINS display
  'Main Gift Shop': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop', // Souvenir shop with toys and gifts
  'East Gift Shop': 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop', // Retail shop with merchandise on shelves

  // Food/Drink - HOT DOGS, BURGERS, POPCORN, SODAS, ICE CREAM
  'Main Concession Stand': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&h=600&fit=crop', // Food truck/concession stand
  'Poolside Snacks': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&h=600&fit=crop' // Poolside refreshments
};

async function updateStoreImages() {
  try {
    console.log('\n🖼️  Updating store images to match store names...\n');

    // Get current stores
    const stores = await new Promise((resolve, reject) => {
      db.query(`
        SELECT store_id, name, type, photo_path
        FROM store
        WHERE deleted_at IS NULL
        ORDER BY store_id
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log('📍 Current stores:');
    stores.forEach(s => {
      console.log(`   ${s.store_id}. ${s.name} (${s.type})`);
    });

    console.log('\n📸 Updating images...\n');

    // Update each store with matching image
    for (const store of stores) {
      const imageUrl = storeImages[store.name];

      if (imageUrl) {
        await new Promise((resolve, reject) => {
          db.query(
            'UPDATE store SET photo_path = ? WHERE store_id = ?',
            [imageUrl, store.store_id],
            (err, result) => {
              if (err) reject(err);
              else {
                console.log(`✓ ${store.name}: Updated with matching image`);
                resolve(result);
              }
            }
          );
        });
      } else {
        console.log(`⚠ ${store.name}: No matching image found (keeping current)`);
      }
    }

    // Verify
    console.log('\n✅ Verification:\n');
    const updatedStores = await new Promise((resolve, reject) => {
      db.query(`
        SELECT store_id, name, type, photo_path
        FROM store
        WHERE deleted_at IS NULL
        ORDER BY type, name
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log('🏪 Merchandise Stores:');
    updatedStores
      .filter(s => s.type === 'merchandise')
      .forEach(s => {
        console.log(`   ✓ ${s.name}`);
        console.log(`     ${s.photo_path}`);
      });

    console.log('\n🍔 Food/Drink Stores:');
    updatedStores
      .filter(s => s.type === 'food/drink')
      .forEach(s => {
        console.log(`   ✓ ${s.name}`);
        console.log(`     ${s.photo_path}`);
      });

    console.log('\n✅ All store images updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.end();
    process.exit(0);
  }
}

updateStoreImages();
