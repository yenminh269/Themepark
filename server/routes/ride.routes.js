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
  db.query(`SELECT * FROM ride;`, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Error fetching rides',
        error: err.message
      })
    }
    res.status(201).json({ data: results });
  });
});

// Get all ride names
router.get('/names', async (req, res) => {
  db.query(`SELECT name FROM ride;`, (err, results) => {
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

export default router;
