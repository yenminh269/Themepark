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
router.get("/ride-orders", requireCustomerAuth, async (req, res) => {
  const customerId = req.customer_id;
  const range = req.query.range || "all"; // "today", "7d", "month", "all"

  let whereClause = "WHERE ro.customer_id = ?";
  const params = [customerId];

  if (range === "today") {
    whereClause += " AND DATE(ro.order_date) = CURDATE()";
  } else if (range === "7d") {
    whereClause += " AND ro.order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
  } else if (range === "month") {
    whereClause += " AND ro.order_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
  }
  // "all" means no extra date filter

  const sql = `
    SELECT ro.*
    FROM ride_order ro
    ${whereClause}
    ORDER BY ro.order_id DESC
  `;

  db.query(sql, params, async (err, orders) => {
    if (err) {
      console.error("Error fetching ride orders:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Fetch order details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const detailsSql = `
          SELECT rod.*, r.name as ride_name
          FROM ride_order_detail rod
          JOIN ride r ON rod.ride_id = r.ride_id
          WHERE rod.order_id = ?
        `;

        const items = await new Promise((resolve, reject) => {
          db.query(detailsSql, [order.order_id], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });

        return { ...order, items };
      })
    );

    return res.json({ data: ordersWithDetails });
  });
});


// GET /api/store-orders - Get customer's store orders
router.get("/store-orders", requireCustomerAuth, async (req, res) => {
  const customerId = req.customer_id;
  const range = req.query.range || "all";

  let whereClause = "WHERE so.customer_id = ?";
  const params = [customerId];

  if (range === "today") {
    whereClause += " AND DATE(so.order_date) = CURDATE()";
  } else if (range === "7d") {
    whereClause += " AND so.order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
  } else if (range === "month") {
    whereClause += " AND so.order_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
  }

  const sql = `
    SELECT so.*, s.name as store_name
    FROM store_order so
    JOIN store s ON so.store_id = s.store_id
    ${whereClause}
    ORDER BY so.store_order_id DESC
  `;

  db.query(sql, params, async (err, orders) => {
    if (err) {
      console.error("Error fetching store orders:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Fetch order details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const detailsSql = `
          SELECT sod.*, m.name as item_name
          FROM store_order_detail sod
          JOIN merchandise m ON sod.item_id = m.item_id
          WHERE sod.store_order_id = ?
        `;

        const items = await new Promise((resolve, reject) => {
          db.query(detailsSql, [order.store_order_id], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });

        return { ...order, items };
      })
    );

    return res.json({ data: ordersWithDetails });
  });
});

// POST /api/unified-order - Create unified order (rides + store items in one transaction)
router.post('/unified-order', requireCustomerAuth, async (req, res) => {
  console.log('🛒 Unified order request received');
  try {
    const { rideCart = [], storeCart = [], grandTotal, payment_method, email, firstName } = req.body;
    const customer_id = req.customer_id;
     console.log(`Ride items: ${rideCart.length}, Store items: ${storeCart.length}, Total: $${grandTotal}`);

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
      // Validate all store items have storeId
      for (const item of storeCart) {
        if (!item.storeId) {
          console.error('Store item missing storeId:', item);
          return res.status(400).json({ error: `Store item ${item.name || 'unknown'} is missing storeId` });
        }
        if (!item.id) {
          console.error('Store item missing id:', item);
          return res.status(400).json({ error: `Store item ${item.name || 'unknown'} is missing item id` });
        }
      }

      const storeGroups = storeCart.reduce((groups, item) => {
        // Ensure storeId is consistently a number to avoid duplicate groups
        const storeId = parseInt(item.storeId);
        console.log(`Processing item: ${item.name}, storeId type: ${typeof item.storeId}, value: ${item.storeId}, parsed: ${storeId}`);
        if (!groups[storeId]) {
          groups[storeId] = [];
        }
        groups[storeId].push(item);
        return groups;
      }, {});
      console.log('Grouped stores:', Object.keys(storeGroups));
      console.log('Number of store groups:', Object.keys(storeGroups).length);
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
        console.log(`Created store_order with ID ${store_order_id} for store ${storeId}`);

        // Insert order details
        // Note: Inventory is automatically decreased by the after_store_order_detail_insert trigger
        console.log(`Inserting ${items.length} details for store_order_id ${store_order_id}`);
        const detailPromises = items.map((item) => {
          const detailSql = `
            INSERT INTO store_order_detail (store_order_id, item_id, quantity, price_per_item, subtotal)
            VALUES (?, ?, ?, ?, ?)
          `;
          const subtotal = item.price * item.quantity;

          console.log(`Inserting detail: store_order_id=${store_order_id}, item_id=${item.id}, quantity=${item.quantity}, price=${item.price}, subtotal=${subtotal}`);

          return new Promise((resolve, reject) => {
            db.query(
              detailSql,
              [store_order_id, item.id, item.quantity, item.price, subtotal],
              (err, result) => {
                if (err) {
                  console.error(`Error inserting detail for item ${item.id}:`, err);
                  reject(err);
                } else {
                  console.log(`Detail inserted successfully for item ${item.id}`);
                  resolve(result);
                }
              }
            );
          });
        });

        // No manual inventory update needed - the database trigger handles it automatically
        try {
          await Promise.all(detailPromises);
          console.log(`All details inserted for store ${storeId}, inventory automatically updated by trigger`);
        } catch (detailError) {
          console.error(`Error inserting details for store ${storeId}:`, detailError);
          throw detailError;
        }

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
      try {
        await sendConsolidatedEmail(customerEmail, customerFirstName, {
          rideItems: rideCart,
          storeItems: storeCart,
          grandTotal: grandTotal,
        });
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        // Continue even if email fails - order is still created
      }
    } else {
      console.log('⚠️ Skipping email - missing email or firstName');
    }
    res.json({
      message: 'Order created successfully',
      orders: createdOrders,
      total_amount: grandTotal,
    });
  } catch (err) {
    console.error('❌ Error creating unified order:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: 'Failed to create order', message: err.message });
  }
});

export default router;
