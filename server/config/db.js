import "dotenv/config";
import mysql from 'mysql';


console.log('🔍 Database Configuration:');
console.log('  Host:', process.env.DB_HOST);
console.log('  Port:', process.env.DB_PORT);
console.log('  User:', process.env.DB_USER);
console.log('  Password:', process.env.DB_PASSWORD ? '***SET***' : ' NOT SET');
console.log('  Database:', process.env.DB_NAME);


//connect to local database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
}); 
db.connect((err) => {
  if (err) return console.error(err.message);
  console.log('Connected to the MySQL server.');
});

export default db;