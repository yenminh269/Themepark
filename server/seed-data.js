import db from './config/db.js';

// Sample data to populate the database
const sampleData = {
  stores: [
    {
      name: 'Main Gift Shop',
      type: 'merchandise',
      description: 'Your one-stop shop for Velocity Valley souvenirs and apparel',
      status: 'open',
      open_time: '09:00:00',
      close_time: '21:00:00',
      photo_path: '/uploads/store_photos/main_gift_shop.jpg'
    },
    {
      name: 'East Gift Shop',
      type: 'merchandise',
      description: 'Located near the east entrance with unique collectibles',
      status: 'open',
      open_time: '10:00:00',
      close_time: '20:00:00',
      photo_path: '/uploads/store_photos/east_gift_shop.jpg'
    },
    {
      name: 'Main Concession Stand',
      type: 'food/drink',
      description: 'Fresh food and beverages right in the heart of the park',
      status: 'open',
      open_time: '10:00:00',
      close_time: '22:00:00',
      photo_path: '/uploads/store_photos/main_concession.jpg'
    },
    {
      name: 'Poolside Snacks',
      type: 'food/drink',
      description: 'Cool drinks and snacks by the water park',
      status: 'open',
      open_time: '11:00:00',
      close_time: '19:00:00',
      photo_path: '/uploads/store_photos/poolside_snacks.jpg'
    }
  ],

  merchandise: [
    {
      name: 'Velocity Valley T-Shirt',
      price: 24.99,
      quantity: 100,
      description: 'Official Velocity Valley theme park t-shirt with logo',
      type: 'apparel'
    },
    {
      name: 'Theme Park Baseball Cap',
      price: 19.99,
      quantity: 75,
      description: 'Adjustable baseball cap with embroidered logo',
      type: 'apparel'
    },
    {
      name: 'Plush Mascot Toy',
      price: 34.99,
      quantity: 50,
      description: 'Soft plush toy of our famous Velocity character',
      type: 'toys'
    },
    {
      name: 'Souvenir Mug',
      price: 12.99,
      quantity: 80,
      description: 'Ceramic mug with Velocity Valley logo',
      type: 'drinkware'
    },
    {
      name: 'Water Bottle',
      price: 15.99,
      quantity: 60,
      description: 'Insulated water bottle with park design',
      type: 'accessories'
    },
    {
      name: 'Keychain Set',
      price: 8.99,
      quantity: 120,
      description: 'Set of 3 themed keychains',
      type: 'accessories'
    },
    {
      name: 'Hot Dog',
      price: 6.99,
      quantity: 200,
      description: 'Classic park hot dog with condiments',
      type: 'snacks'
    },
    {
      name: 'Soft Drink',
      price: 3.99,
      quantity: 300,
      description: 'Refreshing soda in various flavors',
      type: 'beverages'
    },
    {
      name: 'Popcorn Bucket',
      price: 7.99,
      quantity: 90,
      description: 'Large bucket of freshly popped popcorn',
      type: 'snacks'
    },
    {
      name: 'Ice Cream Cone',
      price: 4.99,
      quantity: 150,
      description: 'Vanilla ice cream in a waffle cone',
      type: 'snacks'
    }
  ]
};

// Function to seed the database
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Insert stores
    console.log('📍 Inserting stores...');
    for (const store of sampleData.stores) {
      await new Promise((resolve, reject) => {
        const sql = `
          INSERT INTO store (name, type, description, status, open_time, close_time, photo_path)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sql, [
          store.name,
          store.type,
          store.description,
          store.status,
          store.open_time,
          store.close_time,
          store.photo_path
        ], (err, result) => {
          if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
              console.log(`Store "${store.name}" already exists, skipping...`);
              resolve();
            } else {
              reject(err);
            }
          } else {
            console.log(`✓ Added store: ${store.name}`);
            resolve(result);
          }
        });
      });
    }

    // Insert merchandise
    console.log('🛍️ Inserting merchandise...');
    for (const item of sampleData.merchandise) {
      await new Promise((resolve, reject) => {
        const sql = `
          INSERT INTO merchandise (name, price, quantity, description, type)
          VALUES (?, ?, ?, ?, ?)
        `;
        db.query(sql, [
          item.name,
          item.price,
          item.quantity,
          item.description,
          item.type
        ], (err, result) => {
          if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
              console.log(`Item "${item.name}" already exists, skipping...`);
              resolve();
            } else {
              reject(err);
            }
          } else {
            console.log(`✓ Added merchandise: ${item.name}`);
            resolve(result);
          }
        });
      });
    }

    // Create inventory relationships
    console.log('📦 Setting up store inventory...');

    // Get all stores and merchandise
    const stores = await new Promise((resolve, reject) => {
      db.query('SELECT store_id, name, type FROM store', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const merchandise = await new Promise((resolve, reject) => {
      db.query('SELECT item_id, name, type FROM merchandise', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // Create inventory for each store based on type
    for (const store of stores) {
      const relevantItems = merchandise.filter(item => {
        if (store.type === 'merchandise') {
          return ['apparel', 'toys', 'accessories', 'drinkware'].includes(item.type);
        } else if (store.type === 'food/drink') {
          return ['snacks', 'beverages'].includes(item.type);
        }
        return false;
      });

      for (const item of relevantItems) {
        const stockQuantity = Math.floor(Math.random() * 20) + 5; // Random stock between 5-25

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
      }

      console.log(`✓ Set up inventory for store: ${store.name}`);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - ${sampleData.stores.length} stores added`);
    console.log(`   - ${sampleData.merchandise.length} merchandise items added`);
    console.log(`   - Inventory relationships established`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    db.end();
  }
}

// Run the seeding function
seedDatabase();
