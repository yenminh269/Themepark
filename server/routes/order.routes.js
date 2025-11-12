import express from 'express';
import db from '../config/db.js';
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import { requireCustomerAuth } from '../middleware/auth.js';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();

// Simple email for single order type
async function sendEmail(email, first_name, total_amount) {
  try {
    const msg = {
      to: email,
      from: process.env.SENDER_EMAIL,
      replyTo: "no-reply@velocityvalley.com",
      subject: "🎢 Transaction Confirmation - Velocity Valley",
      html: `
        <h2>Hi ${first_name},</h2>
        <p>Thank you for your purchase!</p>
        <p>Your payment of <strong>$${total_amount.toFixed(2)}</strong> has been successfully processed.</p>
        <p>We can't wait to see you at <strong>Velocity Valley</strong>!</p>
        <hr/>
        <p style="font-size:12px;color:gray;">This is an automated email. Please do not reply.</p>
      `,
    };
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error - we don't want to fail the order if email fails
  }
}

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
            <h3 style="color: #176B87; margin-top: 0;">Total Amount: $${grandTotal.toFixed(2)}</h3>
          </div>

          <p style="margin-top: 30px;">We can't wait to see you at <strong>Velocity Valley</strong>!</p>
          <hr/>
          <p style="font-size:12px;color:gray;">This is an automated email. Please do not reply.</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log(`Consolidated email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending consolidated email:', error);
    // Don't throw error - we don't want to fail the order if email fails
  }
}
// Legacy endpoint - deprecated, use /api/unified-order instead
// POST /api/ride-orders - Create ride order (kept for backward compatibility)
router.post('/ride-orders', requireCustomerAuth, async (req, res) => {
  try {
    const { cart, total } = req.body;
    const customer_id = req.customer_id;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Fetch customer details for email
    const customerSql = 'SELECT email, first_name FROM customer WHERE customer_id = ?';
    const customer = await new Promise((resolve, reject) => {
      db.query(customerSql, [customer_id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });

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

    // Send confirmation email
    if (customer && customer.email && customer.first_name) {
      await sendEmail(customer.email, customer.first_name, total);
    }

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
router.get("/ride-orders", requireCustomerAuth, (req, res) => {
  const customerId = req.customer_id;
  const range = req.query.range || "all"; // "today", "7d", "month", "all"

  let whereClause = "WHERE customer_id = ?";
  const params = [customerId];

  if (range === "today") {
    whereClause += " AND DATE(order_date) = CURDATE()";
  } else if (range === "7d") {
    whereClause += " AND order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
  } else if (range === "month") {
    whereClause += " AND order_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
  }
  // "all" means no extra date filter

  const sql = `
    SELECT *
    FROM ride_orders
    ${whereClause}
    ORDER BY order_date DESC
  `;

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("Error fetching ride orders:", err);
      return res.status(500).json({ error: "Database error" });
    }
    return res.json({ data: rows });
  });
});

// Legacy endpoint - deprecated, use /api/unified-order instead
// POST /api/store-orders - Create store order (kept for backward compatibility)
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

    // Fetch customer details for email
    const customerSql = 'SELECT email, first_name FROM customer WHERE customer_id = ?';
    const customer = await new Promise((resolve, reject) => {
      db.query(customerSql, [customer_id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });

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

    // Send confirmation email
    if (customer && customer.email && customer.first_name) {
      await sendEmail(customer.email, customer.first_name, total);
    }

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
router.get("/store-orders", requireCustomerAuth, (req, res) => {
  const customerId = req.customer_id;
  const range = req.query.range || "all";

  let whereClause = "WHERE customer_id = ?";
  const params = [customerId];

  if (range === "today") {
    whereClause += " AND DATE(order_date) = CURDATE()";
  } else if (range === "7d") {
    whereClause += " AND order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
  } else if (range === "month") {
    whereClause += " AND order_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
  }

  const sql = `
    SELECT *
    FROM store_orders
    ${whereClause}
    ORDER BY order_date DESC
  `;

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("Error fetching store orders:", err);
      return res.status(500).json({ error: "Database error" });
    }
    return res.json({ data: rows });
  });
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
      const storeGroups = storeCart.reduce((groups, item) => {
        const storeId = item.storeId;
        if (!groups[storeId]) {
          groups[storeId] = [];
        }
        groups[storeId].push(item);
        return groups;
      }, {});

      // Create order for each store
      for (const [storeId, items] of Object.entries(storeGroups)) {
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
