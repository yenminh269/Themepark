import express from 'express';
import cors from 'cors';
import env from "dotenv";
import mysql from 'mysql'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const app = express();
const PORT = 3001;
env.config();


//connect to local database
 const db = mysql.createConnection({
   host: process.env.DB_HOST,
   port: process.env.DB_PORT,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
    ssl:{rejectUnauthorized: true}
 }); 
 db.connect((err) => {
   if (err) return console.error(err.message);

   console.log('Connected to the MySQL server.');
 });

//Middlewares
app.use(cors());
app.use(express.json());

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


//ROUTES

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
              return res.status(500).json({ error: "Signup failed" });
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
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }

  // decoded: { customer_id, email, iat, exp }
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


//Get all the rides
app.get('rides', async (req, res) => {
    try{
        const response = null;
        res.json({success: true})

    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error fetching rides',
            error: error.message
        })
    }
})

 //Get all the employees under admin
 app.get('/employees', (req, res) => {
    try{
        res.json({success: true})

    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error fetching rides',
            error: error.message
        })
    }
})

//Get all the maintenance schedule
app.get('/maintenances', (req, res) => {
    try{
        res.json({success: true})

    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error fetching rides',
            error: error.message
        })
    }
})

//Get all inventory items
app.get('/inventories', (req, res) => {
    try{
        res.json({success: true})

    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error fetching rides',
            error: error.message
        })
    }
})

//Get maintenance schedule by employee Id
app.get('/maintenances-employee/id', (req, res) => {
    try{
        res.json({success: true})

    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error fetching rides',
            error: error.message
        })
    }
})
//Get ride orders based on customer Id
//Get customer info based on customer Id
//.....


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})