import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /customer-report - Customer report
router.get('/customer-report', async (req, res) => {
  try {
    const { type, startDate, endDate, period, viewMode } = req.query;
    // Validate required parameters
    if ( !type || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Group, type, start date, and end date are required'
      });
    }

    let sql = '';
    let params = [];
    switch(type) {
      //number of new customers registered
      case 'new_customers':
        sql = `SELECT sign_up_date, new_customer,
          SUM(new_customer) OVER (ORDER BY sign_up_date) AS cumulative_customers
        FROM (
          SELECT
            DATE(created_at) AS sign_up_date,
            COUNT(*) AS new_customer
          FROM customer
          WHERE created_at >= ?
            AND created_at < DATE_ADD(?, INTERVAL 1 DAY)
          GROUP BY sign_up_date
        ) AS count_customer
        ORDER BY sign_up_date;`;
        params = [startDate,endDate];
        break;
      case 'purchase_activity':

        if (!viewMode) {
          return res.status(400).json({
            error: 'View mode is required for purchase activity report'
          });
        }

        if (viewMode === 'summary') {
          // Summary view - average number of customer purchases
          sql = `
            WITH all_customers AS (
            SELECT customer_id FROM store_order
            WHERE order_date >= ? AND order_date <= ?
            UNION
            SELECT customer_id FROM ride_order
            WHERE order_date >= ? AND order_date <= ?
          )
          SELECT
            (SELECT COUNT(DISTINCT customer_id)
            FROM store_order
            WHERE order_date >= ? AND order_date <= ?) AS store_customers,

            (SELECT COUNT(DISTINCT customer_id)
            FROM ride_order
            WHERE order_date >= ? AND order_date <= ?) AS ride_customers,

            (SELECT COUNT(*) FROM all_customers) AS total_unique_customers,
            DATEDIFF(?,?) AS num_days,
            (SELECT COUNT(*) FROM all_customers) / DATEDIFF(?,?) AS avg_customer;
          `;
          params = [startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, endDate, startDate, endDate, startDate];
        } else if (viewMode === 'daily') {
          // Daily breakdown view with spike detection
          if (!period) {
            return res.status(400).json({
              error: 'Period is required for daily breakdown view'
            });
          }

          if (period === 'monthly') {
            sql = `WITH daily AS (
              SELECT
                DATE(order_date) AS visit_date,
                COUNT(DISTINCT customer_id) AS num_customers
              FROM (
                SELECT customer_id, order_date FROM ride_order
                UNION
                SELECT customer_id, order_date FROM store_order
              ) AS all_orders
              WHERE order_date >= ? AND order_date <= ?
              GROUP BY DATE(order_date)
            ),
            monthly AS (
              SELECT
                YEAR(visit_date) AS year,
                MONTH(visit_date) AS month_num,
                AVG(num_customers) AS avg_customers,
                COUNT(*) AS days_in_month
              FROM daily
              GROUP BY YEAR(visit_date), MONTH(visit_date)
            )
            SELECT
              d.visit_date,
              d.num_customers,
              m.month_num,
              m.avg_customers,
              m.days_in_month,
              CASE
                WHEN d.num_customers > m.avg_customers * 1.2 THEN 'Spike'
                ELSE 'Normal'
              END AS status
            FROM daily d
            JOIN monthly m
              ON YEAR(d.visit_date) = m.year
              AND MONTH(d.visit_date) = m.month_num
            ORDER BY d.visit_date;
            `;
          } else {
            sql = `WITH daily AS (
              SELECT
                DATE(order_date) AS visit_date,
                COUNT(DISTINCT customer_id) AS num_customers
              FROM (
                SELECT customer_id, order_date FROM ride_order
                UNION
                SELECT customer_id, order_date FROM store_order
              ) AS all_orders
              WHERE order_date >= ? AND order_date <= ?
              GROUP BY DATE(order_date)
            ),
            weekly AS (
              SELECT
                YEAR(visit_date) AS year,
                WEEK(visit_date, 1) AS week_num,
                AVG(num_customers) AS avg_customers,
                COUNT(*) AS days_in_week
              FROM daily
              GROUP BY YEAR(visit_date), WEEK(visit_date, 1)
            )
            SELECT
              d.visit_date,
              d.num_customers,
              w.week_num,
              w.avg_customers,
              w.days_in_week,
              CASE
                WHEN d.num_customers > w.avg_customers * 1.2 THEN 'Spike'
                ELSE 'Normal'
              END AS status
            FROM daily d
            JOIN weekly w
              ON YEAR(d.visit_date) = w.year
              AND WEEK(d.visit_date, 1) = w.week_num
            ORDER BY d.visit_date;`;
          }
          params = [startDate, endDate];
        } else {
          return res.status(400).json({
            error: 'Invalid view mode. Must be "summary" or "daily"'
          });
        }
        break;
      case 'customer_spikes':
        if (!period) {
          return res.status(400).json({
            error: 'Period is required'
          });
        }
        if (period === 'monthly') {
          sql = `WITH daily AS (
            SELECT
              DATE(order_date) AS visit_date,
              COUNT(DISTINCT customer_id) AS num_customers
            FROM (
              SELECT customer_id, order_date FROM ride_order
              UNION
              SELECT customer_id, order_date FROM store_order
            ) AS all_orders
            WHERE order_date >= ? AND order_date <= ?
            GROUP BY DATE(order_date)
          ),
          monthly AS (
            SELECT
              YEAR(visit_date) AS year,
              MONTH(visit_date) AS month_num,
              AVG(num_customers) AS avg_customers,
              COUNT(*) AS days_in_month
            FROM daily
            GROUP BY YEAR(visit_date), MONTH(visit_date)
          )
          SELECT
            d.visit_date,
            d.num_customers,
            m.month_num,
            m.avg_customers,
            m.days_in_month,
            CASE
              WHEN d.num_customers > m.avg_customers * 1.2 THEN 'Spike'
              ELSE 'Normal'
            END AS status
          FROM daily d
          JOIN monthly m
            ON YEAR(d.visit_date) = m.year
            AND MONTH(d.visit_date) = m.month_num
          ORDER BY d.visit_date;
          `
        } else{
          sql = `WITH daily AS (
            SELECT
              DATE(order_date) AS visit_date,
              COUNT(DISTINCT customer_id) AS num_customers
            FROM (
              SELECT customer_id, order_date FROM ride_order
              UNION
              SELECT customer_id, order_date FROM store_order
            ) AS all_orders
            WHERE order_date >= ? AND order_date <= ?
            GROUP BY DATE(order_date)
          ),
          weekly AS (
            SELECT
              YEAR(visit_date) AS year,
              WEEK(visit_date, 1) AS week_num,
              AVG(num_customers) AS avg_customers,
              COUNT(*) AS days_in_week
            FROM daily
            GROUP BY YEAR(visit_date), WEEK(visit_date, 1)
          )
          SELECT
            d.visit_date,
            d.num_customers,
            w.week_num,
            w.avg_customers,
            w.days_in_week,
            CASE
              WHEN d.num_customers > w.avg_customers * 1.2 THEN 'Spike'
              ELSE 'Normal'
            END AS status
          FROM daily d
          JOIN weekly w
            ON YEAR(d.visit_date) = w.year
            AND WEEK(d.visit_date, 1) = w.week_num
          ORDER BY d.visit_date; `
        }
        params = [startDate, endDate];
        break;
      default:
        return res.status(400).json({
          error: 'Invalid customer report type.'
        });
    }
    db.query(sql, params, async (err, results) => {
      if (err) {
        console.error('Error fetching customers report:', err);
        return res.status(500).json({
          message: 'Error fetching customers report',
          error: err.message
        });
      }

      // For new_customers report, fetch detailed customer information
      if (type === 'new_customers' && results.length > 0) {
        try {
          const detailedResults = await Promise.all(results.map(async (row) => {
            const detailSql = `
              SELECT
                c.customer_id,
                c.first_name,
                c.last_name,
                c.gender,
                c.email,
                c.dob,
                DATE_FORMAT(c.dob, '%Y-%m-%d') as formatted_dob,
                c.phone,
                c.created_at,
                DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i:%s') as formatted_created_at,
                CASE
                  WHEN EXISTS (SELECT 1 FROM ride_order WHERE customer_id = c.customer_id) THEN 'Yes'
                  ELSE 'No'
                END as has_ride_purchase,
                CASE
                  WHEN EXISTS (SELECT 1 FROM store_order WHERE customer_id = c.customer_id) THEN 'Yes'
                  ELSE 'No'
                END as has_store_purchase
              FROM customer c
              WHERE DATE(c.created_at) = ?
              ORDER BY c.created_at
            `;

            return new Promise((resolve, reject) => {
              db.query(detailSql, [row.sign_up_date], (detailErr, detailRows) => {
                if (detailErr) {
                  reject(detailErr);
                } else {
                  resolve({
                    ...row,
                    customer_details: detailRows
                  });
                }
              });
            });
          }));

          res.json(detailedResults);
        } catch (detailErr) {
          console.error('Error fetching new customer details:', detailErr);
          // If detail fetch fails, return summary data without details
          res.json(results);
        }
      }
      // For purchase_activity summary report, fetch detailed customer information
      else if (type === 'purchase_activity' && viewMode === 'summary' && results.length > 0) {
        try {
          const summaryRow = results[0];

          // Fetch detailed store customers
          const storeCustomersSql = `
            SELECT DISTINCT
              c.customer_id,
              c.first_name,
              c.last_name,
              c.email,
              c.phone,
              so.store_order_id,
              so.order_date,
              DATE_FORMAT(so.order_date, '%Y-%m-%d') as formatted_order_date,
              so.total_amount,
              so.status,
              so.payment_method
            FROM customer c
            INNER JOIN store_order so ON c.customer_id = so.customer_id
            WHERE so.order_date >= ? AND so.order_date <= ?
            ORDER BY c.customer_id, so.order_date
          `;

          // Fetch detailed ride customers
          const rideCustomersSql = `
            SELECT DISTINCT
              c.customer_id,
              c.first_name,
              c.last_name,
              c.email,
              c.phone,
              ro.order_id,
              ro.order_date,
              DATE_FORMAT(ro.order_date, '%Y-%m-%d') as formatted_order_date,
              ro.total_amount,
              ro.status
            FROM customer c
            INNER JOIN ride_order ro ON c.customer_id = ro.customer_id
            WHERE ro.order_date >= ? AND ro.order_date <= ?
            ORDER BY c.customer_id, ro.order_date
          `;

          const storeCustomers = await new Promise((resolve, reject) => {
            db.query(storeCustomersSql, [startDate, endDate], (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            });
          });

          const rideCustomers = await new Promise((resolve, reject) => {
            db.query(rideCustomersSql, [startDate, endDate], (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            });
          });

          // Add detailed data to the summary row
          const detailedResult = {
            ...summaryRow,
            store_customer_details: storeCustomers,
            ride_customer_details: rideCustomers
          };

          res.json([detailedResult]);
        } catch (detailErr) {
          console.error('Error fetching customer details:', detailErr);
          // If detail fetch fails, return summary data without details
          res.json(results);
        }
      }
      // For purchase_activity daily report, fetch detailed order information for each day
      else if (type === 'purchase_activity' && viewMode === 'daily' && results.length > 0) {
        try {
          const detailedResults = await Promise.all(results.map(async (row) => {
            // Fetch store orders for this day
            const storeOrdersSql = `
              SELECT DISTINCT
                c.customer_id,
                c.first_name,
                c.last_name,
                c.email,
                c.phone,
                so.store_order_id,
                so.order_date,
                DATE_FORMAT(so.order_date, '%Y-%m-%d') as formatted_order_date,
                so.total_amount,
                so.status,
                so.payment_method
              FROM customer c
              INNER JOIN store_order so ON c.customer_id = so.customer_id
              WHERE DATE(so.order_date) = ?
              ORDER BY c.customer_id, so.order_date
            `;

            // Fetch ride orders for this day
            const rideOrdersSql = `
              SELECT DISTINCT
                c.customer_id,
                c.first_name,
                c.last_name,
                c.email,
                c.phone,
                ro.order_id,
                ro.order_date,
                DATE_FORMAT(ro.order_date, '%Y-%m-%d') as formatted_order_date,
                ro.total_amount,
                ro.status
              FROM customer c
              INNER JOIN ride_order ro ON c.customer_id = ro.customer_id
              WHERE DATE(ro.order_date) = ?
              ORDER BY c.customer_id, ro.order_date
            `;

            const storeOrders = await new Promise((resolve, reject) => {
              db.query(storeOrdersSql, [row.visit_date], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
              });
            });

            const rideOrders = await new Promise((resolve, reject) => {
              db.query(rideOrdersSql, [row.visit_date], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
              });
            });

            // Count unique customers from both sources
            const storeCustomerCount = new Set(storeOrders.map(o => o.customer_id)).size;
            const rideCustomerCount = new Set(rideOrders.map(o => o.customer_id)).size;

            return {
              ...row,
              store_order_details: storeOrders,
              ride_order_details: rideOrders,
              store_customer_count: storeCustomerCount,
              ride_customer_count: rideCustomerCount
            };
          }));

          res.json(detailedResults);
        } catch (detailErr) {
          console.error('Error fetching spike order details:', detailErr);
          // If detail fetch fails, return summary data without details
          res.json(results);
        }
      } else {
        res.json(results);
      }
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch customers report' });
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

// GET /ride-report - Dynamic ride report based on type
router.get('/ride-report', async (req, res) => {
  try {
    const { group, type, startDate, endDate, rideName } = req.query;

    // Validate required parameters
    if (!group || !type || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required parameters: group, type, startDate, and endDate are required'
      });
    }

    let sql = '';
    let params = [];

    switch (type) {
      case 'total_rides':
        // Total Rides Taken and Revenue - with detailed transactions
        sql = `
          SELECT
            YEAR(od) as year,
            MONTH(od) as month,
            DAY(od) as day,
            SUM(noticket) as total_tickets,
            SUM(price * noticket) as total_revenue,
            name,
            ride_id
          FROM (
            SELECT
              ro.order_id,
              ro.order_date as od,
              rod.price_per_ticket as price,
              rod.number_of_tickets as noticket,
              rod.ride_id,
              ride.name as name
            FROM ride_order as ro
            LEFT JOIN ride_order_detail as rod ON rod.order_id = ro.order_id
            LEFT JOIN ride ON ride.ride_id = rod.ride_id
          ) as total_ride_taken
          WHERE od >= ? AND od <= ?
          ${group === 'ride' && rideName ? 'AND name = ?' : ''}
          GROUP BY year, month, day, name, ride_id
          ORDER BY year, month, day, name
        `;
        params = [startDate, endDate];
        if (group === 'ride' && rideName) {
          params.push(rideName);
        }
        break;

      case 'total_maintenance':
        // Total Maintenance Activities
        sql = `
          SELECT
            r.name AS ride_name,
            rod.ride_id,
            SUM(rod.number_of_tickets) AS total_rides,
            IFNULL(m_count.total_maintenance_count, 0) AS total_maintenance_count,
            ROUND(
              CASE
                WHEN IFNULL(m_count.total_maintenance_count, 0) = 0 THEN 0
                ELSE (NULLIF(IFNULL(m_count.total_maintenance_count, 0), 0) / SUM(rod.number_of_tickets)) * 100
              END,
              2) as percent_needing_maintenance
          FROM ride_order_detail AS rod
          LEFT JOIN ride AS r ON rod.ride_id = r.ride_id
          LEFT JOIN ride_order AS ro ON rod.order_id = ro.order_id
          LEFT JOIN (
            SELECT ride_id, COUNT(*) AS total_maintenance_count
            FROM maintenance
            WHERE scheduled_date >= ? AND scheduled_date <= ?
            GROUP BY ride_id
          ) AS m_count ON m_count.ride_id = rod.ride_id
          WHERE ro.order_date >= ? AND ro.order_date <= ?
          ${group === 'ride' && rideName ? 'AND r.name = ?' : ''}
          GROUP BY r.name, rod.ride_id
          ORDER BY r.name ASC
        `;
        params = [startDate, endDate, startDate, endDate];
        if (group === 'ride' && rideName) {
          params.push(rideName);
        }
        break;

      case 'most_popular':
        // Most Popular Ride
        sql = `
          SELECT
            r.name AS ride_name,
            SUM(rod.number_of_tickets) AS total_rides,
            COUNT(DISTINCT ro.order_id) AS total_orders,
            ROUND(SUM(rod.number_of_tickets) / COUNT(DISTINCT ro.order_id), 2) AS avg_tickets_per_order,
            RANK() OVER (ORDER BY SUM(rod.number_of_tickets) DESC) AS rank_by_tickets,
            RANK() OVER (ORDER BY COUNT(DISTINCT ro.order_id) DESC) AS rank_by_orders
          FROM ride_order_detail AS rod
          LEFT JOIN ride AS r ON rod.ride_id = r.ride_id
          LEFT JOIN ride_order AS ro ON rod.order_id = ro.order_id
          WHERE ro.order_date >= ? AND ro.order_date <= ?
          GROUP BY r.name
          ORDER BY total_rides DESC
        `;
        params = [startDate, endDate];
        break;

      default:
        return res.status(400).json({
          error: 'Invalid report type. Valid types are: total_rides, total_maintenance, most_popular, highest_maintenance'
        });
    }

    db.query(sql, params, async (err, results) => {
      if (err) {
        console.error('Error fetching ride report:', err);
        return res.status(500).json({
          message: 'Error fetching ride report',
          error: err.message
        });
      }

      // For total_rides report, fetch detailed transactions for each summary row
      if (type === 'total_rides' && results.length > 0) {
        try {
          const detailedResults = await Promise.all(results.map(async (row) => {
            const detailSql = `
              SELECT
                rod.order_id,
                rod.ride_id,
                rod.number_of_tickets,
                rod.price_per_ticket,
                rod.subtotal,
                ro.order_date,
                DATE_FORMAT(ro.order_date, '%Y-%m-%d') as formatted_order_date
              FROM ride_order_detail as rod
              LEFT JOIN ride_order as ro ON rod.order_id = ro.order_id
              WHERE rod.ride_id = ?
                AND DATE(ro.order_date) = DATE(?)
              ORDER BY ro.order_date
            `;

            // Construct date string from year, month, day
            const dateStr = `${row.year}-${String(row.month).padStart(2, '0')}-${String(row.day).padStart(2, '0')}`;

            return new Promise((resolve, reject) => {
              db.query(detailSql, [row.ride_id, dateStr], (detailErr, detailRows) => {
                if (detailErr) {
                  reject(detailErr);
                } else {
                  resolve({
                    ...row,
                    details: detailRows
                  });
                }
              });
            });
          }));

          res.json(detailedResults);
        } catch (detailErr) {
          console.error('Error fetching transaction details:', detailErr);
          // If detail fetch fails, return summary data without details
          res.json(results);
        }
      }
      // For total_maintenance report, fetch detailed maintenance records for each ride
      else if (type === 'total_maintenance' && results.length > 0) {
        try {
          const detailedResults = await Promise.all(results.map(async (row) => {
            const detailSql = `
              SELECT
                m.maintenance_id,
                m.description,
                m.scheduled_date,
                DATE_FORMAT(m.scheduled_date, '%Y-%m-%d') as formatted_scheduled_date,
                m.status,
                eoj.employee_id,
                eoj.work_date,
                DATE_FORMAT(eoj.work_date, '%Y-%m-%d') as formatted_work_date,
                eoj.worked_hour,
                e.first_name,
                e.last_name
              FROM maintenance as m
              LEFT JOIN employee_maintenance_job as eoj
                ON eoj.maintenance_id = m.maintenance_id
              LEFT JOIN employee as e
                ON e.employee_id = eoj.employee_id
              WHERE m.ride_id = ?
                AND m.scheduled_date >= ?
                AND m.scheduled_date <= ?
              ORDER BY m.scheduled_date, m.maintenance_id
            `;

            return new Promise((resolve, reject) => {
              db.query(detailSql, [row.ride_id, startDate, endDate], (detailErr, detailRows) => {
                if (detailErr) {
                  reject(detailErr);
                } else {
                  resolve({
                    ...row,
                    maintenance_details: detailRows
                  });
                }
              });
            });
          }));

          res.json(detailedResults);
        } catch (detailErr) {
          console.error('Error fetching maintenance details:', detailErr);
          // If detail fetch fails, return summary data without details
          res.json(results);
        }
      }
      else {
        res.json(results);
      }
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch ride report' });
  }
});

export default router;
