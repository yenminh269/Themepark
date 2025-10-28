import db from '../config/db.js';

// Real photo URLs for theme park rides
const ridePhotos = {
  'Roller Coaster': 'https://images.unsplash.com/photo-1594739584670-1e9be48f6ec3?w=800&h=600&fit=crop&q=80',
  'Ferris Wheel': 'https://images.unsplash.com/photo-1570993492903-ba4c3088f100?w=800&h=600&fit=crop&q=80',
  'Drop Tower': 'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=800&h=600&fit=crop&q=80',
  'Log Flume': 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&h=600&fit=crop&q=80',
  'Carousel': 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=800&h=600&fit=crop&q=80',
  'Bumper Cars': 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=800&h=600&fit=crop&q=80'
};

// Additional high-quality theme park ride photos
const backupRidePhotos = [
  'https://images.unsplash.com/photo-1594739584670-1e9be48f6ec3?w=800&h=600&fit=crop&q=80', // Roller coaster
  'https://images.unsplash.com/photo-1570993492903-ba4c3088f100?w=800&h=600&fit=crop&q=80', // Ferris wheel
  'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=800&h=600&fit=crop&q=80', // Drop tower
  'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&h=600&fit=crop&q=80', // Water ride
  'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=800&h=600&fit=crop&q=80', // Carousel
  'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=800&h=600&fit=crop&q=80', // Amusement ride
  'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&h=600&fit=crop&q=80', // Theme park ride
  'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=800&h=600&fit=crop&q=80', // Thrill ride
  'https://images.unsplash.com/photo-1570993492903-ba4c3088f100?w=800&h=600&fit=crop&q=80', // Observation wheel
  'https://images.unsplash.com/photo-1594739584670-1e9be48f6ec3?w=800&h=600&fit=crop&q=80'  // Coaster
];

async function updateRidePhotos() {
  try {
    console.log('🎢 Updating ride photos with real internet URLs...');

    // Get all rides
    const rides = await new Promise((resolve, reject) => {
      db.query('SELECT ride_id, name FROM ride', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log(`Found ${rides.length} rides to update`);

    let photoIndex = 0;
    for (const ride of rides) {
      // Use specific photo if available, otherwise use backup photos
      const photoUrl = ridePhotos[ride.name] || backupRidePhotos[photoIndex % backupRidePhotos.length];

      await new Promise((resolve, reject) => {
        const sql = 'UPDATE ride SET photo_path = ? WHERE ride_id = ?';
        db.query(sql, [photoUrl, ride.ride_id], (err, result) => {
          if (err) reject(err);
          else {
            console.log(`✅ Updated ${ride.name} with photo: ${photoUrl.substring(0, 50)}...`);
            resolve(result);
          }
        });
      });

      photoIndex++;
    }

    console.log('🎉 All ride photos updated successfully!');

    // Verify the updates
    const updatedRides = await new Promise((resolve, reject) => {
      db.query('SELECT name, photo_path FROM ride', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log('\n🎢 Updated ride photos:');
    updatedRides.forEach(ride => {
      console.log(`  ${ride.name}: ${ride.photo_path.substring(0, 60)}...`);
    });

  } catch (error) {
    console.error('❌ Error updating ride photos:', error);
    process.exit(1);
  } finally {
    db.end();
  }
}

// Run the update function
updateRidePhotos();
