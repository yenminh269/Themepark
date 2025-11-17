import express from 'express';
import db from '../config/db.js';
import { uploadMerchandise } from '../config/upload.js';

const router = express.Router();

// ============================================
// UPLOAD ENDPOINT (CRITICAL FOR ADD ITEM)
// ============================================
router.post('/upload/merchandise', uploadMerchandise.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const photoPath = `/uploads/merchandise_photos/${req.file.filename}`;
  res.json({ 
    message: 'Photo uploaded successfully',
    photo_path: photoPath 
  });
});

// ============================================
// EMPLOYEE ROUTES
// ============================================
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

router.put('/employee/:employee_id', (req, res) => {
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

// ============================================
// STORE ROUTES
// ============================================
router.get('/stores/all', (req, res) => {
  const sql = `SELECT * FROM store WHERE deleted_at IS NULL ORDER BY name`;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching stores:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// ============================================
// DASHBOARD & ANALYTICS ROUTES
// ============================================
router.get('/dashboard-stats/:department', (req, res) => {
  const { department } = req.params;
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
       WHERE s.type = ? AND si.stock_quantity < 10) as low_stock_count
  `;
  
  db.query(sql, [storeType, storeType, storeType], (err, results) => {
    if (err) {
      console.error('Error fetching dashboard stats:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results[0]);
  });
});

router.get('/top-items/:department', (req, res) => {
  const { department } = req.params;
  const { limit = 5 } = req.query;
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

// ============================================
// SCHEDULE ROUTES (WITH DATE FORMATTING FIXES)
// ============================================
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

router.post('/assign-employee', async (req, res) => {
  const { employee_id, store_id, work_date, shift_start, shift_end } = req.body;
  
  if (!employee_id || !store_id || !work_date || !shift_start || !shift_end) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Format date to YYYY-MM-DD if needed
  const formattedDate = work_date.split('T')[0];

  const overlapCheck = `
    SELECT COUNT(*) as overlap_count
    FROM employee_store_job
    WHERE employee_id = ?
      AND work_date = ?
      AND (
        (shift_start <= ? AND shift_end > ?) OR
        (shift_start < ? AND shift_end >= ?) OR
        (shift_start >= ? AND shift_end <= ?)
      )
  `;

  db.query(overlapCheck, [
    employee_id, formattedDate, 
    shift_start, shift_start,
    shift_end, shift_end,
    shift_start, shift_end
  ], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (results[0].overlap_count > 0) {
      return res.status(400).json({ 
        error: 'Employee already has a shift during this time. Choose different shift times.' 
      });
    }

    const sql = `
      INSERT INTO employee_store_job 
        (employee_id, store_id, work_date, shift_start, shift_end)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [employee_id, store_id, formattedDate, shift_start, shift_end], 
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        res.json({ message: 'Employee assigned successfully' });
      }
    );
  });
});

// CRITICAL FIX: Update schedule with proper date handling
router.put('/schedule/:employee_id/:store_id/:work_date', (req, res) => {
  const { employee_id, store_id, work_date } = req.params;
  const { new_store_id, new_work_date, shift_start, shift_end } = req.body;
  
  console.log('Update schedule request:', {
    params: { employee_id, store_id, work_date },
    body: { new_store_id, new_work_date, shift_start, shift_end }
  });
  
  // Format dates to ensure YYYY-MM-DD
  const formattedOldDate = work_date.split('T')[0];
  const finalStoreId = new_store_id || store_id;
  const finalWorkDate = new_work_date ? new_work_date.split('T')[0] : formattedOldDate;
  
  // Check for overlapping shifts on the NEW date (excluding the current schedule)
  const overlapCheck = `
    SELECT COUNT(*) as overlap_count
    FROM employee_store_job
    WHERE employee_id = ?
      AND work_date = ?
      AND NOT (store_id = ? AND work_date = ?)
      AND (
        (? < shift_end AND ? > shift_start) OR
        (? < shift_end AND ? > shift_start) OR
        (? >= shift_start AND ? <= shift_end)
      )
  `;

  db.query(overlapCheck, [
    employee_id, 
    finalWorkDate,
    store_id, 
    formattedOldDate,
    shift_start, shift_start,
    shift_end, shift_end,
    shift_start, shift_end
  ], (err, results) => {
    if (err) {
      console.error('Overlap check error:', err);
      return res.status(500).json({ error: 'Database error checking overlaps' });
    }

    if (results[0].overlap_count > 0) {
      return res.status(400).json({ 
        error: 'Employee already has a shift during this time on this date.' 
      });
    }

    // First, delete the old schedule entry
    const deleteSql = `
      DELETE FROM employee_store_job 
      WHERE employee_id = ? AND store_id = ? AND work_date = ?
    `;
    
    db.query(deleteSql, [employee_id, store_id, formattedOldDate], (err, deleteResult) => {
      if (err) {
        console.error('Delete error:', err);
        return res.status(500).json({ error: 'Error deleting old schedule' });
      }

      // Then insert the new schedule
      const insertSql = `
        INSERT INTO employee_store_job (employee_id, store_id, work_date, shift_start, shift_end)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(insertSql, [
        employee_id, 
        finalStoreId, 
        finalWorkDate, 
        shift_start, 
        shift_end
      ], (err, insertResult) => {
        if (err) {
          console.error('Insert error:', err);
          return res.status(500).json({ error: 'Error creating new schedule' });
        }

        res.json({ message: 'Schedule updated successfully' });
      });
    });
  });
});

// CRITICAL FIX: Delete schedule with proper date formatting
router.delete('/schedule/:employee_id/:store_id/:work_date', (req, res) => {
  const { employee_id, store_id, work_date } = req.params;
  
  // Format the date to ensure it's YYYY-MM-DD format
  const formattedDate = work_date.split('T')[0];
  
  console.log('Delete schedule:', { employee_id, store_id, work_date: formattedDate });
  
  const sql = `DELETE FROM employee_store_job WHERE employee_id = ? AND store_id = ? AND work_date = ?`;
  
  db.query(sql, [employee_id, store_id, formattedDate], (err, result) => {
    if (err) {
      console.error('Error deleting schedule:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ message: 'Schedule deleted successfully' });
  });
});

// ============================================
// INVENTORY ROUTES
// ============================================
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

// ============================================
// MERCHANDISE ROUTES (CRITICAL FOR ADD ITEM)
// ============================================
router.post('/merchandise', (req, res) => {
  const { name, price, quantity, description, type, image_url } = req.body;
  
  console.log('Creating merchandise:', req.body);
  
  if (!name || !price || !description || !type || !image_url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const sql = `
    INSERT INTO merchandise (name, price, description, type, image_url)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.query(sql, [
    name, 
    parseFloat(price), 
    description, 
    type, 
    image_url
  ], (err, result) => {
    if (err) {
      console.error('Error creating merchandise:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json({ 
      message: 'Merchandise created successfully',
      item_id: result.insertId 
    });
  });
});

router.put('/merchandise/:item_id', (req, res) => {
  const { item_id } = req.params;
  const { name, price, description, type } = req.body;
  
  const sql = `
    UPDATE merchandise 
    SET name = ?, price = ?, description = ?, type = ?
    WHERE item_id = ?
  `;
  
  db.query(sql, [name, price, description, type, item_id], (err, result) => {
    if (err) {
      console.error('Error updating merchandise:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Merchandise updated successfully' });
  });
});

// ============================================
// ORDERS ROUTES
// ============================================
router.get('/orders/all', (req, res) => {
  const { start_date, end_date, store_id, status, payment_method } = req.query;
  
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