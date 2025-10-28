import env from "dotenv";
import mysql from 'mysql';
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

export default db;