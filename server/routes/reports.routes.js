import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /avg-monthly-customers - Average monthly customers report
router.get('/avg-monthly-customers', async (req, res) => {
  try {
    const year = parseInt(req.query.year);

    // Validate year input
    if (!year) {
      return res.status(400).json({
        error: 'Year is required'
      });
    }

    const sql = `
      SELECT year, month, total_customer,
        ROUND(
          AVG(total_customer) OVER (
            ORDER BY month
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
          ), 2
        ) AS running_avg_customer
      FROM (
        SELECT YEAR(order_date) AS year, MONTH(order_date) AS month,
               COUNT(DISTINCT customer_id) AS total_customer
        FROM (
          SELECT customer_id, order_date FROM store_order
          UNION ALL
          SELECT customer_id, order_date FROM ride_order
        ) AS combined_orders
        WHERE YEAR(order_date) = ?
        GROUP BY year, month
      ) AS monthly_totals
      ORDER BY month
    `;

    db.query(sql, [year], (err, results) => {
      if (err) {
        console.error('Error fetching average monthly customers:', err);
        return res.status(500).json({
          message: 'Error fetching average monthly customers',
          error: err.message
        });
      }

      res.json(results);
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch average monthly customers' });
  }
});

// GET /most-ridden - Most ridden rides per month
router.get('/most-ridden', async (req, res) => {
  try {
    const year = parseInt(req.query.year);

    // Validate year input
    if (!year) {
      return res.status(400).json({
        error: 'Year is required'
      });
    }

    const sql = `
      SELECT month, name, total_tickets
      FROM (
        SELECT
          MONTH(ro.order_date) as month,
          ride.name as name,
          SUM(rod.number_of_tickets) as total_tickets,
          ROW_NUMBER() OVER(
            PARTITION BY MONTH(ro.order_date)
            ORDER BY SUM(rod.number_of_tickets) DESC
          ) as rank_in_month
        FROM ride_order as ro
        LEFT JOIN ride_order_detail as rod ON rod.order_id = ro.order_id
        LEFT JOIN ride ON ride.ride_id = rod.ride_id
        WHERE YEAR(ro.order_date) = ?
        GROUP BY MONTH(ro.order_date), ride.name
      ) ranked
      WHERE rank_in_month = 1
      ORDER BY month
    `;

    db.query(sql, [year], (err, results) => {
      if (err) {
        console.error('Error fetching most ridden rides:', err);
        return res.status(500).json({
          message: 'Error fetching most ridden rides',
          error: err.message
        });
      }

      res.json(results);
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch most ridden rides' });
  }
});

// GET /ride-maintenance - Ride maintenance report
router.get('/ride-maintenance', async (req, res) => {
  try {
    const sql = `
      SELECT
        r.name AS ride_name,
        rod.ride_id,
        SUM(rod.number_of_tickets) AS total_rides,
        IFNULL(m_count.total_maintenance_count, 0) AS total_maintenance_count,
        ROUND(
          CASE
            WHEN IFNULL(m_count.total_maintenance_count, 0) = 0 THEN 0
            ELSE
              (NULLIF(IFNULL(m_count.total_maintenance_count, 0), 0) / SUM(rod.number_of_tickets)) * 100
          END,
          2) as percent_needing_maintenance
      FROM ride_order_detail AS rod
      LEFT JOIN ride AS r ON rod.ride_id = r.ride_id
      LEFT JOIN (
        SELECT ride_id, COUNT(*) AS total_maintenance_count
        FROM maintenance
        GROUP BY ride_id
      ) AS m_count ON m_count.ride_id = rod.ride_id
      GROUP BY r.name, rod.ride_id
      ORDER BY r.name ASC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching ride maintenance report:', err);
        return res.status(500).json({
          message: 'Error fetching ride maintenance report',
          error: err.message
        });
      }

      res.json(results);
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch ride maintenance report' });
  }
});

export default router;
