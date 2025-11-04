import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /total-revenue - Get total revenue from rides and stores
router.get('/total-revenue', async (req, res) => {
  try {
    const sql = `
      SELECT
        (SELECT COALESCE(SUM(total_amount), 0) FROM ride_order WHERE status = 'completed') as ride_revenue,
        (SELECT COALESCE(SUM(total_amount), 0) FROM store_order WHERE status = 'completed') as store_revenue
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching total revenue:', err);
        return res.status(500).json({
          message: 'Error fetching total revenue',
          error: err.message
        });
      }
      const rideRevenue = parseFloat(results[0]?.ride_revenue || 0);
      const storeRevenue = parseFloat(results[0]?.store_revenue || 0);
      const totalRevenue = rideRevenue + storeRevenue;

      res.json({
        data: {
          total: totalRevenue.toFixed(2),
          ride_revenue: rideRevenue.toFixed(2),
          store_revenue: storeRevenue.toFixed(2)
        }
      });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch total revenue' });
  }
});

// GET /store-sales - Get store sales total
router.get('/store-sales', async (req, res) => {
  try {
    const sql = `
      SELECT COALESCE(SUM(total_amount), 0) as total_sales
      FROM store_order
      WHERE status = 'completed'
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching store sales:', err);
        return res.status(500).json({
          message: 'Error fetching store sales',
          error: err.message
        });
      }
      const totalSales = parseFloat(results[0]?.total_sales || 0);
      res.json({ data: totalSales.toFixed(2) });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch store sales' });
  }
});

// GET /ride-ticket-sales - Get ride ticket sales total
router.get('/ride-ticket-sales', async (req, res) => {
  try {
    const sql = `
      SELECT COALESCE(SUM(total_amount), 0) as total_sales
      FROM ride_order
      WHERE status = 'completed'
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching ride ticket sales:', err);
        return res.status(500).json({
          message: 'Error fetching ride ticket sales',
          error: err.message
        });
      }
      const totalSales = parseFloat(results[0]?.total_sales || 0);
      res.json({ data: totalSales.toFixed(2) });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch ride ticket sales' });
  }
});

// GET /avg-rides-broken-maintenance - Get average rides in broken/maintenance status per month
router.get('/avg-rides-broken-maintenance', async (req, res) => {
  try {
    const sql = `
    SELECT AVG(monthly_count) as avg_broken_per_month
    FROM (
    SELECT
    DATE_FORMAT(m.scheduled_date, '%Y-%m') as month,
    COUNT(DISTINCT m.ride_id) as monthly_count
    FROM maintenance m
    GROUP BY DATE_FORMAT(m.scheduled_date, '%Y-%m')
    ) as monthly_data
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching average broken/maintenance rides:', err);
        return res.status(500).json({
          message: 'Error fetching average broken/maintenance rides',
          error: err.message
        });
      }
      const avgBroken = results[0]?.avg_broken_per_month || 0;
      res.json({ data: Math.round(avgBroken) });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch average broken/maintenance rides' });
  }
});

// GET /recent-ride-orders - Get recent ride orders with pagination
router.get('/recent-ride-orders', async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 5;

    const sql = `
      SELECT order_id, order_date, total_amount, status
      FROM ride_order
      ORDER BY order_date DESC
      LIMIT ? OFFSET ?
    `;

    db.query(sql, [limit, offset], (err, results) => {
      if (err) {
        console.error('Error fetching recent ride orders:', err);
        return res.status(500).json({
          message: 'Error fetching recent ride orders',
          error: err.message
        });
      }
      res.json({ data: results });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch recent ride orders' });
  }
});

// GET /ride-order-details/:orderId - Get ride order details
router.get('/ride-order-details/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const sql = `
      SELECT rod.order_id, rod.ride_id, rod.price_per_ticket, rod.number_of_tickets, r.name as ride_name
      FROM ride_order_detail rod
      LEFT JOIN ride r ON rod.ride_id = r.ride_id
      WHERE rod.order_id = ?
    `;
    db.query(sql, [orderId], (err, results) => {
      if (err) {
        console.error('Error fetching ride order details:', err);
        return res.status(500).json({
          message: 'Error fetching ride order details',
          error: err.message
        });
      }
      res.json({ data: results });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch ride order details' });
  }
});

// GET /weekly-revenue - Get weekly revenue for the last 8 weeks
router.get('/weekly-revenue', async (req, res) => {
  try {
    const sql = `
      WITH RECURSIVE weeks AS (
        SELECT 0 as week_num
        UNION ALL
        SELECT week_num + 1 FROM weeks WHERE week_num < 7
      ),
      weekly_data AS (
        SELECT
          WEEK(order_date, 1) as week_number,
          YEAR(order_date) as year,
          DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL weeks.week_num WEEK), '%Y-%m-%d') as week_start,
          COALESCE(SUM(CASE WHEN week_num = 0 THEN total_amount END), 0) as current_week,
          weeks.week_num
        FROM weeks
        LEFT JOIN (
          SELECT order_date, total_amount, 'ride' as type FROM ride_order WHERE status = 'completed'
          UNION ALL
          SELECT order_date, total_amount, 'store' as type FROM store_order WHERE status = 'completed'
        ) orders ON WEEK(orders.order_date, 1) = WEEK(DATE_SUB(CURDATE(), INTERVAL weeks.week_num WEEK), 1)
          AND YEAR(orders.order_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL weeks.week_num WEEK))
        GROUP BY weeks.week_num, week_number, year, week_start
      )
      SELECT
        DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL week_num WEEK), '%b %d') as week_label,
        week_num,
        (
          SELECT COALESCE(SUM(total_amount), 0)
          FROM ride_order
          WHERE status = 'completed'
            AND WEEK(order_date, 1) = WEEK(DATE_SUB(CURDATE(), INTERVAL week_num WEEK), 1)
            AND YEAR(order_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL week_num WEEK))
        ) as ride_revenue,
        (
          SELECT COALESCE(SUM(total_amount), 0)
          FROM store_order
          WHERE status = 'completed'
            AND WEEK(order_date, 1) = WEEK(DATE_SUB(CURDATE(), INTERVAL week_num WEEK), 1)
            AND YEAR(order_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL week_num WEEK))
        ) as store_revenue
      FROM weeks
      ORDER BY week_num DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching weekly revenue:', err);
        return res.status(500).json({
          message: 'Error fetching weekly revenue',
          error: err.message
        });
      }

      // Calculate total revenue and format data
      const formattedResults = results.map(row => ({
        week: row.week_label,
        ride_revenue: parseFloat(row.ride_revenue || 0),
        store_revenue: parseFloat(row.store_revenue || 0),
        total_revenue: parseFloat(row.ride_revenue || 0) + parseFloat(row.store_revenue || 0)
      }));

      res.json({ data: formattedResults });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch weekly revenue' });
  }
});

// GET /top-products - Get top 5 products by quantity sold
router.get('/top-products', async (req, res) => {
  try {
    const sql = `
      SELECT
        m.name as product_name,
        m.type as category,
        SUM(sod.quantity) as total_quantity,
        SUM(sod.subtotal) as total_revenue
      FROM store_order_detail sod
      JOIN merchandise m ON sod.item_id = m.item_id
      JOIN store_order so ON sod.store_order_id = so.store_order_id
      WHERE so.status = 'completed'
      GROUP BY sod.item_id, m.name, m.type
      ORDER BY total_quantity DESC
      LIMIT 5
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching top products:', err);
        return res.status(500).json({
          message: 'Error fetching top products',
          error: err.message
        });
      }
      res.json({ data: results });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

export default router;
