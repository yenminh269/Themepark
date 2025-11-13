import express from 'express';
import db from '../config/db.js';
import { uploadMerchandise } from '../config/upload.js';

const router = express.Router();

// ==================== DASHBOARD ====================

// Get all employees
router.get('/employees/all', (req, res) => {
  const sql = `
    SELECT 
      e.*,
      COUNT(DISTINCT CONCAT(esj.store_id, '-', esj.work_date)) as total_shifts,
      SUM(TIMESTAMPDIFF(HOUR, esj.shift_start, esj.shift_end)) as total_hours
    FROM employee e
    LEFT JOIN employee_store_job esj ON e.employee_id = esj.employee_id 
      AND esj.work_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    WHERE e.job_title = 'Sales Employee'
      AND e.deleted_at IS NULL
      AND e.terminate_date IS NULL
    GROUP BY e.employee_id
    ORDER BY e.last_name, e.first_name
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching employees:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get all stores
router.get('/stores/all', (req, res) => {
  const sql = `
    SELECT * FROM store 
    WHERE deleted_at IS NULL
    ORDER BY name
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching stores:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Dashboard stats by department
router.get('/dashboard-stats/:department', (req, res) => {
  const { department } = req.params;
  
  // Map department to actual store type
  const storeType = department === 'giftshop' ? 'merchandise' : 'food/drink';
  
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM store WHERE type = ? AND deleted_at IS NULL AND status = 'open') as active_stores,
      (SELECT COUNT(DISTINCT e.employee_id)
       FROM employee e
       JOIN employee_store_job esj ON e.employee_id = esj.employee_id
       JOIN store s ON esj.store_id = s.store_id
       WHERE s.type = ? AND e.job_title = 'Sales Employee'
       AND e.deleted_at IS NULL AND e.terminate_date IS NULL) as active_employees,
      (SELECT COUNT(*)
       FROM store_inventory si
       JOIN store s ON si.store_id = s.store_id
       WHERE s.type = ? AND si.stock_quantity < 20) as low_stock_count
  `;
  
  db.query(sql, [storeType, storeType, storeType], (err, results) => {
    if (err) {
      console.error('Error fetching dashboard stats:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results[0]);
  });
});

// Top items by department
router.get('/top-items/:department', (req, res) => {
  const { department } = req.params;
  const { limit = 5 } = req.query;
  
  // Map department to actual store type
  const storeType = department === 'giftshop' ? 'merchandise' : 'food/drink';
  
  const sql = `
    SELECT 
      m.item_id,
      m.name,
      m.type,
      m.price,
      m.image_url,
      SUM(sod.quantity) as total_sold,
      SUM(sod.quantity * sod.price_per_item) as total_revenue
    FROM merchandise m
    JOIN store_order_detail sod ON m.item_id = sod.item_id
    JOIN store_order so ON sod.store_order_id = so.store_order_id
    JOIN store s ON so.store_id = s.store_id
    WHERE s.type = ?
      AND so.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY m.item_id, m.name, m.type, m.price, m.image_url
    ORDER BY total_revenue DESC
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

// Sales by store
router.get('/sales-by-store', (req, res) => {
  const sql = `
    SELECT 
      s.store_id,
      s.name as store_name,
      s.type as store_type,
      COUNT(DISTINCT so.store_order_id) as total_orders,
      COALESCE(SUM(so.total_amount), 0) as total_revenue
    FROM store s
    LEFT JOIN store_order so ON s.store_id = so.store_id
      AND so.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    WHERE s.deleted_at IS NULL
    GROUP BY s.store_id, s.name, s.type
    ORDER BY total_revenue DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching store sales:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// ==================== EMPLOYEES ====================

// Assign employee to store
router.post('/assign-employee', (req, res) => {
  const { employee_id, store_id, work_date, shift_start, shift_end } = req.body;
  
  if (!employee_id || !store_id || !work_date || !shift_start || !shift_end) {
    return res.status(400).json({ 
      error: 'All fields are required',
      received: { employee_id, store_id, work_date, shift_start, shift_end }
    });
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
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      
      res.json({ 
        message: 'Employee assigned successfully',
        affectedRows: result.affectedRows 
      });
    }
  );
});

// Request employee removal
router.post('/request-employee-removal', (req, res) => {
  const { employee_id, reason } = req.body;
  
  if (!employee_id || !reason) {
    return res.status(400).json({ error: 'Employee ID and reason are required' });
  }
  
  res.json({ message: 'Removal request submitted successfully' });
});

// Update employee
router.put('/employees/:employee_id', (req, res) => {
  const { employee_id } = req.params;
  const { first_name, last_name, email, phone } = req.body;
  
  const sql = `
    UPDATE employee 
    SET first_name = ?, last_name = ?, email = ?, phone = ?
    WHERE employee_id = ?
  `;
  
  db.query(sql, [first_name, last_name, email, phone, employee_id], (err, result) => {
    if (err) {
      console.error('Error updating employee:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Employee updated successfully' });
  });
});

// ==================== INVENTORY ====================

// Get all inventory
router.get('/inventory/all', (req, res) => {
  const sql = `
    SELECT 
      m.*,
      si.stock_quantity,
      s.store_id,
      s.name as store_name,
      CASE 
        WHEN si.stock_quantity = 0 THEN 'critical'
        WHEN si.stock_quantity < 10 THEN 'low'
        ELSE 'normal'
      END as stock_status
    FROM merchandise m
    JOIN store_inventory si ON m.item_id = si.item_id
    JOIN store s ON si.store_id = s.store_id
    WHERE s.deleted_at IS NULL
    ORDER BY s.name, m.name
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching inventory:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Update inventory stock
router.put('/inventory/:store_id/:item_id', (req, res) => {
  const { store_id, item_id } = req.params;
  const { stock_quantity } = req.body;
  
  const sql = `
    INSERT INTO store_inventory (store_id, item_id, stock_quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE stock_quantity = ?
  `;
  
  db.query(sql, [store_id, item_id, stock_quantity, stock_quantity], (err, result) => {
    if (err) {
      console.error('Error updating inventory:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Inventory updated successfully' });
  });
});

// Delete inventory item from store
router.delete('/inventory/:store_id/:item_id', (req, res) => {
  const { store_id, item_id } = req.params;
  
  const sql = `DELETE FROM store_inventory WHERE store_id = ? AND item_id = ?`;
  
  db.query(sql, [store_id, item_id], (err, result) => {
    if (err) {
      console.error('Error deleting inventory:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Inventory item removed' });
  });
});

// Upload merchandise photo
router.post('/upload/merchandise', uploadMerchandise.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const photo_path = `/uploads/merchandise_photos/${req.file.filename}`;
  res.json({ photo_path });
});

// Create merchandise
router.post('/merchandise', (req, res) => {
  const { name, price, quantity, description, type, image_url } = req.body;

  console.log('Creating merchandise with data:', { name, price, quantity, description, type, image_url });

  const sql = `
    INSERT INTO merchandise (name, price, quantity, description, type, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, price, quantity, description, type, image_url], (err, result) => {
    if (err) {
      console.error('Error creating merchandise:', err);
      console.error('SQL parameters:', [name, price, quantity, description, type, image_url]);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    console.log('Merchandise created successfully with ID:', result.insertId);
    res.json({
      message: 'Merchandise created successfully',
      item_id: result.insertId
    });
  });
});

// Update merchandise
router.put('/merchandise/:item_id', (req, res) => {
  const { item_id } = req.params;
  const { name, price, quantity, description, type, image_url } = req.body;

  const sql = `
    UPDATE merchandise
    SET name = ?, price = ?, quantity = ?, description = ?, type = ?, image_url = ?
    WHERE item_id = ?
  `;

  db.query(sql, [name, price, quantity, description, type, image_url, item_id], (err, result) => {
    if (err) {
      console.error('Error updating merchandise:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Merchandise updated successfully' });
  });
});

// ==================== SCHEDULES ====================

// Get schedules - FIXED: no schedule_id
router.get('/schedules/all', (req, res) => {
  const { start_date, end_date } = req.query;
  
  let sql = `
    SELECT 
      esj.employee_id,
      esj.store_id,
      esj.work_date,
      esj.shift_start,
      esj.shift_end,
      e.first_name,
      e.last_name,
      s.name as store_name
    FROM employee_store_job esj
    JOIN employee e ON esj.employee_id = e.employee_id
    JOIN store s ON esj.store_id = s.store_id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (start_date && end_date) {
    sql += ` AND esj.work_date BETWEEN ? AND ?`;
    params.push(start_date, end_date);
  }
  
  sql += ` ORDER BY esj.work_date, esj.shift_start`;
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching schedules:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Delete schedule - FIXED: use composite key
router.delete('/schedule/:employee_id/:store_id/:work_date', (req, res) => {
  const { employee_id, store_id, work_date } = req.params;
  
  const sql = `DELETE FROM employee_store_job WHERE employee_id = ? AND store_id = ? AND work_date = ?`;
  
  db.query(sql, [employee_id, store_id, work_date], (err, result) => {
    if (err) {
      console.error('Error deleting schedule:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  });
});

// ==================== REPORTS ====================

// Sales Revenue Report
router.get('/reports/sales-revenue', (req, res) => {
  const { start_date, end_date, store_id, group_by } = req.query;
  
  let sql = `
    SELECT 
      DATE_FORMAT(so.order_date, ?) as period,
      s.name as store_name,
      s.type as store_type,
      COUNT(DISTINCT so.store_order_id) as total_orders,
      SUM(sod.quantity) as total_items_sold,
      SUM(sod.subtotal) as total_revenue,
      AVG(so.total_amount) as avg_order_value
    FROM store_order so
    JOIN store s ON so.store_id = s.store_id
    JOIN store_order_detail sod ON so.store_order_id = sod.store_order_id
    WHERE so.order_date BETWEEN ? AND ?
  `;
  
  const params = [];
  
  const dateFormat = group_by === 'day' ? '%Y-%m-%d' : 
                     group_by === 'week' ? '%Y-W%u' :
                     group_by === 'month' ? '%Y-%m' : '%Y-%m-%d';
  params.push(dateFormat);
  params.push(start_date, end_date);
  
  if (store_id && store_id !== 'all') {
    sql += ' AND so.store_id = ?';
    params.push(store_id);
  }
  
  sql += ` GROUP BY period, s.store_id, s.name, s.type
           ORDER BY period DESC, total_revenue DESC`;
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error generating sales report:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const totals = {
      total_orders: results.reduce((sum, row) => sum + row.total_orders, 0),
      total_items_sold: results.reduce((sum, row) => sum + row.total_items_sold, 0),
      total_revenue: results.reduce((sum, row) => sum + parseFloat(row.total_revenue), 0),
      avg_order_value: results.length > 0 ? 
        results.reduce((sum, row) => sum + parseFloat(row.avg_order_value), 0) / results.length : 0
    };
    
    res.json({ data: results, totals });
  });
});

// Employee Performance Report
router.get('/reports/employee-performance', (req, res) => {
  const { start_date, end_date } = req.query;
  
  const sql = `
    SELECT 
      e.employee_id,
      e.first_name,
      e.last_name,
      e.email,
      COUNT(DISTINCT esj.work_date) as days_worked,
      COUNT(DISTINCT CONCAT(esj.store_id, '-', esj.work_date)) as total_shifts,
      SUM(TIMESTAMPDIFF(HOUR, esj.shift_start, esj.shift_end)) as total_hours,
      AVG(TIMESTAMPDIFF(HOUR, esj.shift_start, esj.shift_end)) as avg_shift_hours,
      GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as stores_worked
    FROM employee e
    LEFT JOIN employee_store_job esj ON e.employee_id = esj.employee_id
    LEFT JOIN store s ON esj.store_id = s.store_id
    WHERE e.job_title = 'Sales Employee'
      AND e.deleted_at IS NULL
      AND e.terminate_date IS NULL
      AND esj.work_date BETWEEN ? AND ?
    GROUP BY e.employee_id, e.first_name, e.last_name, e.email
    ORDER BY total_hours DESC
  `;
  
  db.query(sql, [start_date, end_date], (err, results) => {
    if (err) {
      console.error('Error generating employee report:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const summary = {
      total_employees: results.length,
      total_shifts: results.reduce((sum, row) => sum + row.total_shifts, 0),
      total_hours: results.reduce((sum, row) => sum + (row.total_hours || 0), 0),
      avg_hours_per_employee: results.length > 0 ? 
        results.reduce((sum, row) => sum + (row.total_hours || 0), 0) / results.length : 0
    };
    
    res.json({ data: results, summary });
  });
});

// Inventory Status Report
router.get('/reports/inventory-status', (req, res) => {
  const { store_id, status } = req.query;
  
  let sql = `
    SELECT 
      m.item_id,
      m.name as item_name,
      m.type as item_type,
      m.price,
      s.store_id,
      s.name as store_name,
      s.type as store_type,
      si.stock_quantity,
      CASE 
        WHEN si.stock_quantity = 0 THEN 'out_of_stock'
        WHEN si.stock_quantity < 5 THEN 'critical'
        WHEN si.stock_quantity < 20 THEN 'low'
        ELSE 'normal'
      END as stock_status,
      COALESCE(sales.total_sold, 0) as total_sold_30days,
      COALESCE(sales.revenue, 0) as revenue_30days,
      CASE 
        WHEN COALESCE(sales.total_sold, 0) > 0 
        THEN ROUND(si.stock_quantity / (COALESCE(sales.total_sold, 0) / 30), 1)
        ELSE NULL
      END as days_of_stock
    FROM merchandise m
    JOIN store_inventory si ON m.item_id = si.item_id
    JOIN store s ON si.store_id = s.store_id
    LEFT JOIN (
      SELECT 
        sod.item_id,
        so.store_id,
        SUM(sod.quantity) as total_sold,
        SUM(sod.subtotal) as revenue
      FROM store_order_detail sod
      JOIN store_order so ON sod.store_order_id = so.store_order_id
      WHERE so.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY sod.item_id, so.store_id
    ) sales ON m.item_id = sales.item_id AND s.store_id = sales.store_id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (store_id && store_id !== 'all') {
    sql += ' AND s.store_id = ?';
    params.push(store_id);
  }
  
  if (status && status !== 'all') {
    sql += ` AND CASE 
      WHEN si.stock_quantity = 0 THEN 'out_of_stock'
      WHEN si.stock_quantity < 5 THEN 'critical'
      WHEN si.stock_quantity < 20 THEN 'low'
      ELSE 'normal'
    END = ?`;
    params.push(status);
  }
  
  sql += ' ORDER BY stock_status DESC, si.stock_quantity ASC';
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error generating inventory report:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const summary = {
      total_items: results.length,
      out_of_stock: results.filter(r => r.stock_status === 'out_of_stock').length,
      critical_stock: results.filter(r => r.stock_status === 'critical').length,
      low_stock: results.filter(r => r.stock_status === 'low').length,
      normal_stock: results.filter(r => r.stock_status === 'normal').length,
      total_inventory_value: results.reduce((sum, r) => sum + (r.stock_quantity * r.price), 0),
      total_revenue_30days: results.reduce((sum, r) => sum + parseFloat(r.revenue_30days), 0)
    };
    
    res.json({ data: results, summary });
  });
});

// Get all store orders
router.get('/orders/all', (req, res) => {
  const { start_date, end_date, store_id, customer_id, status, payment_method } = req.query;
  
  let sql = `
    SELECT 
      so.store_order_id,
      so.order_date,
      so.total_amount,
      so.status,
      so.payment_method,
      s.store_id,
      s.name as store_name,
      s.type as store_type,
      c.customer_id,
      c.first_name,
      c.last_name,
      c.email,
      COUNT(sod.item_id) as total_items,
      SUM(sod.quantity) as total_quantity
    FROM store_order so
    JOIN store s ON so.store_id = s.store_id
    JOIN customer c ON so.customer_id = c.customer_id
    LEFT JOIN store_order_detail sod ON so.store_order_id = sod.store_order_id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (start_date && end_date) {
    sql += ' AND so.order_date BETWEEN ? AND ?';
    params.push(start_date, end_date);
  }
  
  if (store_id && store_id !== 'all') {
    sql += ' AND so.store_id = ?';
    params.push(store_id);
  }
  
  if (customer_id) {
    sql += ' AND so.customer_id = ?';
    params.push(customer_id);
  }
  
  if (status && status !== 'all') {
    sql += ' AND so.status = ?';
    params.push(status);
  }
  
  if (payment_method && payment_method !== 'all') {
    sql += ' AND so.payment_method = ?';
    params.push(payment_method);
  }
  
  sql += ` GROUP BY so.store_order_id, so.order_date, so.total_amount, so.status, 
           so.payment_method, s.store_id, s.name, s.type, c.customer_id, 
           c.first_name, c.last_name, c.email
           ORDER BY so.order_date DESC, so.store_order_id DESC`;
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get order details by order ID
router.get('/orders/:order_id/details', (req, res) => {
  const { order_id } = req.params;
  
  const sql = `
    SELECT 
      sod.*,
      m.name as item_name,
      m.type as item_type,
      m.image_url
    FROM store_order_detail sod
    JOIN merchandise m ON sod.item_id = m.item_id
    WHERE sod.store_order_id = ?
    ORDER BY sod.item_id
  `;
  
  db.query(sql, [order_id], (err, results) => {
    if (err) {
      console.error('Error fetching order details:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

export default router;