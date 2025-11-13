import express from 'express';
import bcrypt from 'bcrypt';
import db from '../config/db.js';
import { makeToken, requireCustomerAuth } from '../middleware/auth.js';

const router = express.Router();

// SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      gender,
      email,
      password,
      dob,
      phone,
    } = req.body;

    // basic validation using DB NOT NULL rules
    if (
      !first_name ||
      !last_name ||
      !gender ||
      !email ||
      !password ||
      !dob ||
      !phone
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // does email already exist?
    db.query(
      "SELECT customer_id FROM customer WHERE email = ?",
      [email],
      async (err, rows) => {
        if (err) {
          console.error("SIGNUP email check error:", err);
          return res.status(500).json({ error: "Database error" });
        }

        if (rows.length > 0) {
          return res.status(409).json({ error: "Email already registered" });
        }

        // hash password before insert
        const hashed = await bcrypt.hash(password, 10);

        const insertSql = `
          INSERT INTO customer
          (first_name, last_name, gender, email, password, dob, phone)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          insertSql,
          [
            first_name,
            last_name,
            gender,
            email,
            hashed,
            dob,   // must be 'YYYY-MM-DD'
            phone,
          ],
          (err2, result) => {
            if (err2) {
              console.error("SIGNUP insert error:", err2);
              return res.status(500).json({ error: "Signup failed", detail: err2.message });
            }

            // build object to return
            const newCustomer = {
              customer_id: result.insertId,
              first_name,
              last_name,
              gender,
              email,
              dob,
              phone,
            };

            const token = makeToken(newCustomer);

            return res.json({
              token,
              customer: newCustomer,
            });
          }
        );
      }
    );
  } catch (e) {
    console.error("SIGNUP catch:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

// LOGIN ROUTE
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email and password are required" });
  }

  const sql = `
    SELECT customer_id, first_name, last_name, gender, email, password, dob, phone
    FROM customer
    WHERE email = ?
    LIMIT 1
  `;

  db.query(sql, [email], async (err, rows) => {
    if (err) {
      console.error("LOGIN query error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const userRow = rows[0];

    // compare with hashed password we stored
    const match = await bcrypt.compare(password, userRow.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const customerForToken = {
      customer_id: userRow.customer_id,
      email: userRow.email,
    };

    const token = makeToken(customerForToken);

    // don't send the hashed password back
    const safeCustomer = {
      customer_id: userRow.customer_id,
      first_name: userRow.first_name,
      last_name: userRow.last_name,
      gender: userRow.gender,
      email: userRow.email,
      dob: userRow.dob,
      phone: userRow.phone,
    };

    return res.json({
      token,
      customer: safeCustomer,
    });
  });
});

// GET CUSTOMER INFO (ME)
router.get("/me", requireCustomerAuth, (req, res) => {
  const sql = `
    SELECT customer_id, first_name, last_name, gender, email, dob, phone
    FROM customer
    WHERE customer_id = ?
    LIMIT 1
  `;

  db.query(sql, [req.customer_id], (err, rows) => {
    if (err) {
      console.error("ME query error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const row = rows[0];

    return res.json({
      customer: {
        customer_id: row.customer_id,
        first_name: row.first_name,
        last_name: row.last_name,
        gender: row.gender,
        email: row.email,
        dob: row.dob,
        phone: row.phone,
      },
    });
  });
});

// UPDATE CUSTOMER INFO
router.put("/:id", requireCustomerAuth, (req, res) => {
  const customerId = req.params.id;

  // Ensure customer can only update their own information
  if (parseInt(customerId) !== req.customer_id) {
    return res.status(403).json({ error: "Unauthorized to update this customer" });
  }

  const { first_name, last_name, gender, phone } = req.body;

  // Validate required fields
  if (!first_name || !last_name || !gender || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = `
    UPDATE customer
    SET first_name = ?, last_name = ?, gender = ?, phone = ?
    WHERE customer_id = ?
  `;

  db.query(
    sql,
    [first_name, last_name, gender, phone, customerId],
    (err, result) => {
      if (err) {
        console.error("UPDATE customer error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // Fetch the updated customer data
      const selectSql = `SELECT customer_id, first_name, last_name, gender, email, dob, phone FROM customer WHERE customer_id = ?`;
      db.query(selectSql, [customerId], (selectErr, selectResult) => {
        if (selectErr) {
          console.error("SELECT customer error:", selectErr);
          return res.status(500).json({ error: "Database error" });
        }

        if (selectResult.length === 0) {
          return res.status(404).json({ error: "Customer not found" });
        }
        const customer = selectResult[0];
        return res.json({
          message: "Customer information updated successfully",
          customer,
        });
      });
    }
  );
});

// CHANGE PASSWORD ROUTE
router.post("/change-password", requireCustomerAuth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const customerId = req.customer_id;

    // Validation
    if (!current_password || !new_password) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters long" });
    }

    // Get customer's current password hash
    const sql = "SELECT password, email FROM customer WHERE customer_id = ?";

    db.query(sql, [customerId], async (err, rows) => {
      if (err) {
        console.error("Change password query error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (rows.length === 0) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const customer = rows[0];

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(current_password, customer.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Check if new password is same as current
      const isSamePassword = await bcrypt.compare(new_password, customer.password);
      if (isSamePassword) {
        return res.status(400).json({ error: "New password must be different from current password" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(new_password, 10);

      // Update password in database
      const updateSql = "UPDATE customer SET password = ? WHERE customer_id = ?";

      db.query(updateSql, [hashedNewPassword, customerId], (updateErr, result) => {
        if (updateErr) {
          console.error("Password update error:", updateErr);
          return res.status(500).json({ error: "Failed to update password" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Customer not found" });
        }

        return res.json({ message: "Password changed successfully" });
      });
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
