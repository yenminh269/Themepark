import express from 'express';
import cors from 'cors';
import env from "dotenv";
import mysql from 'mysql'
import multer from 'multer';
import path from 'path';

const app = express();
const PORT = 3001;
env.config();

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));// serve uploaded images

//connect to local database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true } 
}); 
db.connect((err) => {
  if (err) return console.error(err.message);
  console.log('Connected to the MySQL server.');
});

// ===== Multer Configuration =====
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

//ROUTES
// Add a new ride (supports both uploaded photo OR URL)
app.post('/ride/add', upload.single('photo'), (req, res) => {
    const { name, price, capacity, description, status, open_time, close_time, photo_url } = req.body;
    // Decide which photo path to use
    let photo_path = null;
    if (photo_url && photo_url.startsWith('http')) {
        // user pasted a link
        photo_path = photo_url;
    } else if (req.file) {
        // user uploaded a file
        photo_path = `/uploads/ride_photos/${req.file.filename}`;
    }

    if (!name || !price || !capacity || !description || !status || !open_time || !close_time || !photo_path) {
        return res.status(400).json({ message: 'All fields are required, including either photo or photo URL.' });
    }
    const sql = `
        INSERT INTO ride (name, price, capacity, description, status, open_time, close_time, photo_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;

    db.query(sql, [name, price, capacity, description, status, open_time, close_time, photo_path],
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
               FROM employee 
               WHERE deleted_at IS NULL`;
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
    
    const scheduleResult = await new Promise((resolve, reject) => {
      db.query(scheduleSql, [employee_id, maintenance_id, date, hour], (err, results) => {
        if (err) reject(err);
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
      m.scheduled_date,
      m.status,
      emj.employee_id,
      e.first_name,
      e.last_name,
      emj.work_date,
      emj.worked_hour
    FROM maintenance m
    INNER JOIN employee_maintenance_job emj ON m.maintenance_id = emj.maintenance_id
    INNER JOIN employee e ON emj.employee_id = e.employee_id
    INNER JOIN ride r ON m.ride_id = r.ride_id
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
      data: results
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

//Delete new employee
app.delete('/employees/:id', async (req, res) => {
  const id = req.params.id;
  const sql = ` UPDATE employee
  SET deleted_at = NOW()
  WHERE employee_id = ?;
`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'Error deleting employee',
        error: err.message
      });
    }
    res.json({ message: "Employee marked as deleted successfully", data: result});
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
// //Get all the maintenance schedule
// app.get('/maintenances', (req, res) => {
//     try{
//         res.json({success: true})

//     }catch(error){
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching rides',
//             error: error.message
//         })
//     }
// })

// //Get all inventory items
// app.get('/inventories', (req, res) => {
//     try{
//         res.json({success: true})

//     }catch(error){
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching rides',
//             error: error.message
//         })
//     }
// })

// //Get maintenance schedule by employee Id
// app.get('/maintenances-employee/id', (req, res) => {
//     try{
//         res.json({success: true})

//     }catch(error){
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching rides',
//             error: error.message
//         })
//     }
// })
// //Get ride orders based on customer Id
// //Get customer info based on customer Id
// //.....


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})