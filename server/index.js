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
//Get all the rides
app.get('/rides', async (req, res) => {
    db.query(`SELECT * FROM ride;`, (err, results) =>{
        if(err){
            return res.status(500).json({
            message: 'Error fetching rides',
            error: err.message
            })
        }
        res.json({data: results });
    });
})

//Add a new ride
app.post('/ride/add', upload.single('photo'), (req, res) => {
    const { name, price, capacity, description, status, open_time, close_time } = req.body;
    const photo_path = req.file ? `/uploads/ride_photos/${req.file.filename}` : null;

    if (!name || !price || !capacity || !description || !status || !open_time || !close_time || !photo_path) {
        return res.status(400).json({ message: 'All fields are required,  including photo.' });
    }
    const sql = `
        INSERT INTO ride (name, price, capacity, description, status, open_time, close_time, photo_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;

    db.query(sql, [name, price, capacity, description, status, open_time, close_time, photo_path],
        (err, result) => {
            if(err){
                console.error("Error inserting new ride:", err);
                return res.status(500).json({
                message: 'Error adding new ride',
                error: err.message
                })
            }
            console.log("A new ride has added to the database");
            res.status(201).json({message: 'Ride added successfully', rideId: result.insertId, photo_path });
        })
})

 //Get all the employees under admin
 app.get('/employees', async (req, res) => {
    db.query(`SELECT * FROM employee;`, (err, results) => {
        if(err){
            return res.status(500).json({
            message: 'Error fetching employees',
            error: err.message
            })
        }
        res.json({data: results });
    });
})


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