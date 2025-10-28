import db from './config/db.js';

// Real photo URLs for theme park stores
const storePhotos = {
  'Main Gift Shop': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&q=80',
  'East Gift Shop': 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop&q=80',
  'Main Concession Stand': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&q=80',
  'Poolside Snacks': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80',
  'Wonder Trinkets': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80',
  'Magic Market': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop&q=80'
};

// Additional high-quality theme park store photos
const backupPhotos = [
  'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop&q=80', // Gift shop interior
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&q=80', // Store display
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', // Souvenir shop
  'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop&q=80', // Retail store
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&q=80', // Food court
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80', // Concession stand
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&q=80', // Snack bar
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&q=80'  // Food service
];

async function updateStorePhotos() {
  try {
    console.log('🖼️ Updating store photos with real internet URLs...');

    // Get all stores
    const stores = await new Promise((resolve, reject) => {
      db.query('SELECT store_id, name FROM store WHERE deleted_at IS NULL', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log(`Found ${stores.length} stores to update`);

    let photoIndex = 0;
    for (const store of stores) {
      // Use specific photo if available, otherwise use backup photos
      const photoUrl = storePhotos[store.name] || backupPhotos[photoIndex % backupPhotos.length];

      await new Promise((resolve, reject) => {
        const sql = 'UPDATE store SET photo_path = ? WHERE store_id = ?';
        db.query(sql, [photoUrl, store.store_id], (err, result) => {
          if (err) reject(err);
          else {
            console.log(`✅ Updated ${store.name} with photo: ${photoUrl.substring(0, 50)}...`);
            resolve(result);
          }
        });
      });

      photoIndex++;
    }

    console.log('🎉 All store photos updated successfully!');

    // Verify the updates
    const updatedStores = await new Promise((resolve, reject) => {
      db.query('SELECT name, photo_path FROM store WHERE deleted_at IS NULL', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log('\n📋 Updated store photos:');
    updatedStores.forEach(store => {
      console.log(`  ${store.name}: ${store.photo_path.substring(0, 60)}...`);
    });

  } catch (error) {
    console.error('❌ Error updating store photos:', error);
    process.exit(1);
  } finally {
    db.end();
  }
}

// Run the update function
updateStorePhotos();
