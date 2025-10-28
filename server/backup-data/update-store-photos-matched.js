import db from '../config/db.js';

// Photos that actually match the store descriptions
const storePhotos = {
  // Main Gift Shop: "Your one-stop shop for Velocity Valley souvenirs and apparel"
  'Main Gift Shop': 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop&q=80',

  // East Gift Shop: "Located near the east entrance with unique collectibles"
  'East Gift Shop': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80',

  // Main Concession Stand: "Fresh food and beverages right in the heart of the park"
  'Main Concession Stand': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&q=80',

  // Poolside Snacks: "Cool drinks and snacks by the water park"
  'Poolside Snacks': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&q=80',

  // Additional stores from original seed
  'Wonder Trinkets': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80',
  'Magic Market': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop&q=80'
};

// More specific photos that better match descriptions
const betterMatchedPhotos = {
  'Main Gift Shop': 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop&q=80', // Apparel and souvenirs store
  'East Gift Shop': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', // Unique collectibles shop
  'Main Concession Stand': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&q=80', // Food court/concession
  'Poolside Snacks': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80'  // Poolside bar area
};

async function updateStorePhotosToMatchDescriptions() {
  try {
    console.log('🖼️ Updating store photos to match their descriptions...');

    // Get all stores
    const stores = await new Promise((resolve, reject) => {
      db.query('SELECT store_id, name, description FROM store WHERE deleted_at IS NULL', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log(`Found ${stores.length} stores to update`);

    for (const store of stores) {
      // Use the better matched photos based on store descriptions
      const photoUrl = betterMatchedPhotos[store.name];

      if (photoUrl) {
        await new Promise((resolve, reject) => {
          const sql = 'UPDATE store SET photo_path = ? WHERE store_id = ?';
          db.query(sql, [photoUrl, store.store_id], (err, result) => {
            if (err) reject(err);
            else {
              console.log(`✅ Updated "${store.name}"`);
              console.log(`   Description: "${store.description.substring(0, 50)}..."`);
              console.log(`   Photo: ${photoUrl.substring(0, 60)}...`);
              console.log('');
              resolve(result);
            }
          });
        });
      } else {
        console.log(`⚠️ No specific photo found for "${store.name}", keeping existing photo`);
      }
    }

    console.log('🎉 Store photos updated to match descriptions!');

    // Verify the updates
    const updatedStores = await new Promise((resolve, reject) => {
      db.query('SELECT name, description, photo_path FROM store WHERE deleted_at IS NULL', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log('\n📋 Final store photos:');
    updatedStores.forEach(store => {
      console.log(`🏪 ${store.name}`);
      console.log(`   📝 "${store.description}"`);
      console.log(`   🖼️ ${store.photo_path}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error updating store photos:', error);
    process.exit(1);
  } finally {
    db.end();
  }
}

// Run the update function
updateStorePhotosToMatchDescriptions();
