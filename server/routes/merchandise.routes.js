import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /api/merchandise - Get all merchandise
router.get('/merchandise', (req, res) => {
  const sql = 'SELECT * FROM merchandise ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching merchandise:', err);
      return res.status(500).json({ error: 'Failed to fetch merchandise' });
    }
    res.json({ data: results });
  });
});

// POST /api/merchandise - Add new merchandise
router.post('/merchandise', (req, res) => {
  const { name, price, quantity, description, type, image_url } = req.body;

  if (!name || !price || !description || !type) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = `
    INSERT INTO merchandise (name, price, description, type, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, price, quantity, description, type, image_url], (err, result) => {
    if (err) {
      console.error('Error adding merchandise:', err);
      return res.status(500).json({ error: 'Failed to add merchandise', message: err.message });
    }
    res.json({
      message: 'Merchandise added successfully',
      item_id: result.insertId
    });
  });
});

// PUT /api/merchandise/:id - Update merchandise
router.put('/merchandise/:id', (req, res) => {
  const { name, price, quantity, description, type, image_url } = req.body;
  const itemId = req.params.id;

  const sql = `
    UPDATE merchandise
    SET name = ?, price = ?, quantity = ?, description = ?, type = ?, image_url = ?
    WHERE item_id = ?
  `;

  db.query(sql, [name, price, quantity, description, type, image_url, itemId], (err, result) => {
    if (err) {
      console.error('Error updating merchandise:', err);
      return res.status(500).json({ error: 'Failed to update merchandise' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Merchandise not found' });
    }
    res.json({ message: 'Merchandise updated successfully' });
  });
});

// DELETE /api/merchandise/:id - Delete merchandise (hard delete since no deleted_at column)
router.delete('/merchandise/:id', (req, res) => {
  const itemId = req.params.id;
  const sql = 'DELETE FROM merchandise WHERE item_id = ?';

  db.query(sql, [itemId], (err, result) => {
    if (err) {
      console.error('Error deleting merchandise:', err);
      return res.status(500).json({ error: 'Failed to delete merchandise' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Merchandise not found' });
    }
    res.json({ message: 'Merchandise deleted successfully' });
  });
});

// GET /api/store-inventory - Get inventory for all stores
router.get('/store-inventory', (req, res) => {
  // First check if store_inventory table has any data
  const checkSql = 'SELECT COUNT(*) as count FROM store_inventory';

  db.query(checkSql, (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Error checking store_inventory:', checkErr);
      return res.status(500).json({ error: 'Failed to check inventory table' });
    }

    console.log('Store inventory count:', checkResults[0].count);

    if (checkResults[0].count === 0) {
      return res.json({ data: [] });
    }

    const sql = `
      SELECT si.store_id, si.item_id, si.stock_quantity, si.created_at, si.updated_at,
             s.name as store_name, s.type as store_type,
             m.name as item_name, m.price, m.description, m.type as item_type
      FROM store_inventory si
      JOIN store s ON si.store_id = s.store_id
      JOIN merchandise m ON si.item_id = m.item_id
      WHERE s.deleted_at IS NULL
      ORDER BY s.name, m.name
    `;

    console.log('Executing inventory SQL');

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching store inventory:', err);
        return res.status(500).json({ error: 'Failed to fetch inventory', details: err.message });
      }
      console.log('Inventory results:', results ? results.length : 'null');
      res.json({ data: results || [] });
    });
  });
});

// GET /api/store-inventory/:storeId - Get inventory for a specific store
router.get('/store-inventory/:storeId', (req, res) => {
  const storeId = req.params.storeId;
  const sql = `
    SELECT si.store_id, si.item_id, si.stock_quantity, si.created_at, si.updated_at,
           m.name as item_name, m.price, m.description, m.type as item_type, m.image_url
    FROM store_inventory si
    JOIN merchandise m ON si.item_id = m.item_id
    WHERE si.store_id = ?
    ORDER BY m.name
  `;

  db.query(sql, [storeId], (err, results) => {
    if (err) {
      console.error('Error fetching store inventory:', err);
      return res.status(500).json({ error: 'Failed to fetch inventory' });
    }
    res.json({ data: results });
  });
});

// PUT /api/store-inventory/:storeId/:itemId - Update stock quantity for a store-item combination
router.put('/store-inventory/:storeId/:itemId', (req, res) => {
  const { storeId, itemId } = req.params;
  const { stock_quantity } = req.body;

  if (stock_quantity < 0) {
    return res.status(400).json({ error: 'Stock quantity cannot be negative' });
  }

  const sql = `
    UPDATE store_inventory
    SET stock_quantity = ?
    WHERE store_id = ? AND item_id = ?
  `;

  db.query(sql, [stock_quantity, storeId, itemId], (err, result) => {
    if (err) {
      console.error('Error updating inventory:', err);
      return res.status(500).json({ error: 'Failed to update inventory' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json({ message: 'Inventory updated successfully' });
  });
});

// POST /api/store-inventory - Add item to store inventory
router.post('/store-inventory', (req, res) => {
  const { store_id, item_id, stock_quantity } = req.body;

  if (!store_id || !item_id || stock_quantity === undefined) {
    return res.status(400).json({ error: 'Store ID, item ID, and stock quantity are required' });
  }

  if (stock_quantity < 0) {
    return res.status(400).json({ error: 'Stock quantity cannot be negative' });
  }

  const sql = `
    INSERT INTO store_inventory (store_id, item_id, stock_quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE stock_quantity = VALUES(stock_quantity)
  `;

  db.query(sql, [store_id, item_id, stock_quantity], (invErr) => {
    if (invErr) {
      console.error('Error adding to inventory:', invErr);
      return res.status(500).json({ error: 'Failed to add to inventory', message: invErr.message });
    }
    res.json({ message: 'Item added to inventory successfully' });
  });
});

export default router;