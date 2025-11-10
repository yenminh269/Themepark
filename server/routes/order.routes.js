import express from 'express';
import db from '../config/db.js';
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import { requireCustomerAuth } from '../middleware/auth.js';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();

// Consolidated email for mixed orders (rides + store items)
async function sendConsolidatedEmail(email, first_name, orderDetails) {
  try {
    const { rideItems = [], storeItems = [], grandTotal } = orderDetails;
    let itemsHtml = '';
    // Add ride items section
    if (rideItems.length > 0) {
      itemsHtml += `
        <h3 style="color: #176B87; margin-top: 20px;">🎢 Ride Tickets</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #B4D4FF;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Ride</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Quantity</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
      `;

      rideItems.forEach(item => {
        itemsHtml += `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$${item.price.toFixed(2)}</td>
            <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `;
      });

      itemsHtml += `
          </tbody>
        </table>
      `;
    }

    // Add store items section
    if (storeItems.length > 0) {
      itemsHtml += `
        <h3 style="color: #176B87; margin-top: 20px;">🛍️ Merchandise</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #B4D4FF;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Store</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Quantity</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
      `;

      storeItems.forEach(item => {
        itemsHtml += `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.storeName || 'Store'}</td>
            <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$${item.price.toFixed(2)}</td>
            <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `;
      });

      itemsHtml += `
          </tbody>
        </table>
      `;
    }

    const msg = {
      to: email,
      from: process.env.SENDER_EMAIL,
      replyTo: "no-reply@velocityvalley.com",
      subject: "🎢 Transaction Confirmation - Velocity Valley",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #176B87;">Hi ${first_name},</h2>
          <p>Thank you for your purchase!</p>
          <p>Your payment has been successfully processed.</p>

          ${itemsHtml}

          <div style="background-color: #EEF5FF; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <h3 style="color: #176B87; margin-top: 0;">Total Amount: $${grandTotal.toFixed(2)} (tax included)</h3>
          </div>

          <p style="margin-top: 30px;">We can't wait to see you at <strong>Velocity Valley</strong>!</p>
          <hr/>
          <p style="font-size:12px;color:gray;">This is an automated email. Please do not reply.</p>
        </div>
      `,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending consolidated email:', error);
    // Don't throw error - we don't want to fail the order if email fails
  }
}

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

// POST /api/unified-order - Create unified order (rides + store items in one transaction)
router.post('/unified-order', requireCustomerAuth, async (req, res) => {
  try {
    const { rideCart = [], storeCart = [], grandTotal, payment_method, email, firstName } = req.body;
    const customer_id = req.customer_id;

    if (rideCart.length === 0 && storeCart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const customerEmail = email;
    const customerFirstName = firstName;
    const createdOrders = [];

    // Process ride orders if any
    if (rideCart.length > 0) {
      const rideTotal = rideCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const orderSql = `
        INSERT INTO ride_order (customer_id, order_date, total_amount, status)
        VALUES (?, CURDATE(), ?, 'completed')
      `;

      const orderResult = await new Promise((resolve, reject) => {
        db.query(orderSql, [customer_id, rideTotal], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      const order_id = orderResult.insertId;

      // Insert order details for each ride
      const detailPromises = rideCart.map((item) => {
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

      createdOrders.push({
        type: 'ride',
        order_id,
        total_amount: rideTotal,
      });
    }

    // Process store orders if any (grouped by store)
    if (storeCart.length > 0) {
      // Group store items by store_id
      console.log('storeCart received:', JSON.stringify(storeCart, null, 2));
      const storeGroups = storeCart.reduce((groups, item) => {
        const storeId = item.storeId;
        if (!groups[storeId]) {
          groups[storeId] = [];
        }
        groups[storeId].push(item);
        return groups;
      }, {});
      console.log('Grouped stores:', Object.keys(storeGroups));
      console.log('Store groups detail:', JSON.stringify(storeGroups, null, 2));

      // Create order for each store
      for (const [storeId, items] of Object.entries(storeGroups)) {
        console.log(`Creating order for store ${storeId} with ${items.length} items`);
        // Verify inventory
        for (const item of items) {
          const checkSql = `
            SELECT si.stock_quantity
            FROM store_inventory si
            WHERE si.store_id = ? AND si.item_id = ?
          `;
          const inventory = await new Promise((resolve, reject) => {
            db.query(checkSql, [storeId, item.id], (err, results) => {
              if (err) reject(err);
              else resolve(results);
            });
          });

          if (inventory.length === 0) {
            return res.status(400).json({ error: `Item ${item.name} is not available in this store` });
          }

          if (inventory[0].stock_quantity < item.quantity) {
            return res.status(400).json({
              error: `Insufficient stock for ${item.name}. Available: ${inventory[0].stock_quantity}`
            });
          }
        }

        const storeTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const orderSql = `
          INSERT INTO store_order (store_id, customer_id, order_date, total_amount, status, payment_method)
          VALUES (?, ?, CURDATE(), ?, 'completed', ?)
        `;

        const orderResult = await new Promise((resolve, reject) => {
          db.query(orderSql, [storeId, customer_id, storeTotal, payment_method || 'credit_card'], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        const store_order_id = orderResult.insertId;

        // Insert order details
        const detailPromises = items.map((item) => {
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

        // Update inventory
        const inventoryPromises = items.map((item) => {
          const updateSql = `
            UPDATE store_inventory
            SET stock_quantity = stock_quantity - ?
            WHERE store_id = ? AND item_id = ?
          `;

          return new Promise((resolve, reject) => {
            db.query(updateSql, [item.quantity, storeId, item.id], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
        });

        await Promise.all([...detailPromises, ...inventoryPromises]);

        createdOrders.push({
          type: 'store',
          store_order_id,
          store_id: storeId,
          total_amount: storeTotal,
        });
      }
    }

    // Send single consolidated email
    if (customerEmail && customerFirstName) {
      await sendConsolidatedEmail(customerEmail, customerFirstName, {
        rideItems: rideCart,
        storeItems: storeCart,
        grandTotal: grandTotal,
      });
    }
    console.log('Order created successfully');
    res.json({
      message: 'Order created successfully',
      orders: createdOrders,
      total_amount: grandTotal,
    });
  } catch (err) {
    console.error('Error creating unified order:', err);
    res.status(500).json({ error: 'Failed to create order', message: err.message });
  }
});

export default router;
