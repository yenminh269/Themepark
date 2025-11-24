import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// POST /zone - Create a new zone
router.post('/', async (req, res) => {
  const { zone_name } = req.body;

  if (!zone_name) {
    return res.status(400).json({
      message: 'Zone name is required',
      required: ['zone_name']
    });
  }

  try {
    const sql = 'INSERT INTO zone (zone_name) VALUES (?)';

    const result = await new Promise((resolve, reject) => {
      db.query(sql, [zone_name], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.status(201).json({
      message: 'Zone created successfully',
      data: {
        zone_id: result.insertId,
        zone_name: zone_name
      }
    });
  } catch (err) {
    console.error('Error creating zone:', err);
    return res.status(500).json({
      message: 'Error creating zone',
      error: err.message
    });
  }
});

// GET /zone - Get all zones with their assignments
router.get('/', async (req, res) => {
  const sql = `
    SELECT
      z.zone_id,
      z.zone_name,
      (COALESCE(ride_count, 0) + COALESCE(store_count, 0)) as total_assignments,
      COALESCE(ride_count, 0) as ride_count,
      COALESCE(store_count, 0) as store_count
    FROM zone z
    LEFT JOIN (
      SELECT zone_id, COUNT(*) as ride_count
      FROM zone_ride_assignment
      GROUP BY zone_id
    ) zra ON z.zone_id = zra.zone_id
    LEFT JOIN (
      SELECT zone_id, COUNT(*) as store_count
      FROM zone_store_assignment
      GROUP BY zone_id
    ) zsa ON z.zone_id = zsa.zone_id
    ORDER BY z.zone_name
  `;

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json({
      message: 'Zones retrieved successfully',
      data: results,
      count: results.length
    });
  } catch (err) {
    console.error('Error fetching zones:', err);
    return res.status(500).json({
      message: 'Error fetching zones',
      error: err.message
    });
  }
});

// GET /zone/assignments - Get all zone assignments with details
router.get('/assignments', async (req, res) => {
  const sqlRides = `
    SELECT
      CONCAT('ride_', zra.zone_id, '_', zra.ride_id) as assignment_id,
      zra.zone_id,
      z.zone_name,
      zra.ride_id,
      r.name as ride_name,
      NULL as store_id,
      NULL as store_name,
      'Ride' as assignment_type
    FROM zone_ride_assignment zra
    INNER JOIN zone z ON zra.zone_id = z.zone_id
    INNER JOIN ride r ON zra.ride_id = r.ride_id
  `;

  const sqlStores = `
    SELECT
      CONCAT('store_', zsa.zone_id, '_', zsa.store_id) as assignment_id,
      zsa.zone_id,
      z.zone_name,
      NULL as ride_id,
      NULL as ride_name,
      zsa.store_id,
      s.name as store_name,
      'Store' as assignment_type
    FROM zone_store_assignment zsa
    INNER JOIN zone z ON zsa.zone_id = z.zone_id
    INNER JOIN store s ON zsa.store_id = s.store_id
  `;

  const sql = `
    (${sqlRides})
    UNION ALL
    (${sqlStores})
    ORDER BY zone_name, assignment_type, COALESCE(ride_name, store_name)
  `;

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json({
      message: 'Zone assignments retrieved successfully',
      data: results,
      count: results.length
    });
  } catch (err) {
    console.error('Error fetching zone assignments:', err);
    return res.status(500).json({
      message: 'Error fetching zone assignments',
      error: err.message
    });
  }
});

// GET /zone/details - Get all zones with full ride and store details for park map
router.get('/details', async (req, res) => {
  try {
    // Get all zones
    const zones = await new Promise((resolve, reject) => {
      db.query('SELECT zone_id, zone_name FROM zone ORDER BY zone_name', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // For each zone, get rides and stores with full details
    const zoneDetails = await Promise.all(zones.map(async (zone) => {
      // Get rides for this zone
      const rides = await new Promise((resolve, reject) => {
        const sql = `
          SELECT r.*
          FROM ride r
          INNER JOIN zone_ride_assignment zra ON r.ride_id = zra.ride_id
          WHERE zra.zone_id = ?
          ORDER BY r.name
        `;
        db.query(sql, [zone.zone_id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      // Get stores for this zone
      const stores = await new Promise((resolve, reject) => {
        const sql = `
          SELECT s.*
          FROM store s
          INNER JOIN zone_store_assignment zsa ON s.store_id = zsa.store_id
          WHERE zsa.zone_id = ?
          ORDER BY s.name
        `;
        db.query(sql, [zone.zone_id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      return {
        ...zone,
        rides: rides,
        stores: stores
      };
    }));

    res.json({
      message: 'Zone details retrieved successfully',
      data: zoneDetails,
      count: zoneDetails.length
    });
  } catch (err) {
    console.error('Error fetching zone details:', err);
    return res.status(500).json({
      message: 'Error fetching zone details',
      error: err.message
    });
  }
});

// POST /zone/assign - Assign a ride or store to a zone
router.post('/assign', async (req, res) => {
  const { zone_id, ride_id, store_id } = req.body;

  // Validate: must have zone_id and either ride_id or store_id (but not both)
  if (!zone_id) {
    return res.status(400).json({
      message: 'Zone ID is required'
    });
  }

  if (!ride_id && !store_id) {
    return res.status(400).json({
      message: 'Either ride_id or store_id must be provided'
    });
  }

  if (ride_id && store_id) {
    return res.status(400).json({
      message: 'Cannot assign both ride and store in the same assignment'
    });
  }

  try {
    // Check if zone exists
    const zoneCheck = await new Promise((resolve, reject) => {
      db.query('SELECT EXISTS (SELECT 1 FROM zone WHERE zone_id = ?) as zone_exists',
        [zone_id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
    });

    if (!zoneCheck[0].zone_exists) {
      return res.status(404).json({
        message: 'Zone does not exist',
        zone_id: zone_id
      });
    }

    // Handle ride assignment
    if (ride_id) {
      const rideCheck = await new Promise((resolve, reject) => {
        db.query('SELECT EXISTS (SELECT 1 FROM ride WHERE ride_id = ?) as ride_exists',
          [ride_id], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
      });

      if (!rideCheck[0].ride_exists) {
        return res.status(404).json({
          message: 'Ride does not exist',
          ride_id: ride_id
        });
      }

      // Insert ride assignment (will fail if already exists due to PRIMARY KEY constraint)
      const sql = 'INSERT INTO zone_ride_assignment (zone_id, ride_id) VALUES (?, ?)';
      try {
        await new Promise((resolve, reject) => {
          db.query(sql, [zone_id, ride_id], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({
            message: 'This ride is already assigned to this zone'
          });
        }
        throw err;
      }

      return res.status(201).json({
        message: 'Assignment created successfully',
        data: {
          zone_id: zone_id,
          ride_id: ride_id,
          assignment_type: 'Ride'
        }
      });
    }

    // Handle store assignment
    if (store_id) {
      const storeCheck = await new Promise((resolve, reject) => {
        db.query('SELECT EXISTS (SELECT 1 FROM store WHERE store_id = ?) as store_exists',
          [store_id], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
      });

      if (!storeCheck[0].store_exists) {
        return res.status(404).json({
          message: 'Store does not exist',
          store_id: store_id
        });
      }

      // Insert store assignment (will fail if already exists due to PRIMARY KEY constraint)
      const sql = 'INSERT INTO zone_store_assignment (zone_id, store_id) VALUES (?, ?)';
      try {
        await new Promise((resolve, reject) => {
          db.query(sql, [zone_id, store_id], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({
            message: 'This store is already assigned to this zone'
          });
        }
        throw err;
      }

      return res.status(201).json({
        message: 'Assignment created successfully',
        data: {
          zone_id: zone_id,
          store_id: store_id,
          assignment_type: 'Store'
        }
      });
    }
  } catch (err) {
    console.error('Error creating zone assignment:', err);
    return res.status(500).json({
      message: 'Error creating zone assignment',
      error: err.message
    });
  }
});

// DELETE /zone/assign/ride/:zoneId/:rideId - Remove a ride zone assignment
router.delete('/assign/ride/:zoneId/:rideId', async (req, res) => {
  const { zoneId, rideId } = req.params;

  try {
    const sql = 'DELETE FROM zone_ride_assignment WHERE zone_id = ? AND ride_id = ?';

    const result = await new Promise((resolve, reject) => {
      db.query(sql, [zoneId, rideId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Ride assignment not found'
      });
    }

    res.json({
      message: 'Ride assignment removed successfully',
      zone_id: parseInt(zoneId),
      ride_id: parseInt(rideId)
    });
  } catch (err) {
    console.error('Error removing ride assignment:', err);
    return res.status(500).json({
      message: 'Error removing ride assignment',
      error: err.message
    });
  }
});

// DELETE /zone/assign/store/:zoneId/:storeId - Remove a store zone assignment
router.delete('/assign/store/:zoneId/:storeId', async (req, res) => {
  const { zoneId, storeId } = req.params;

  try {
    const sql = 'DELETE FROM zone_store_assignment WHERE zone_id = ? AND store_id = ?';

    const result = await new Promise((resolve, reject) => {
      db.query(sql, [zoneId, storeId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Store assignment not found'
      });
    }

    res.json({
      message: 'Store assignment removed successfully',
      zone_id: parseInt(zoneId),
      store_id: parseInt(storeId)
    });
  } catch (err) {
    console.error('Error removing store assignment:', err);
    return res.status(500).json({
      message: 'Error removing store assignment',
      error: err.message
    });
  }
});

// DELETE /zone/:zoneId - Delete a zone (only if no assignments exist)
router.delete('/:zoneId', async (req, res) => {
  const { zoneId } = req.params;

  try {
    // Check if zone has any ride assignments
    const rideAssignmentCheck = await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) as count FROM zone_ride_assignment WHERE zone_id = ?',
        [zoneId], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
    });

    // Check if zone has any store assignments
    const storeAssignmentCheck = await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) as count FROM zone_store_assignment WHERE zone_id = ?',
        [zoneId], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
    });

    const totalAssignments = rideAssignmentCheck[0].count + storeAssignmentCheck[0].count;

    if (totalAssignments > 0) {
      return res.status(409).json({
        message: 'Cannot delete zone with existing assignments. Please remove all assignments first.',
        assignment_count: totalAssignments
      });
    }

    const sql = 'DELETE FROM zone WHERE zone_id = ?';

    const result = await new Promise((resolve, reject) => {
      db.query(sql, [zoneId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Zone not found'
      });
    }

    res.json({
      message: 'Zone deleted successfully',
      zone_id: zoneId
    });
  } catch (err) {
    console.error('Error deleting zone:', err);
    return res.status(500).json({
      message: 'Error deleting zone',
      error: err.message
    });
  }
});

export default router;
