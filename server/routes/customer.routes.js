import express from 'express';
import bcrypt from 'bcrypt';
import db from '../config/db.js';
import { makeToken, requireCustomerAuth } from '../middleware/auth.js';
import GoogleStrategy from 'passport-google-oauth2';
import session from 'express-session';
import passport from 'passport';
import env from "dotenv";
env.config();

const router = express.Router();
// Session middleware setup
router.use(session({
    secret: process.env.SESSION_SECRET, 
    //as an ecryption key to encrypt our db
    resave: false,
    saveUninitialized: true,
    cookie:{
    maxAge: 1000 * 60 * 60 * 24, //one-day length cookie
    }
  })
);

router.use(passport.initialize());
router.use(passport.session());

// Passport serialization for session management
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth Strategy - must be defined before routes
passport.use("google", new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
}, async (accessToken, refreshToken, profile, cb) => {
  try {
    // Extract user info from Google profile
     const email = profile.email ? profile.email : null;
    const firstName = profile.name && profile.name.givenName ? profile.name.givenName : profile.displayName;
    const lastName = profile.name && profile.name.familyName ? profile.name.familyName : '';
    console.log(email, firstName, lastName);
     
    if (!email) {
      return cb(new Error("No email found in Google profile"));
    }
    // Check if customer already exists
    db.query(
      "SELECT customer_id, first_name, last_name, gender, email, dob, phone FROM customer WHERE email = ?",
      [email],
      async (err, rows) => {
        if (err) {
          console.error("Google OAuth DB error:", err);
          return cb(err);
        }
        if (rows.length > 0) {
          // Existing user - return their data
          const existingCustomer = rows[0];
          return cb(null, existingCustomer);
        } else {
          // New user - create account
          // For Google OAuth users, we'll set default values for required fields
          const defaultPassword = await bcrypt.hash("google" + Date.now(), 2);
          const defaultDob = "1000-01-01"; // Default DOB - placeholder date
          const defaultPhone = "0"; // Default phone
          const defaultGender = "Others"; // Default gender

          const insertSql = `
            INSERT INTO customer
            (first_name, last_name, gender, email, password, dob, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          db.query(
            insertSql,
            [firstName, lastName, defaultGender, email, defaultPassword, defaultDob, defaultPhone],
            (insertErr, result) => {
              if (insertErr) {
                console.error("Google OAuth insert error:", insertErr);
                return cb(insertErr);
              }

              const newCustomer = {
                customer_id: result.insertId,
                first_name: firstName,
                last_name: lastName,
                gender: defaultGender,
                email: email,
                dob: defaultDob,
                phone: defaultPhone,
              };
              return cb(null, newCustomer);
            }
          );
        }
      }
    );
  } catch (error) {
    console.error("Google OAuth error:", error);
    return cb(error);
  }
}));

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

// GOOGLE OAUTH ROUTES
router.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

router.get("/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CORS_ORIGIN}/login?error=google_auth_failed`,
    session: false
  }),
  (req, res) => {
    try {
      // User is authenticated, create JWT token
      const customer = req.user;
      const token = makeToken({
        customer_id: customer.customer_id,
        email: customer.email
      });
      // Redirect to frontend with token and customer data
      // Frontend will handle storing these in localStorage
      const redirectUrl = `${process.env.CORS_ORIGIN}/login?` +
        `token=${encodeURIComponent(token)}` +
        `&customer=${encodeURIComponent(JSON.stringify(customer))}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect(`${process.env.CORS_ORIGIN}/login?error=auth_failed`);
    }
  }
);

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

// COMPLETE PROFILE (For Google OAuth users with default values)
router.put("/complete-profile/:id", requireCustomerAuth, (req, res) => {
  const customerId = req.params.id;

  // Ensure customer can only update their own information
  if (parseInt(customerId) !== req.customer_id) {
    return res.status(403).json({ error: "Unauthorized to update this customer" });
  }

  const { dob, phone, gender } = req.body;

  // Validate required fields
  if (!dob || !phone || !gender) {
    return res.status(400).json({ error: "Date of birth, phone, and gender are required" });
  }

  // Validate date of birth format and age (18+)
  const dobDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - dobDate.getFullYear();
  const monthDiff = today.getMonth() - dobDate.getMonth();
  const dayDiff = today.getDate() - dobDate.getDate();
  const isAdult = age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));

  if (!isAdult) {
    return res.status(400).json({ error: "You must be at least 18 years old" });
  }

  const sql = `
    UPDATE customer
    SET dob = ?, phone = ?, gender = ?
    WHERE customer_id = ?
  `;

  db.query(
    sql,
    [dob, phone, gender, customerId],
    (err, result) => {
      if (err) {
        console.error("COMPLETE PROFILE update error:", err);
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
          message: "Profile completed successfully",
          customer,
        });
      });
    }
  );
});

// UPDATE CUSTOMER INFO (Regular updates - cannot change DOB)
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
