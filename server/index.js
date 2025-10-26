import express from 'express';
import cors from 'cors';
import env from "dotenv";
import mysql from 'mysql'

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
  ssl: { rejectUnauthorized: true } 
}); 
db.connect((err) => {
  if (err) return console.error(err.message);

  console.log('Connected to the MySQL server.');
});

//Middlewares
app.use(cors());
app.use(express.json());

// //ROUTES
// //Get all the rides
// app.get('/rides', async (req, res) => {
//     try{
//         const response = null;
//         res.json({success: true})

//     }catch(error){
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching rides',
//             error: error.message
//         })
//     }
// })

 //Get all the employees under admin
 app.get('/employees', async (req, res) => {
    db.query(`SELECT * FROM employee;`, (err, results) => {
        if(err){
            return res.status(500).json({
            message: 'Error fetching employees',
            error: err.message
            })
        }
        console.log(results);
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