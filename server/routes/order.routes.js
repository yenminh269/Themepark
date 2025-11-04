import express from 'express';
import db from '../config/db.js';
import { requireCustomerAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/ride-orders - Create ride order
router.post('/ride-orders', requireCustomerAuth, async (req, res) => {
  try {
    const { cart, total } = req.body;
    const customer_id = req.customer_id;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Create the ride_order
    const orderSql = `
      INSERT INTO ride_order (customer_id, order_date, total_amount, status)
      VALUES (?, CURDATE(), ?, 'completed')
    `;

    const orderResult = await new Promise((resolve, reject) => {
      db.query(orderSql, [customer_id, total], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const order_id = orderResult.insertId;

    // Insert order details for each ride in cart
    const detailPromises = cart.map((item) => {
      const detailSql = `
        INSERT INTO ride_order_detail (order_id, ride_id, number_of_tickets, price_per_ticket, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `;
      const subtotal = item.price * item.quantity;

      return new Promise((resolve, reject) => {
        db.query(
          detailSql,
          [order_id, item.id, item.quantity, item.price, subtotal],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });
    });

    await Promise.all(detailPromises);

    res.json({
      message: 'Order created successfully',
      order: {
        order_id,
        customer_id,
        total_amount: total,
        status: 'completed',
        order_date: new Date().toISOString().split('T')[0],
      },
    });
  } catch (err) {
    console.error('Error creating ride order:', err);
    res.status(500).json({ error: 'Failed to create order', message: err.message });
  }
});

// GET /api/ride-orders - Get customer's ride orders
router.get('/ride-orders', requireCustomerAuth, async (req, res) => {
  try {
    const customer_id = req.customer_id;

    const sql = `
      SELECT
        ro.order_id,
        ro.order_date,
        ro.total_amount,
        ro.status,
        rod.ride_id,
        r.name as ride_name,
        rod.number_of_tickets,
        rod.price_per_ticket,
        rod.subtotal
      FROM ride_order ro
      LEFT JOIN ride_order_detail rod ON ro.order_id = rod.order_id
      LEFT JOIN ride r ON rod.ride_id = r.ride_id
      WHERE ro.customer_id = ?
      ORDER BY ro.order_date DESC, ro.order_id DESC
    `;

    db.query(sql, [customer_id], (err, results) => {
      if (err) {
        console.error('Error fetching ride orders:', err);
        return res.status(500).json({ error: 'Failed to fetch orders' });
      }

      // Group order details by order_id
      const ordersMap = {};
      results.forEach((row) => {
        if (!ordersMap[row.order_id]) {
          ordersMap[row.order_id] = {
            order_id: row.order_id,
            order_date: row.order_date,
            total_amount: row.total_amount,
            status: row.status,
            items: [],
          };
        }
        if (row.ride_id) {
          ordersMap[row.order_id].items.push({
            ride_id: row.ride_id,
            ride_name: row.ride_name,
            number_of_tickets: row.number_of_tickets,
            price_per_ticket: row.price_per_ticket,
            subtotal: row.subtotal,
          });
        }
      });

      const orders = Object.values(ordersMap);
      res.json({ data: orders });
    });
  } catch (err) {
    console.error('Error fetching ride orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/store-orders - Create store order
router.post('/store-orders', requireCustomerAuth, async (req, res) => {
  try {
    const { cart, total, payment_method, store_id } = req.body;
    const customer_id = req.customer_id;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    if (!payment_method || !store_id) {
      return res.status(400).json({ error: 'Payment method and store ID are required' });
    }

    // Verify all items are available in the selected store
    for (const item of cart) {
      const checkSql = `
        SELECT si.stock_quantity, m.quantity as total_quantity
        FROM store_inventory si
        JOIN merchandise m ON si.item_id = m.item_id
        WHERE si.store_id = ? AND si.item_id = ?
      `;
      const inventory = await new Promise((resolve, reject) => {
        db.query(checkSql, [store_id, item.id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (inventory.length === 0) {
        return res.status(400).json({ error: `Item ${item.name} is not available in this store` });
      }

      if (inventory[0].stock_quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${item.name}. Available: ${inventory[0].stock_quantity}` });
      }
    }

    // Create the store_order
    const orderSql = `
      INSERT INTO store_order (store_id, customer_id, order_date, total_amount, status, payment_method)
      VALUES (?, ?, CURDATE(), ?, 'completed', ?)
    `;

    const orderResult = await new Promise((resolve, reject) => {
      db.query(orderSql, [store_id, customer_id, total, payment_method], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const store_order_id = orderResult.insertId;

    // Insert order details and update inventory
    const detailPromises = cart.map((item) => {
      const detailSql = `
        INSERT INTO store_order_detail (store_order_id, item_id, quantity, price_per_item, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `;
      const subtotal = item.price * item.quantity;

      return new Promise((resolve, reject) => {
        db.query(
          detailSql,
          [store_order_id, item.id, item.quantity, item.price, subtotal],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });
    });

    // Update inventory quantities
    const inventoryPromises = cart.map((item) => {
      const updateSql = `
        UPDATE store_inventory
        SET stock_quantity = stock_quantity - ?
        WHERE store_id = ? AND item_id = ?
      `;

      return new Promise((resolve, reject) => {
        db.query(updateSql, [item.quantity, store_id, item.id], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    });

    await Promise.all([...detailPromises, ...inventoryPromises]);

    res.json({
      message: 'Store order created successfully',
      order: {
        store_order_id,
        store_id,
        customer_id,
        total_amount: total,
        payment_method,
        status: 'completed',
        order_date: new Date().toISOString().split('T')[0],
      },
    });
  } catch (err) {
    console.error('Error creating store order:', err);
    res.status(500).json({ error: 'Failed to create order', message: err.message });
  }
});

// GET /api/store-orders - Get customer's store orders
router.get('/store-orders', requireCustomerAuth, async (req, res) => {
  try {
    const customer_id = req.customer_id;

    const sql = `
      SELECT so.store_order_id, so.store_id, s.name as store_name, so.order_date,
             so.total_amount, so.status, so.payment_method,
             sod.item_id, m.name as item_name, sod.quantity, sod.price_per_item, sod.subtotal
      FROM store_order so
      LEFT JOIN store_order_detail sod ON so.store_order_id = sod.store_order_id
      LEFT JOIN merchandise m ON sod.item_id = m.item_id
      LEFT JOIN store s ON so.store_id = s.store_id
      WHERE so.customer_id = ?
      ORDER BY so.order_date DESC, so.store_order_id DESC
    `;

    db.query(sql, [customer_id], (err, results) => {
      if (err) {
        console.error('Error fetching store orders:', err);
        return res.status(500).json({ error: 'Failed to fetch orders' });
      }

      // Group order details by order_id
      const ordersMap = {};
      results.forEach((row) => {
        if (!ordersMap[row.store_order_id]) {
          ordersMap[row.store_order_id] = {
            store_order_id: row.store_order_id,
            store_id: row.store_id,
            store_name: row.store_name,
            order_date: row.order_date,
            total_amount: row.total_amount,
            status: row.status,
            payment_method: row.payment_method,
            items: [],
          };
        }
        if (row.item_id) {
          ordersMap[row.store_order_id].items.push({
            item_id: row.item_id,
            item_name: row.item_name,
            quantity: row.quantity,
            price_per_item: row.price_per_item,
            subtotal: row.subtotal,
          });
        }
      });

      const orders = Object.values(ordersMap);
      res.json({ data: orders });
    });
  } catch (err) {
    console.error('Error fetching store orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;
