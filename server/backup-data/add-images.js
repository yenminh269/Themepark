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

// High-quality images from Unsplash that match each item
const itemImages = {
  'Velocity Valley T-Shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
  'Theme Park Baseball Cap': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop',
  'Plush Mascot Toy': 'https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=500&h=500&fit=crop',
  'Souvenir Mug': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=500&fit=crop',
  'Water Bottle': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop',
  'Keychain Set': 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=500&h=500&fit=crop',
  'Hot Dog': 'https://images.unsplash.com/photo-1612392062798-2badb1d11835?w=500&h=500&fit=crop',
  'Soft Drink': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&h=500&fit=crop',
  'Popcorn Bucket': 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=500&h=500&fit=crop',
  'Ice Cream Cone': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&h=500&fit=crop'
};

async function addImageColumn() {
  try {
    console.log('\n🖼️  Adding image_url column to merchandise table...\n');

    // Add image_url column if it doesn't exist
    await new Promise((resolve, reject) => {
      db.query(`
        ALTER TABLE merchandise
        ADD COLUMN image_url VARCHAR(500) DEFAULT NULL
      `, (err, result) => {
        if (err) {
          // Check if column already exists
          if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('✓ image_url column already exists');
            resolve(result);
          } else {
            reject(err);
          }
        } else {
          console.log('✓ Added image_url column');
          resolve(result);
        }
      });
    });

    console.log('\n📸 Updating merchandise with image URLs...\n');

    // Update each item with its image
    for (const [itemName, imageUrl] of Object.entries(itemImages)) {
      await new Promise((resolve, reject) => {
        db.query(
          'UPDATE merchandise SET image_url = ? WHERE name = ?',
          [imageUrl, itemName],
          (err, result) => {
            if (err) reject(err);
            else {
              if (result.affectedRows > 0) {
                console.log(`✓ ${itemName}: ${imageUrl}`);
              } else {
                console.log(`⚠ ${itemName}: Not found in database`);
              }
              resolve(result);
            }
          }
        );
      });
    }

    // Verify
    console.log('\n✅ Verifying images...\n');
    const items = await new Promise((resolve, reject) => {
      db.query('SELECT item_id, name, image_url FROM merchandise ORDER BY name', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log('📊 Merchandise items with images:');
    items.forEach(item => {
      const status = item.image_url ? '✓' : '✗';
      console.log(`   ${status} ID ${item.item_id}: ${item.name}`);
    });

    const withImages = items.filter(i => i.image_url).length;
    console.log(`\n✅ Done! ${withImages}/${items.length} items have images`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.end();
    process.exit(0);
  }
}

addImageColumn();
