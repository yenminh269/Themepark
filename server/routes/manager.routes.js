import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /info - Get manager information
router.get('/info', (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const sql = `
    SELECT employee_id, first_name, last_name, email, job_title, phone
    FROM employee
    WHERE email = ?
      AND job_title = 'Store Manager'
      AND deleted_at IS NULL
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error fetching manager info:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    res.json(results[0]);
  });
});

// GET /dashboard-stats/:department - Get dashboard stats
router.get('/dashboard-stats/:department', (req, res) => {
  const { department } = req.params;

  //determine store type based on department
  const storeType = department === 'giftshop' ? 'merchandise' : 'food/drink';

  //get multiple stats in parallel
  const queries = {
    //Total revenue from orders
    revenue: `
      SELECT COALESCE(SUM(so.total_amount), 0) as total_revenue
      FROM store_order so
      JOIN store s ON so.store_id = s.store_id
      WHERE s.type = '${storeType}'
        AND MONTH(so.order_date) = MONTH(CURRENT_DATE())
        AND YEAR(so.order_date) = YEAR(CURRENT_DATE())
    `,

    // total orders this month
    orders: `
      SELECT COUNT(*) as total_orders
      FROM store_order so
      JOIN store s ON so.store_id = s.store_id
      WHERE s.type = '${storeType}'
        AND MONTH(so.order_date) = MONTH(CURRENT_DATE())
        AND YEAR(so.order_date) = YEAR(CURRENT_DATE())
    `,

    employees: `
      SELECT COUNT(DISTINCT e.employee_id) as active_employees
      FROM employee e
      WHERE e.job_title = '${department === 'giftshop' ? 'Sales Employee' : 'Concession Employee'}'
        AND e.deleted_at IS NULL
        AND e.terminate_date IS NULL
    `,

    // Low stock items count
    lowStock: `
      SELECT COUNT(*) as low_stock_count
      FROM store_inventory si
      JOIN store s ON si.store_id = s.store_id
      WHERE s.type = '${storeType}'
        AND si.stock_quantity < 15
    `,

    // Active stores
    activeStores: `
      SELECT COUNT(*) as active_stores
      FROM store
      WHERE type = '${storeType}'
        AND status = 'open'
        AND deleted_at IS NULL
    `
  };

  const stats = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, sql]) => {
    db.query(sql, (err, results) => {
      if (err) {
        console.error(`Error fetching ${key}:`, err);
        stats[key] = 0;
      } else {
        stats[key] = results[0] ? Object.values(results[0])[0] : 0;
      }

      completed++;
      if (completed === total) {
        res.json(stats);
      }
    });
  });
});

// GET /revenue-trend/:department - Get revenue trend for the past 6 months
router.get('/revenue-trend/:department', (req, res) => {
  const { department } = req.params;
  const storeType = department === 'giftshop' ? 'merchandise' : 'food/drink';

  const sql = `
    SELECT
      DATE_FORMAT(so.order_date, '%Y-%m') as month,
      SUM(so.total_amount) as revenue,
      COUNT(*) as order_count
    FROM store_order so
    JOIN store s ON so.store_id = s.store_id
    WHERE s.type = ?
      AND so.order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(so.order_date, '%Y-%m')
    ORDER BY month ASC
  `;

  db.query(sql, [storeType], (err, results) => {
    if (err) {
      console.error('Error fetching revenue trend:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// GET /top-items/:department - Get top selling items
router.get('/top-items/:department', (req, res) => {
  const { department } = req.params;
  const limit = req.query.limit || 5;
  const storeType = department === 'giftshop' ? 'merchandise' : 'food/drink';

  const sql = `
    SELECT
      m.item_id,
      m.name,
      m.price,
      m.image_url,
      SUM(sod.quantity) as total_sold,
      SUM(sod.quantity * sod.price_per_item) as total_revenue
    FROM store_order_detail sod
    JOIN merchandise m ON sod.item_id = m.item_id
    JOIN store_order so ON sod.store_order_id = so.store_order_id
    JOIN store s ON so.store_id = s.store_id
    WHERE s.type = ?
      AND MONTH(so.order_date) = MONTH(CURRENT_DATE())
      AND YEAR(so.order_date) = YEAR(CURRENT_DATE())
    GROUP BY m.item_id, m.name, m.price, m.image_url
    ORDER BY total_sold DESC
    LIMIT ?
  `;

  db.query(sql, [storeType, parseInt(limit)], (err, results) => {
    if (err) {
      console.error('Error fetching top items:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// GET /employees/:department - Get employees by department
router.get('/employees/:department', (req, res) => {
  const { department } = req.params;
  const jobTitle = 'Sales Employee';

  const sql = `
    SELECT
      e.employee_id,
      e.first_name,
      e.last_name,
      e.email,
      e.phone,
      e.job_title,
      e.hire_date,
      COUNT(DISTINCT esj.work_date) as total_shifts
    FROM employee e
    LEFT JOIN employee_store_job esj ON e.employee_id = esj.employee_id
      AND MONTH(esj.work_date) = MONTH(CURRENT_DATE())
      AND YEAR(esj.work_date) = YEAR(CURRENT_DATE())
    WHERE e.job_title = ?
      AND e.deleted_at IS NULL
      AND e.terminate_date IS NULL
    GROUP BY e.employee_id, e.first_name, e.last_name, e.email,
             e.phone, e.job_title, e.hire_date
    ORDER BY e.first_name, e.last_name
  `;

  db.query(sql, [jobTitle], (err, results) => {
    if (err) {
      console.error('Error fetching employees:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// GET /stores/:department - Get stores by department
router.get('/stores/:department', (req, res) => {
  const { department } = req.params;
  const storeType = department === 'giftshop' ? 'merchandise' : 'food/drink';

  const sql = `
    SELECT
      store_id,
      name,
      type,
      status,
      description,
      open_time,
      close_time,
      photo_path
    FROM store
    WHERE type = ?
      AND deleted_at IS NULL
    ORDER BY name
  `;

  db.query(sql, [storeType], (err, results) => {
    if (err) {
      console.error('Error fetching stores:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// POST /assign-employee - Assign employee to store
router.post('/assign-employee', (req, res) => {
  const { employee_id, store_id, work_date, shift_start, shift_end } = req.body;

  if (!employee_id || !store_id || !work_date || !shift_start || !shift_end) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO employee_store_job
      (employee_id, store_id, work_date, shift_start, shift_end)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      shift_start = VALUES(shift_start),
      shift_end = VALUES(shift_end)
  `;

  db.query(sql, [employee_id, store_id, work_date, shift_start, shift_end],
    (err, result) => {
      if (err) {
        console.error('Error assigning employee:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Employee assigned successfully' });
    }
  );
});

// DELETE /remove-assignment/:employeeId/:storeId/:workDate - Remove employee assignment
router.delete('/remove-assignment/:employeeId/:storeId/:workDate', (req, res) => {
  const { employeeId, storeId, workDate } = req.params;

  const sql = `
    DELETE FROM employee_store_job
    WHERE employee_id = ? AND store_id = ? AND work_date = ?
  `;

  db.query(sql, [employeeId, storeId, workDate], (err, result) => {
    if (err) {
      console.error('Error removing assignment:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ message: 'Assignment removed successfully' });
  });
});

// GET /inventory/:department - Get inventory for manager's department
router.get('/inventory/:department', (req, res) => {
  const { department } = req.params;
  const storeType = department === 'giftshop' ? 'merchandise' : 'food/drink';

  const sql = `
    SELECT
      m.item_id,
      m.name,
      m.type,
      m.price,
      m.description,
      m.image_url,
      s.store_id,
      s.name as store_name,
      COALESCE(si.stock_quantity, 0) as stock_quantity,
      CASE
        WHEN COALESCE(si.stock_quantity, 0) < 10 THEN 'critical'
        WHEN COALESCE(si.stock_quantity, 0) < 20 THEN 'low'
        ELSE 'normal'
      END as stock_status
    FROM merchandise m
    CROSS JOIN store s
    LEFT JOIN store_inventory si ON m.item_id = si.item_id AND s.store_id = si.store_id
    WHERE s.type = ?
      AND s.deleted_at IS NULL
      AND (
        (s.type = 'merchandise' AND m.type IN ('drinkware', 'apparel', 'toys', 'accessories'))
        OR (s.type = 'food/drink' AND m.type IN ('snacks', 'beverages'))
      )
    ORDER BY s.name, stock_status, m.name
  `;

  db.query(sql, [storeType], (err, results) => {
    if (err) {
      console.error('Error fetching inventory:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// PUT /inventory/:storeId/:itemId - Update inventory stock
router.put('/inventory/:storeId/:itemId', (req, res) => {
  const { storeId, itemId } = req.params;
  const { stock_quantity } = req.body;

  if (stock_quantity === undefined || stock_quantity < 0) {
    return res.status(400).json({ error: 'Invalid stock quantity' });
  }

  // First check if record exists
  const checkSql = `
    SELECT * FROM store_inventory
    WHERE store_id = ? AND item_id = ?
  `;

  db.query(checkSql, [storeId, itemId], (err, results) => {
    if (err) {
      console.error('Error checking inventory:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const sql = results.length > 0
      ? `UPDATE store_inventory SET stock_quantity = ? WHERE store_id = ? AND item_id = ?`
      : `INSERT INTO store_inventory (stock_quantity, store_id, item_id) VALUES (?, ?, ?)`;

    db.query(sql, [stock_quantity, storeId, itemId], (err, result) => {
      if (err) {
        console.error('Error updating inventory:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Inventory updated successfully', stock_quantity });
    });
  });
});

// POST /merchandise - Add new merchandise item
router.post('/merchandise', (req, res) => {
  const { name, price, quantity, description, type, image_url } = req.body;

  if (!name || !price || quantity === undefined || !description || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO merchandise (name, price, quantity, description, type, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, price, quantity, description, type, image_url], (err, result) => {
    if (err) {
      console.error('Error adding merchandise:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({
      message: 'Merchandise added successfully',
      item_id: result.insertId
    });
  });
});

// GET /schedules/:department - Get schedules for department
router.get('/schedules/:department', (req, res) => {
  const { department } = req.params;
  const { start_date, end_date } = req.query;

  const jobTitle = 'Sales Employee'; // Only Sales Employee
  const storeType = department === 'giftshop' ? 'merchandise' : 'food/drink';

  const sql = `
    SELECT
      esj.employee_id,
      esj.store_id,
      esj.work_date,
      esj.shift_start,
      esj.shift_end,
      e.first_name,
      e.last_name,
      e.email,
      s.name as store_name
    FROM employee_store_job esj
    JOIN employee e ON esj.employee_id = e.employee_id
    JOIN store s ON esj.store_id = s.store_id
    WHERE e.job_title = ?
      AND s.type = ?
      ${start_date ? 'AND esj.work_date >= ?' : ''}
      ${end_date ? 'AND esj.work_date <= ?' : ''}
    ORDER BY esj.work_date DESC, esj.shift_start
  `;

  const params = [jobTitle, storeType];
  if (start_date) params.push(start_date);
  if (end_date) params.push(end_date);

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching schedules:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// GET /weekly-schedule/:department - Get weekly schedule summary
router.get('/weekly-schedule/:department', (req, res) => {
  const { department } = req.params;
  const jobTitle = department === 'giftshop' ? 'Sales Employee' : 'Concession Employee';
  const storeType = department === 'giftshop' ? 'merchandise' : 'food/drink';

  const sql = `
    SELECT
      esj.work_date,
      COUNT(DISTINCT esj.employee_id) as employees_scheduled,
      COUNT(DISTINCT esj.store_id) as stores_covered
    FROM employee_store_job esj
    JOIN employee e ON esj.employee_id = e.employee_id
    JOIN store s ON esj.store_id = s.store_id
    WHERE e.job_title = ?
      AND s.type = ?
      AND esj.work_date >= CURDATE()
      AND esj.work_date < DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    GROUP BY esj.work_date
    ORDER BY esj.work_date
  `;

  db.query(sql, [jobTitle, storeType], (err, results) => {
    if (err) {
      console.error('Error fetching weekly schedule:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// GET /sales-report/:department - Get sales report
router.get('/sales-report/:department', (req, res) => {
  const { department } = req.params;
  const { start_date, end_date } = req.query;
  const storeType = department === 'giftshop' ? 'merchandise' : 'food/drink';

  const sql = `
    SELECT
      s.store_id,
      s.name as store_name,
      COUNT(DISTINCT so.store_order_id) as total_orders,
      SUM(so.total_amount) as total_revenue,
      AVG(so.total_amount) as avg_order_value,
      COUNT(DISTINCT so.customer_id) as unique_customers
    FROM store_order so
    JOIN store s ON so.store_id = s.store_id
    WHERE s.type = ?
      ${start_date ? 'AND so.order_date >= ?' : ''}
      ${end_date ? 'AND so.order_date <= ?' : ''}
    GROUP BY s.store_id, s.name
    ORDER BY total_revenue DESC
  `;

  const params = [storeType];
  if (start_date) params.push(start_date);
  if (end_date) params.push(end_date);

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching sales report:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// GET /employee-performance/:department - Get employee performance
router.get('/employee-performance/:department', (req, res) => {
  const { department } = req.params;
  const jobTitle = department === 'giftshop' ? 'Sales Employee' : 'Concession Employee';

  const sql = `
    SELECT
      e.employee_id,
      e.first_name,
      e.last_name,
      COUNT(DISTINCT esj.work_date) as days_worked,
      COUNT(DISTINCT esj.store_id) as stores_worked
    FROM employee e
    LEFT JOIN employee_store_job esj ON e.employee_id = esj.employee_id
      AND MONTH(esj.work_date) = MONTH(CURRENT_DATE())
      AND YEAR(esj.work_date) = YEAR(CURRENT_DATE())
    WHERE e.job_title = ?
      AND e.deleted_at IS NULL
      AND e.terminate_date IS NULL
    GROUP BY e.employee_id, e.first_name, e.last_name
    ORDER BY total_hours DESC
  `;

  db.query(sql, [jobTitle], (err, results) => {
    if (err) {
      console.error('Error fetching employee performance:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// GET /dashboard/:department - Get manager dashboard data by department
router.get('/dashboard/:department', (req, res) => {
  const department = req.params.department;

  try {
    // Get store IDs for this department (assuming department maps to store types)
    const storeType = department === 'giftshop' ? 'merchandise' :
                     department === 'foodanddrinks' ? 'food/drink' : null;

    if (!storeType) {
      return res.status(400).json({ error: 'Invalid department' });
    }

    // Get stores for this manager
    const storesSql = 'SELECT store_id, name FROM store WHERE type = ? AND deleted_at IS NULL';
    db.query(storesSql, [storeType], (storesErr, stores) => {
      if (storesErr) {
        console.error('Error fetching stores:', storesErr);
        return res.status(500).json({ error: 'Failed to fetch dashboard data' });
      }

      if (stores.length === 0) {
        return res.json({
          staff: [],
          inventory: [],
          sales: { today: 0, week: 0, month: 0 },
          transactions: [],
          lowStock: [],
          topItems: []
        });
      }

      const storeIds = stores.map(s => s.store_id);

      // Get staff for these stores
      const staffSql = `
        SELECT DISTINCT e.employee_id, e.first_name, e.last_name, e.job_title,
               GROUP_CONCAT(DISTINCT s.name) as store_names,
               COUNT(DISTINCT s.store_id) as stores_assigned
        FROM employee e
        LEFT JOIN employee_schedule es ON e.employee_id = es.employee_id
        LEFT JOIN store s ON es.store_id = s.store_id
        WHERE e.deleted_at IS NULL AND e.job_title IN ('Sales Associate', 'Cashier', 'Stock Clerk', 'Supervisor')
        AND s.store_id IN (${storeIds.map(() => '?').join(',')})
        GROUP BY e.employee_id, e.first_name, e.last_name, e.job_title
      `;

      // Get inventory for these stores
      const inventorySql = `
        SELECT m.item_id, m.name as item_name, m.price, m.type as item_type,
               si.stock_quantity, s.name as store_name
        FROM merchandise m
        JOIN store_inventory si ON m.item_id = si.item_id
        JOIN store s ON si.store_id = s.store_id
        WHERE si.store_id IN (${storeIds.map(() => '?').join(',')})
        ORDER BY m.name
      `;

      // Get sales data for today/week/month
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const salesSql = `
        SELECT
          SUM(CASE WHEN so.order_date = ? THEN so.total_amount ELSE 0 END) as today_sales,
          SUM(CASE WHEN so.order_date >= ? THEN so.total_amount ELSE 0 END) as week_sales,
          SUM(CASE WHEN so.order_date >= ? THEN so.total_amount ELSE 0 END) as month_sales
        FROM store_order so
        WHERE so.store_id IN (${storeIds.map(() => '?').join(',')})
      `;

      // Get recent transactions
      const transactionsSql = `
        SELECT so.store_order_id, so.order_date, so.total_amount,
               s.name as store_name, COUNT(sod.item_id) as item_count
        FROM store_order so
        JOIN store s ON so.store_id = s.store_id
        LEFT JOIN store_order_detail sod ON so.store_order_id = sod.store_order_id
        WHERE so.store_id IN (${storeIds.map(() => '?').join(',')})
        GROUP BY so.store_order_id, so.order_date, so.total_amount, s.name
        ORDER BY so.order_date DESC
        LIMIT 10
      `;

      // Get low stock items (less than 10)
      const lowStockSql = `
        SELECT m.name, s.name as store_name, si.stock_quantity
        FROM merchandise m
        JOIN store_inventory si ON m.item_id = si.item_id
        JOIN store s ON si.store_id = s.store_id
        WHERE si.store_id IN (${storeIds.map(() => '?').join(',')})
        AND si.stock_quantity < 10
        ORDER BY si.stock_quantity ASC
      `;

      // Get top selling items
      const topItemsSql = `
        SELECT m.name, SUM(sod.quantity) as total_sold,
               SUM(sod.subtotal) as revenue
        FROM merchandise m
        JOIN store_order_detail sod ON m.item_id = sod.item_id
        JOIN store_order so ON sod.store_order_id = so.store_order_id
        WHERE so.store_id IN (${storeIds.map(() => '?').join(',')})
        GROUP BY m.item_id, m.name
        ORDER BY total_sold DESC
        LIMIT 5
      `;

      // Execute all queries
      Promise.all([
        new Promise((resolve, reject) => {
          db.query(staffSql, storeIds, (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        }),
        new Promise((resolve, reject) => {
          db.query(inventorySql, storeIds, (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        }),
        new Promise((resolve, reject) => {
          db.query(salesSql, [today, weekAgo, monthAgo, ...storeIds], (err, results) => {
            if (err) reject(err);
            else resolve(results[0]);
          });
        }),
        new Promise((resolve, reject) => {
          db.query(transactionsSql, storeIds, (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        }),
        new Promise((resolve, reject) => {
          db.query(lowStockSql, storeIds, (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        }),
        new Promise((resolve, reject) => {
          db.query(topItemsSql, storeIds, (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        })
      ]).then(([staff, inventory, sales, transactions, lowStock, topItems]) => {
        res.json({
          staff: staff.map(s => ({
            employee_id: s.employee_id,
            first_name: s.first_name,
            last_name: s.last_name,
            job_title: s.job_title,
            stores_assigned: s.stores_assigned,
            store_names: s.store_names
          })),
          inventory: inventory.map(i => ({
            item_id: i.item_id,
            item_name: i.item_name,
            store_name: i.store_name,
            quantity: i.stock_quantity,
            price: parseFloat(i.price),
            type: i.item_type
          })),
          sales: {
            today: parseFloat(sales.today_sales || 0),
            week: parseFloat(sales.week_sales || 0),
            month: parseFloat(sales.month_sales || 0)
          },
          transactions: transactions.map(t => ({
            store_order_id: t.store_order_id,
            order_date: t.order_date,
            store_name: t.store_name,
            total_amount: parseFloat(t.total_amount),
            item_count: t.item_count
          })),
          lowStock: lowStock.map(l => ({
            name: l.name,
            store_name: l.store_name,
            quantity: l.stock_quantity
          })),
          topItems: topItems.map(t => ({
            name: t.name,
            total_sold: t.total_sold,
            revenue: parseFloat(t.revenue)
          }))
        });
      }).catch(err => {
        console.error('Error fetching dashboard data:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
      });
    });
  } catch (error) {
    console.error('Manager dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
