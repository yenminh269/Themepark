import express from 'express';
import db from '../config/db.js';
import { upload } from '../config/upload.js';

const router = express.Router();

// Add a new ride (supports both uploaded photo OR URL)
router.post('/add', upload.single('photo'), (req, res) => {
  const { name, price, capacity, description, open_time, close_time, photo_url } = req.body;
  // Decide which photo path to use
  let photo_path = null;
  if (photo_url && photo_url.startsWith('http')) {
    // user pasted a link
    photo_path = photo_url;
  } else if (req.file) {
    // user uploaded a file
    photo_path = `/uploads/ride_photos/${req.file.filename}`;
  }

  // Status is not required - database trigger sets it to 'open' automatically
  if (!name || !price || !capacity || !description || !open_time || !close_time || !photo_path) {
    return res.status(400).json({ message: 'All fields are required, including either photo or photo URL.' });
  }
  const sql = `
    INSERT INTO ride (name, price, capacity, description, open_time, close_time, photo_path)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;

  db.query(sql, [name, price, capacity, description, open_time, close_time, photo_path],
    (err, result) => {
      if (err) {
        console.error("Error inserting new ride:", err);
        return res.status(500).json({
          message: 'Error adding new ride',
          error: err.message
        });
      }
      res.status(201).json({
        message: 'Ride added successfully',
        rideId: result.insertId,
        photo_path
      });
    });
});

// Get all the rides
router.get('/', async (req, res) => {
  db.query(`SELECT * FROM ride WHERE deleted_at IS NULL;`, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Error fetching rides',
        error: err.message
      })
    }
    res.status(201).json({ data: results });
  });
});

// Get all deleted rides
router.get('/deleted', async (req, res) => {
  db.query(`SELECT * FROM ride WHERE deleted_at IS NOT NULL;`, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Error fetching deleted rides',
        error: err.message
      })
    }
    res.status(200).json({ data: results });
  });
});

// Get all the rides except photo
router.get('/except-photo', async (req, res) => {
  db.query(`SELECT ride_id, name, capacity, description, open_time, close_time, status FROM ride WHERE deleted_at IS NULL;`, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Error fetching rides except photo',
        error: err.message
      });
    }
    res.status(200).json({ data: results });
  });
});

// Get all ride names
router.get('/names', async (req, res) => {
  db.query(`SELECT name FROM ride WHERE deleted_at IS NULL;`, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Error fetching ride names',
        error: err.message
      });
    }
    res.status(200).json({ data: results });
  });
});

// Get average ride tickets sold per month
router.get('/avg-month', async (req, res) => {
  try {
    const sql = `
      SELECT AVG(monthly_tickets) as avg_tickets_per_month
      FROM (
        SELECT
          DATE_FORMAT(ro.order_date, '%Y-%m') as month,
          SUM(rod.number_of_tickets) as monthly_tickets
        FROM ride_order ro
        JOIN ride_order_detail rod ON ro.order_id = rod.order_id
        WHERE ro.status = 'completed'
        GROUP BY DATE_FORMAT(ro.order_date, '%Y-%m')
      ) as monthly_data
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching average ride tickets per month:', err);
        return res.status(500).json({
          message: 'Error fetching average ride tickets per month',
          error: err.message
        });
      }
      const avgTickets = results[0]?.avg_tickets_per_month || 0;
      res.json({ data: Math.round(avgTickets) });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch average tickets' });
  }
});

// Update a ride
router.put('/:id', upload.single('file'), (req, res) => {
  const { id } = req.params;
  const { name, price, capacity, description, open_time, close_time, photo_path, status } = req.body;

  // Check if this is a status-only update (for expansion request decisions)
  if (status && !name && !price && !capacity && !description && !open_time && !close_time) {
    // Status-only update for expansion request decisions
    const statusSql = 'UPDATE ride SET status = ? WHERE ride_id = ?';

    db.query(statusSql, [status, id], (err, result) => {
      if (err) {
        console.error("Error updating ride status:", err);
        return res.status(500).json({
          message: 'Error updating ride status',
          error: err.message
        });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Ride not found' });
      }

      // If status is approve_expand, record in expansion history
      if (status === 'approve_expand') {
        const historySQL = 'INSERT INTO ride_expansion_history (ride_id, expand_date) VALUES (?, NOW())';
        
        db.query(historySQL, [id], (historyErr) => {
          if (historyErr) {
            console.error("Error recording expansion history:", historyErr);
            // Still return success for status update even if history recording fails
            return res.status(200).json({
              message: 'Ride status updated successfully, but failed to record expansion history',
              rideId: id,
              status: status,
              warning: historyErr.message
            });
          }

          res.status(200).json({
            message: 'Ride status updated and expansion recorded successfully',
            rideId: id,
            status: status
          });
        });
      } else {
        res.status(200).json({
          message: 'Ride status updated successfully',
          rideId: id,
          status: status
        });
      }
    });
    return;
  }

  // Full ride update
  if (!name || !price || !capacity || !description || !open_time || !close_time) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }

  // Determine photo_path: use uploaded file if provided, otherwise use provided photo_path
  let finalPhotoPath = photo_path;
  if (req.file) {
    finalPhotoPath = `/uploads/ride_photos/${req.file.filename}`;
  }

  const sql = `
    UPDATE ride
    SET name = ?, price = ?, capacity = ?, description = ?, open_time = ?, close_time = ?, photo_path = ?
    WHERE ride_id = ?
  `;

  db.query(sql, [name, price, capacity, description, open_time, close_time, finalPhotoPath, id],
    (err, result) => {
      if (err) {
        console.error("Error updating ride:", err);
        return res.status(500).json({
          message: 'Error updating ride',
          error: err.message
        });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Ride not found' });
      }
      res.status(200).json({
        message: 'Ride updated successfully',
        rideId: id,
        photo_path: finalPhotoPath
      });
    });
});

// Delete a ride
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // First check if the ride has maintenance status
  // Ensuring that even if the frontend check is bypassed, the backend will still prevent deletion of rides under maintenance.
  const checkRideStatusSql = `SELECT status FROM ride WHERE ride_id = ?`;

  db.query(checkRideStatusSql, [id], (err, results) => {
    if (err) {
      console.error("Error checking ride status:", err);
      return res.status(500).json({
        message: 'Error checking ride status',
        error: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // If the ride has maintenance status, prevent deletion
    if (results[0].status === 'maintenance') {
      return res.status(400).json({
        message: 'Cannot delete ride. This ride is currently under maintenance.'
      });
    }

    // First delete from zone_ride_assignment if exists
    const deleteZoneAssignmentSql = `DELETE FROM zone_ride_assignment WHERE ride_id = ?`;

    db.query(deleteZoneAssignmentSql, [id], (err) => {
      if (err) {
        console.error("Error deleting zone assignment:", err);
        return res.status(500).json({
          message: 'Error deleting zone assignment',
          error: err.message
        });
      }

      // Proceed with soft delete of the ride
      const softDeleteSql = `
        UPDATE ride
        SET status = 'closed', deleted_at = NOW()
        WHERE ride_id = ?
      `;

      db.query(softDeleteSql, [id], (err, result) => {
        if (err) {
          console.error("Error deleting ride:", err);
          return res.status(500).json({
            message: 'Error deleting ride',
            error: err.message
          });
        }
        res.status(200).json({
          message: 'Ride deleted successfully',
          rideId: id
        });
      });
    });
  });
});

// Get maintenance schedules for all rides with maintenance status
router.get('/maintenance-schedules', async (req, res) => {
  const sql = `
    SELECT
      r.ride_id,
      r.name,
      m.scheduled_date,
      m.status as maintenance_status
    FROM ride r
    INNER JOIN maintenance m ON r.ride_id = m.ride_id
    WHERE r.status = 'maintenance'
    AND m.status IN ('scheduled')
  `;

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    console.error('Error fetching maintenance schedules:', err);
    return res.status(500).json({
      success: false,
      message: 'Error fetching maintenance schedules',
      error: err.message
    });
  }
});

// Get ride expansion history
router.get('/expansion-history', async (req, res) => {
  const sql = `
    SELECT r.name, reh.expand_date
    FROM ride_expansion_history as reh
    LEFT JOIN ride as r ON r.ride_id = reh.ride_id
    ORDER BY reh.expand_date DESC
  `;

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    console.error('Error fetching ride expansion history:', err);
    return res.status(500).json({
      success: false,
      message: 'Error fetching ride expansion history',
      error: err.message
    });
  }
});

// Revoke deletion (restore a deleted ride)
router.patch('/:id/revoke-deletion', (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE ride
    SET deleted_at = NULL, status = 'open'
    WHERE ride_id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error revoking ride deletion:", err);
      return res.status(500).json({
        message: 'Error revoking ride deletion',
        error: err.message
      });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    res.status(200).json({
      message: 'Ride deletion revoked successfully',
      rideId: id
    });
  });
});

export default router;
