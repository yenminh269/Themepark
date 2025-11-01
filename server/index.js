import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from './config/db.js';
import { fileURLToPath } from 'url';
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express();
const PORT = process.env.PORT || 3001;

//Middlewares
// CORS configuration - allow multiple origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://thethemepark.vercel.app',
    process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));// serve uploaded images

// ===== Multer Configuration FOR PHOTO UPLOAD =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/ride_photos'); // folder to save files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + path.extname(file.originalname)); // e.g. 16981983019.jpg
  }
});
const upload = multer({ storage });

function makeToken(customerRow) {
  return jwt.sign(
    {
      customer_id: customerRow.customer_id,
      email: customerRow.email,
    },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "7d" }
  );
}

//CUSTOMER ROUTES ADDED BY DAVID

//SIGNUP ROUTE
app.post("/api/customer/signup", async (req, res) => {
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
              // Return the DB error message in development to aid debugging
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

//LOGIN ROUTE

app.post("/api/customer/login", (req, res) => {
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
      // no such email
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

//REFRESH ROUTE
//HELPER FUNCTION
function requireCustomerAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.customer_id = decoded.customer_id;
  next();
}

app.get("/api/customer/me", requireCustomerAuth, (req, res) => {
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

//UPDATE CUSTOMER INFO
app.put("/api/customer/:id", requireCustomerAuth, (req, res) => {
  const customerId = req.params.id;

  // Ensure customer can only update their own information
  if (parseInt(customerId) !== req.customer_id) {
    return res.status(403).json({ error: "Unauthorized to update this customer" });
  }

  const { first_name, last_name, gender,phone } = req.body;

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
//ROUTES BY MINCY
// Add a new ride (supports both uploaded photo OR URL)
app.post('/ride/add', upload.single('photo'), (req, res) => {
    const { name, price, capacity, description, open_time, close_time, photo_url } = req.body;
    // Decide which photo path to use
    let photo_path = null;
    if (photo_url && photo_url.startsWith('http')) {
        // user pasted a link
        photo_path = photo_url;
    } else if (req.file) {
        // user uploaded a file
        photo_path = `/uploads/ride_photos/${req.file.filename}`;
    }

    // Status is not required - database trigger sets it to 'open' automatically
    if (!name || !price || !capacity || !description || !open_time || !close_time || !photo_path) {
        return res.status(400).json({ message: 'All fields are required, including either photo or photo URL.' });
    }
    const sql = `
        INSERT INTO ride (name, price, capacity, description, open_time, close_time, photo_path)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    db.query(sql, [name, price, capacity, description, open_time, close_time, photo_path],
        (err, result) => {
            if (err) {
                console.error("Error inserting new ride:", err);
                return res.status(500).json({
                message: 'Error adding new ride',
                error: err.message
                });
            }
            res.status(201).json({
                message: 'Ride added successfully',
                rideId: result.insertId,
                photo_path
            });
        });
});

//Get all the rides
app.get('/rides', async (req, res) => {
    db.query(`SELECT * FROM ride;`, (err, results) =>{
        if(err){
            return res.status(500).json({
            message: 'Error fetching rides',
            error: err.message
            })
        }
        //results is an array of objects(each obj is each row in the db)
        res.status(201).json({data: results });
    });
})

// Get all employees - EXCLUDE password
app.get('/employees', async (req, res) => {
  const sql = `SELECT employee_id, first_name, last_name, gender, email,
               job_title, phone, ssn, hire_date, terminate_date
               FROM employee`;
  db.query(sql, (err, results) => {
    if(err){
      return res.status(500).json({
        message: 'Error fetching employees',
        error: err.message
      });
    }
    res.json({data: results});
  });
});
//Get maintenance employee
app.get('/employees/maintenance', async (req, res) => {
  const sql = `SELECT employee_id, first_name, last_name, gender, email, 
               job_title, phone, hire_date
               FROM employee 
WHERE deleted_at IS NULL AND terminate_date IS NULL 
AND job_title ='Mechanical Employee'`;
  db.query(sql, (err, results) => {
    if(err){
      return res.status(500).json({
        message: 'Error fetching employees',
        error: err.message
      });
    }
    res.json({data: results});
  });
});

// Schedule ride maintenance 
app.post('/ride-maintenance', async (req, res) => {
  const { ride_id, employee_id, description, date, hour } = req.body;
  // Validate required fields
  if (!ride_id || !employee_id || !description || !date || !hour) {
    return res.status(400).json({
      message: 'Missing required fields',
      required: ['ride_id', 'employee_id', 'description', 'date']
    });
  }

  try {
    // Check if ride exists
    const checksql = `SELECT EXISTS (
      SELECT 1
      FROM ride
      WHERE ride_id = ?
    ) as ride_exists`;
    
    const rideCheck = await new Promise((resolve, reject) => {
      db.query(checksql, [ride_id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!rideCheck[0].ride_exists) {
      return res.status(404).json({
        message: 'Ride does not exist',
        ride_id: ride_id
      });
    }

    // Check if employee exists
    const empChecksql = `SELECT EXISTS (
      SELECT 1
      FROM employee
      WHERE employee_id = ?
    ) as emp_exists`;
    
    const empCheck = await new Promise((resolve, reject) => {
      db.query(empChecksql, [employee_id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!empCheck[0].emp_exists) {
      return res.status(404).json({
        message: 'Employee does not exist',
        employee_id: employee_id
      });
    }
    // Insert into maintenance table
    const maintenanceSql = `INSERT INTO maintenance(ride_id, description, scheduled_date)
      VALUES(?, ?, ?)`;
    
    const maintenanceResult = await new Promise((resolve, reject) => {
      db.query(maintenanceSql, [ride_id, description, date], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    const maintenance_id = maintenanceResult.insertId;
    // Insert into employee_maintenance_job table
    const scheduleSql = `INSERT INTO employee_maintenance_job(employee_id, maintenance_id, work_date, worked_hour)
      VALUES(?, ?, ?, ?)`;
    
    await new Promise((resolve, reject) => {
      db.query(scheduleSql, [employee_id, maintenance_id, date, hour], (scheduleErr, results) => {
        if (scheduleErr) reject(scheduleErr);
        else resolve(results);
      });
    });
    res.status(201).json({
      message: 'Maintenance scheduled successfully',
      data: {
        maintenance_id: maintenance_id,
        ride_id: ride_id,
        employee_id: employee_id,
        scheduled_date: date
      }
    });
  } catch (err) {
    console.error('Error scheduling maintenance:', err);
    return res.status(500).json({
      message: 'Error scheduling maintenance',
      error: err.message
    });
  }
});

// Get all maintenance schedules with details
app.get('/maintenances', async (req, res) => {
const sql = `
SELECT
m.maintenance_id,
m.ride_id,
r.name as ride_name,
m.description,
DATE(m.scheduled_date) as scheduled_date,
m.status,
m.created_at,
m.updated_at,
COALESCE(GROUP_CONCAT(DISTINCT CONCAT(e.first_name, ' ', e.last_name) SEPARATOR ', '), 'No employees assigned') as assigned_employees
FROM maintenance m
LEFT JOIN employee_maintenance_job emj ON m.maintenance_id = emj.maintenance_id
LEFT JOIN employee e ON emj.employee_id = e.employee_id
LEFT JOIN ride r ON m.ride_id = r.ride_id
GROUP BY m.maintenance_id
ORDER BY m.scheduled_date DESC
  `;
  
  try {
    const results = await new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json({
      message: 'Maintenance schedules retrieved successfully',
      data: results,
      count: results.length
    });
  } catch (err) {
    console.error('Error fetching maintenance schedules:', err);
    return res.status(500).json({
      message: 'Error fetching maintenance schedules',
      error: err.message
    });
  }
});

//Update an employee
app.put('/employees/:id', async (req, res) => {
  const {
    first_name, last_name, job_title, gender,
    email, phone, ssn, hire_date, terminate_date} = req.body;
  const id = req.params.id;

  // Convert dates to YYYY-MM-DD
  const hireDate = hire_date ? hire_date.slice(0, 10) : null;
  const terminateDate = terminate_date ? terminate_date.slice(0, 10) : null;

  const sql = `
    UPDATE employee
    SET 
      first_name = ?,
      last_name = ?,
      job_title = ?,
      gender = ?,
      email = ?,
      phone = ?,
      ssn = ?,
      hire_date = ?,
      terminate_date = ?
    WHERE employee_id = ?;
  `;
  db.query(sql, [
    first_name, last_name, job_title, gender,
    email, phone, ssn, hireDate, terminateDate, id
  ], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({
        message: 'Error updating employee',
        error: err.message
      });
    }
    res.json({ message: "Employee updated successfully", data: result });
  });
});

//Add new employee
app.post(`/employees/add`, async(req, res) => {
  const {first_name, last_name, job_title, gender, phone, ssn, hire_date} = req.body;
  const sql = `INSERT INTO employee(first_name, last_name, job_title, gender, phone, ssn, hire_date )
              VALUES (?,?,?,?,?,?,?)`;
  db.query(sql, [first_name, last_name, job_title, gender, phone, ssn, hire_date], (err, result) => {
    if(err){
      return res.status(500).json({
            message: 'Error fetching employees',
            error: err.message
      })
      }
      res.status(201).json({
          message: 'Employee added successfully',
          employeeId: result.insertId
      });
  })           
})

//Delete an employee
app.delete('/employees/:id', async (req, res) => {
  const id = req.params.id;
  const sql = ` UPDATE employee
  SET deleted_at = NOW(), terminate_date = NOW()
  WHERE employee_id = ?;
`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'Error terminating employee',
        error: err.message
      });
    }
    res.json({ message: "Employee terminated successfully", data: result});
  });
});

//Add a new store
app.post('/store/add', upload.single('photo'), (req, res) => {
    const { name, type, description, status, open_time, close_time, photo_url } = req.body;

    // Decide which photo path to use
    let photo_path = null;

    if (photo_url && photo_url.startsWith('http')) {
        // user pasted a link
        photo_path = photo_url;
    } else if (req.file) {
        // user uploaded a file
        photo_path = `/uploads/store_photos/${req.file.filename}`;
    }

    if (!name || !type || !description || !status || !open_time || !close_time || !photo_path) {
        return res.status(400).json({ message: 'All fields are required, including either photo or photo URL.' });
    }

    const sql = `
        INSERT INTO store (name, type, status, description, open_time, close_time, photo_path)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    db.query(sql, [name, type, status, description, open_time, close_time, photo_path],
        (err, result) => {
            if (err) {
                console.error("Error inserting new store:", err);
                return res.status(500).json({
                message: 'Error adding new store',
                error: err.message
                });
            }

            console.log("New store added:", { id: result.insertId, photo_path });
            res.status(201).json({
                message: 'Store added successfully',
                storeId: result.insertId,
                photo_path
            });
        });
});

//Get all the stores
app.get('/stores', async (req, res) => {
    db.query(`SELECT * FROM store;`, (err, results) =>{
        if(err){
            return res.status(500).json({
            message: 'Error fetching stores',
            error: err.message
            })
        }
        res.json({data: results });
    });
})

//Update a store
app.put('/store/:id', async (req, res) => {
  const {name, type, status, description, open_time, close_time} = req.body;
  const openTime = open_time.length === 5 ? open_time + ':00' : open_time;
  const closeTime = close_time.length === 5 ? close_time + ':00' : close_time;
  console.log(req.body);
  const id = req.params.id;
  const sql = `
    UPDATE store
    SET 
      name = ?,
      type = ?,
      status = ?,
      description = ?,
      open_time = ?,
      close_time = ?
    WHERE store_id = ?;
  `;
  db.query(sql, [name, type, status, description, openTime, closeTime, id],
     (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'Error updating store',
        error: err.message
      });
    }
    res.json({ message: "Store updated successfully", data: result });
  });
});

//Update a store
app.delete('/store/:id', async (req, res) => {
  const id = req.params.id;
  const sql = ` UPDATE store
  SET deleted_at = NOW()
  WHERE store_id = ?;
`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'Error deleting store',
        error: err.message
      });
    }
    res.json({ message: "Store marked as deleted successfully", data: result});
  });
});

// Employee Login
app.post('/employee/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required'
    });
  }

  try {
    // Find employee by email (only allow active employees - exclude deleted ones)
    const sql = `SELECT employee_id, email, password, first_name, last_name, job_title
                 FROM employee
                 WHERE email = ? AND deleted_at IS NULL AND terminate_date IS NULL`;
    const employees = await new Promise((resolve, reject) => {
      db.query(sql, [email], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (employees.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }
    const employee = employees[0];
    // Check password - support both plain text and hashed passwords
    let isPasswordValid = false;
    // Try plain text comparison first
    if (password === employee.password) {
      isPasswordValid = true;
    } else {
      // Try bcrypt comparison for hashed passwords
      try {
        isPasswordValid = await bcrypt.compare(password, employee.password);
      } catch {
        // If bcrypt fails, password doesn't match
        isPasswordValid = false;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Return employee info (excluding password)
    res.json({
      message: 'Login successful',
      data: {
        employee_id: employee.employee_id,
        email: employee.email,
        first_name: employee.first_name,
        last_name: employee.last_name,
        job_title: employee.job_title,
        is_employee: true
      }
    });

  } catch (err) {
    console.error('Error during employee login:', err);
    return res.status(500).json({
      message: 'Error during login',
      error: err.message
    });
  }
});

// ==================== MERCHANDISE MANAGEMENT ====================
// Get all merchandise
app.get('/api/merchandise', (req, res) => {
  const sql = 'SELECT * FROM merchandise ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching merchandise:', err);
      return res.status(500).json({ error: 'Failed to fetch merchandise' });
    }
    res.json({ data: results });
  });
});

// Add new merchandise
app.post('/api/merchandise', (req, res) => {
  const { name, price, quantity, description, type } = req.body;

  if (!name || !price || !quantity || !description || !type) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = `
    INSERT INTO merchandise (name, price, quantity, description, type)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, price, quantity, description, type], (err, result) => {
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

// Update merchandise
app.put('/api/merchandise/:id', (req, res) => {
  const { name, price, quantity, description, type } = req.body;
  const itemId = req.params.id;

  const sql = `
    UPDATE merchandise
    SET name = ?, price = ?, quantity = ?, description = ?, type = ?
    WHERE item_id = ?
  `;

  db.query(sql, [name, price, quantity, description, type, itemId], (err, result) => {
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

// Delete merchandise (hard delete since no deleted_at column)
app.delete('/api/merchandise/:id', (req, res) => {
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

// ==================== STORE INVENTORY MANAGEMENT ====================
// Get inventory for all stores
app.get('/api/store-inventory', (req, res) => {
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

// Get inventory for a specific store
app.get('/api/store-inventory/:storeId', (req, res) => {
  const storeId = req.params.storeId;
  const sql = `
    SELECT si.store_id, si.item_id, si.stock_quantity, si.created_at, si.updated_at,
           m.name as item_name, m.price, m.description, m.type as item_type, m.quantity as total_quantity, m.image_url
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

// Update stock quantity for a store-item combination
app.put('/api/store-inventory/:storeId/:itemId', (req, res) => {
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

// Add item to store inventory
app.post('/api/store-inventory', (req, res) => {
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

// ==================== STORE ORDERS ====================
// Create a new store order (customer purchasing merchandise)
app.post('/api/store-orders', requireCustomerAuth, async (req, res) => {
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

// Get customer's store orders
app.get('/api/store-orders', requireCustomerAuth, async (req, res) => {
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

// ==================== EMPLOYEE SCHEDULING ====================
// Get employee schedules
app.get('/api/employee-schedules', (req, res) => {
  const { employee_id, work_date } = req.query;
  let sql = `
    SELECT es.schedule_id, es.employee_id, es.store_id, es.work_date,
           es.shift_start, es.shift_end, es.status, es.created_at, es.updated_at,
           e.first_name, e.last_name, e.job_title,
           s.name as store_name, s.type as store_type
    FROM employee_schedule es
    JOIN employee e ON es.employee_id = e.employee_id
    JOIN store s ON es.store_id = s.store_id
    WHERE e.deleted_at IS NULL AND s.deleted_at IS NULL
  `;
  const params = [];

  if (employee_id) {
    sql += ' AND es.employee_id = ?';
    params.push(employee_id);
  }

  if (work_date) {
    sql += ' AND es.work_date = ?';
    params.push(work_date);
  }

  sql += ' ORDER BY es.work_date DESC, es.shift_start ASC';

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching employee schedules:', err);
      return res.status(500).json({ error: 'Failed to fetch schedules' });
    }
    res.json({ data: results });
  });
});

// Create employee schedule
app.post('/api/employee-schedules', (req, res) => {
  const { employee_id, store_id, work_date, shift_start, shift_end, status = 'scheduled' } = req.body;

  if (!employee_id || !store_id || !work_date || !shift_start || !shift_end) {
    return res.status(400).json({ error: 'All schedule fields are required' });
  }

  const sql = `
    INSERT INTO employee_schedule (employee_id, store_id, work_date, shift_start, shift_end, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [employee_id, store_id, work_date, shift_start, shift_end, status], (err, result) => {
    if (err) {
      console.error('Error creating schedule:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Schedule already exists for this employee on this date and time' });
      }
      return res.status(500).json({ error: 'Failed to create schedule', message: err.message });
    }
    res.json({
      message: 'Schedule created successfully',
      schedule_id: result.insertId
    });
  });
});

// Update employee schedule
app.put('/api/employee-schedules/:id', (req, res) => {
  const scheduleId = req.params.id;
  const { employee_id, store_id, work_date, shift_start, shift_end, status } = req.body;

  const sql = `
    UPDATE employee_schedule
    SET employee_id = ?, store_id = ?, work_date = ?, shift_start = ?, shift_end = ?, status = ?
    WHERE schedule_id = ?
  `;

  db.query(sql, [employee_id, store_id, work_date, shift_start, shift_end, status, scheduleId], (err, result) => {
    if (err) {
      console.error('Error updating schedule:', err);
      return res.status(500).json({ error: 'Failed to update schedule' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json({ message: 'Schedule updated successfully' });
  });
});

// Delete employee schedule
app.delete('/api/employee-schedules/:id', (req, res) => {
  const scheduleId = req.params.id;
  const sql = 'DELETE FROM employee_schedule WHERE schedule_id = ?';

  db.query(sql, [scheduleId], (err, result) => {
    if (err) {
      console.error('Error deleting schedule:', err);
      return res.status(500).json({ error: 'Failed to delete schedule' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  });
});

// ==================== RAIN OUT MANAGEMENT ====================
// Get rain out records
app.get('/api/rain-outs', (req, res) => {
  const sql = 'SELECT * FROM rain_out ORDER BY rain_out_date DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching rain outs:', err);
      return res.status(500).json({ error: 'Failed to fetch rain outs' });
    }
    res.json({ data: results });
  });
});

// Create rain out record
app.post('/api/rain-outs', (req, res) => {
  const { rain_out_date, note } = req.body;

  if (!rain_out_date) {
    return res.status(400).json({ error: 'Rain out date is required' });
  }

  const sql = `
    INSERT INTO rain_out (rain_out_date, note, status)
    VALUES (?, ?, 'active')
  `;

  db.query(sql, [rain_out_date, note], (err, result) => {
    if (err) {
      console.error('Error creating rain out:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Rain out already exists for this date' });
      }
      return res.status(500).json({ error: 'Failed to create rain out', message: err.message });
    }
    res.json({
      message: 'Rain out recorded successfully',
      rain_out_id: result.insertId
    });
  });
});

// Update rain out status
app.put('/api/rain-outs/:id', (req, res) => {
  const rainOutId = req.params.id;
  const { status, note } = req.body;

  let sql, params;
  if (note !== undefined) {
    sql = 'UPDATE rain_out SET status = ?, note = ? WHERE rain_out_id = ?';
    params = [status, note, rainOutId];
  } else {
    sql = 'UPDATE rain_out SET status = ? WHERE rain_out_id = ?';
    params = [status, rainOutId];
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error updating rain out:', err);
      return res.status(500).json({ error: 'Failed to update rain out' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Rain out not found' });
    }
    res.json({ message: 'Rain out updated successfully' });
  });
});


//add by yosan
// Add this route to your server/index.js
app.post("/api/employee/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    console.log('Employee login attempt:', email); // Debug log

    db.query(
      "SELECT * FROM employee WHERE email = ? AND deleted_at IS NULL",
      [email],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
          console.log('Employee not found:', email);
          return res.status(401).json({ error: "Invalid email or password" });
        }

        const employee = results[0];
        console.log('Found employee:', employee.first_name, employee.job_title);

        // Simple password check (not bcrypt)
        if (password !== employee.password) {
          console.log('Password mismatch');
          return res.status(401).json({ error: "Invalid email or password" });
        }

        // Only allow managers
        const managerTitles = ['Store Manager', 'General Manager'];
        if (!managerTitles.includes(employee.job_title)) {
          console.log('Not a manager:', employee.job_title);
          return res.status(403).json({ error: "Manager access only" });
        }

        console.log('Login successful for:', employee.email);

        res.json({
          success: true,
          employee: {
            employee_id: employee.employee_id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            job_title: employee.job_title
          }
        });
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});
app.get('/api/manager/info', (req, res) => {
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

// Get dashboard stats
app.get('/api/manager/dashboard-stats/:department', (req, res) => {
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

// Get revenue trend for the past 6 months
app.get('/api/manager/revenue-trend/:department', (req, res) => {
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

// Get top selling items
app.get('/api/manager/top-items/:department', (req, res) => {
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
      SUM(sod.quantity * sod.unit_price) as total_revenue
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

// Get employees by department
app.get('/api/manager/employees/:department', (req, res) => {
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
      COUNT(DISTINCT esj.work_date) as total_shifts,
      COALESCE(SUM(esj.worked_hour), 0) as total_hours
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

// Get stores by department
app.get('/api/manager/stores/:department', (req, res) => {
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

// Assign employee to store
app.post('/api/manager/assign-employee', (req, res) => {
  const { employee_id, store_id, work_date, worked_hour, shift_start, shift_end } = req.body;
  
  if (!employee_id || !store_id || !work_date || !worked_hour) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO employee_store_job 
      (employee_id, store_id, work_date, worked_hour, shift_start, shift_end)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      worked_hour = VALUES(worked_hour),
      shift_start = VALUES(shift_start),
      shift_end = VALUES(shift_end)
  `;

  db.query(sql, [employee_id, store_id, work_date, worked_hour, shift_start, shift_end], 
    (err, result) => {
      if (err) {
        console.error('Error assigning employee:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Employee assigned successfully' });
    }
  );
});

// Remove employee assignment
app.delete('/api/manager/remove-assignment/:employeeId/:storeId/:workDate', (req, res) => {
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


// Get inventory for manager's department
app.get('/api/manager/inventory/:department', (req, res) => {
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

// Update inventory stock
app.put('/api/manager/inventory/:storeId/:itemId', (req, res) => {
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

// Add new merchandise item
app.post('/api/manager/merchandise', (req, res) => {
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


// Get schedules for department
app.get('/api/manager/schedules/:department', (req, res) => {
  const { department } = req.params;
  const { start_date, end_date } = req.query;
  
  const jobTitle = 'Sales Employee'; // Only Sales Employee
  const storeType = department === 'giftshop' ? 'merchandise' : 'food/drink';
  
  const sql = `
    SELECT 
      esj.employee_id,
      esj.store_id,
      esj.work_date,
      esj.worked_hour,
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

// Get weekly schedule summary
app.get('/api/manager/weekly-schedule/:department', (req, res) => {
  const { department } = req.params;
  const jobTitle = department === 'giftshop' ? 'Sales Employee' : 'Concession Employee';
  const storeType = department === 'giftshop' ? 'merchandise' : 'food/drink';
  
  const sql = `
    SELECT 
      esj.work_date,
      COUNT(DISTINCT esj.employee_id) as employees_scheduled,
      SUM(esj.worked_hour) as total_hours,
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

//REPORTS

// Get sales report
app.get('/api/manager/sales-report/:department', (req, res) => {
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

// Get employee performance
app.get('/api/manager/employee-performance/:department', (req, res) => {
  const { department } = req.params;
  const jobTitle = department === 'giftshop' ? 'Sales Employee' : 'Concession Employee';
  
  const sql = `
    SELECT 
      e.employee_id,
      e.first_name,
      e.last_name,
      COUNT(DISTINCT esj.work_date) as days_worked,
      SUM(esj.worked_hour) as total_hours,
      COUNT(DISTINCT esj.store_id) as stores_worked,
      ROUND(AVG(esj.worked_hour), 1) as avg_hours_per_shift
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






//MINCY
// Get manager dashboard data by department
app.get('/api/manager/dashboard/:department', (req, res) => {
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

// ==================== RIDE ORDERS ====================
// Create a new ride order (checkout)
app.post('/api/ride-orders', requireCustomerAuth, async (req, res) => {
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

// Get customer's ride orders
app.get('/api/ride-orders', requireCustomerAuth, async (req, res) => {
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

//==================== ADMIN DASHBOARD STATS ====================
// Get average ride tickets sold per month
app.get('/rides/avg-month', async (req, res) => {
  try {
    const sql = `
      SELECT AVG(monthly_tickets) as avg_tickets_per_month
      FROM (
        SELECT
          DATE_FORMAT(ro.order_date, '%Y-%m') as month,
          SUM(rod.number_of_tickets) as monthly_tickets
        FROM ride_order ro
        JOIN ride_order_detail rod ON ro.order_id = rod.order_id
        WHERE ro.status = 'completed'
        GROUP BY DATE_FORMAT(ro.order_date, '%Y-%m')
      ) as monthly_data
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching average ride tickets per month:', err);
        return res.status(500).json({
          message: 'Error fetching average ride tickets per month',
          error: err.message
        });
      }
      const avgTickets = results[0]?.avg_tickets_per_month || 0;
      res.json({ data: Math.round(avgTickets) });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch average tickets' });
  }
});

// Get total revenue (rides + stores)
app.get('/admin/total-revenue', async (req, res) => {
  try {
    const sql = `
      SELECT
        (SELECT COALESCE(SUM(total_amount), 0) FROM ride_order WHERE status = 'completed') as ride_revenue,
        (SELECT COALESCE(SUM(total_amount), 0) FROM store_order WHERE status = 'completed') as store_revenue
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching total revenue:', err);
        return res.status(500).json({
          message: 'Error fetching total revenue',
          error: err.message
        });
      }
      const rideRevenue = parseFloat(results[0]?.ride_revenue || 0);
      const storeRevenue = parseFloat(results[0]?.store_revenue || 0);
      const totalRevenue = rideRevenue + storeRevenue;

      res.json({
        data: {
          total: totalRevenue.toFixed(2),
          ride_revenue: rideRevenue.toFixed(2),
          store_revenue: storeRevenue.toFixed(2)
        }
      });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch total revenue' });
  }
});

// Get store sales total
app.get('/admin/store-sales', async (req, res) => {
  try {
    const sql = `
      SELECT COALESCE(SUM(total_amount), 0) as total_sales
      FROM store_order
      WHERE status = 'completed'
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching store sales:', err);
        return res.status(500).json({
          message: 'Error fetching store sales',
          error: err.message
        });
      }
      const totalSales = parseFloat(results[0]?.total_sales || 0);
      res.json({ data: totalSales.toFixed(2) });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch store sales' });
  }
});

// Get ride ticket sales total
app.get('/admin/ride-ticket-sales', async (req, res) => {
  try {
    const sql = `
      SELECT COALESCE(SUM(total_amount), 0) as total_sales
      FROM ride_order
      WHERE status = 'completed'
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching ride ticket sales:', err);
        return res.status(500).json({
          message: 'Error fetching ride ticket sales',
          error: err.message
        });
      }
      const totalSales = parseFloat(results[0]?.total_sales || 0);
      res.json({ data: totalSales.toFixed(2) });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch ride ticket sales' });
  }
});

// Get average rides in broken/maintenance status per month
app.get('/admin/avg-rides-broken-maintenance', async (req, res) => {
  try {
    const sql = `
    SELECT AVG(monthly_count) as avg_broken_per_month
    FROM (
    SELECT
    DATE_FORMAT(m.scheduled_date, '%Y-%m') as month,
    COUNT(DISTINCT m.ride_id) as monthly_count
    FROM maintenance m
    GROUP BY DATE_FORMAT(m.scheduled_date, '%Y-%m')
    ) as monthly_data
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching average broken/maintenance rides:', err);
        return res.status(500).json({
          message: 'Error fetching average broken/maintenance rides',
          error: err.message
        });
      }
      const avgBroken = results[0]?.avg_broken_per_month || 0;
      res.json({ data: Math.round(avgBroken) });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch average broken/maintenance rides' });
  }
});

// Get recent ride orders with pagination
app.get('/admin/recent-ride-orders', async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 5;

    const sql = `
      SELECT order_id, order_date, total_amount, status
      FROM ride_order
      ORDER BY order_date DESC
      LIMIT ? OFFSET ?
    `;

    db.query(sql, [limit, offset], (err, results) => {
      if (err) {
        console.error('Error fetching recent ride orders:', err);
        return res.status(500).json({
          message: 'Error fetching recent ride orders',
          error: err.message
        });
      }
      res.json({ data: results });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch recent ride orders' });
  }
});

// Get ride order details
app.get('/admin/ride-order-details/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const sql = `
      SELECT rod.order_id, rod.ride_id, rod.price_per_ticket, rod.number_of_tickets, r.name as ride_name
      FROM ride_order_detail rod
      LEFT JOIN ride r ON rod.ride_id = r.ride_id
      WHERE rod.order_id = ?
    `;
    db.query(sql, [orderId], (err, results) => {
      if (err) {
        console.error('Error fetching ride order details:', err);
        return res.status(500).json({
          message: 'Error fetching ride order details',
          error: err.message
        });
      }
      res.json({ data: results });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch ride order details' });
  }
});
// Average monthly customers report
app.get('/api/reports/avg-monthly-customers', async (req, res) => {
  try {
    const year = parseInt(req.query.year);

    // Validate year input
    if (!year) {
      return res.status(400).json({
        error: 'Year is required'
      });
    }

    const sql = `
      SELECT year, month, total_customer,
        ROUND(
          AVG(total_customer) OVER (
            ORDER BY month
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
          ), 2
        ) AS running_avg_customer
      FROM (
        SELECT YEAR(order_date) AS year, MONTH(order_date) AS month,
               COUNT(DISTINCT customer_id) AS total_customer
        FROM (
          SELECT customer_id, order_date FROM store_order
          UNION ALL
          SELECT customer_id, order_date FROM ride_order
        ) AS combined_orders
        WHERE YEAR(order_date) = ?
        GROUP BY year, month
      ) AS monthly_totals
      ORDER BY month
    `;

    db.query(sql, [year], (err, results) => {
      if (err) {
        console.error('Error fetching average monthly customers:', err);
        return res.status(500).json({
          message: 'Error fetching average monthly customers',
          error: err.message
        });
      }

      res.json(results);
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch average monthly customers' });
  }
});

// Most ridden rides per month
app.get('/api/reports/most-ridden', async (req, res) => {
  try {
    const year = parseInt(req.query.year);

    // Validate year input
    if (!year) {
      return res.status(400).json({
        error: 'Year is required'
      });
    }

    const sql = `
      SELECT month, name, total_tickets
      FROM (
        SELECT
          MONTH(ro.order_date) as month,
          ride.name as name,
          SUM(rod.number_of_tickets) as total_tickets,
          ROW_NUMBER() OVER(
            PARTITION BY MONTH(ro.order_date)
            ORDER BY SUM(rod.number_of_tickets) DESC
          ) as rank_in_month
        FROM ride_order as ro
        LEFT JOIN ride_order_detail as rod ON rod.order_id = ro.order_id
        LEFT JOIN ride ON ride.ride_id = rod.ride_id
        WHERE YEAR(ro.order_date) = ?
        GROUP BY MONTH(ro.order_date), ride.name
      ) ranked
      WHERE rank_in_month = 1
      ORDER BY month
    `;

    db.query(sql, [year], (err, results) => {
      if (err) {
        console.error('Error fetching most ridden rides:', err);
        return res.status(500).json({
          message: 'Error fetching most ridden rides',
          error: err.message
        });
      }

      res.json(results);
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch most ridden rides' });
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})