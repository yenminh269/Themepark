// Simple script to help set up the database
// Run this with: node setup-db.js

import mysql from 'mysql';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

console.log('Setting up database...');
console.log('DB Config:', { ...dbConfig, password: '***' });

// Create connection without database
const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    console.log('\nPlease make sure:');
    console.log('1. MySQL is installed and running');
    console.log('2. Update .env file with correct database credentials');
    console.log('3. The database user has permissions to create databases');
    process.exit(1);
  }

  console.log('Connected to MySQL server');

  // Create database if it doesn't exist
  connection.query('CREATE DATABASE IF NOT EXISTS themepark', (err) => {
    if (err) {
      console.error('Error creating database:', err);
      connection.end();
      return;
    }

    console.log('Database "themepark" created or already exists');

    // Switch to themepark database
    connection.changeUser({ database: 'themepark' }, (err) => {
      if (err) {
        console.error('Error switching to themepark database:', err);
        connection.end();
        return;
      }

      // Read and execute SQL file
      const sqlFile = path.join(__dirname, 'src.sql');
      if (fs.existsSync(sqlFile)) {
        const sql = fs.readFileSync(sqlFile, 'utf8');
        console.log('Executing SQL schema...');

        connection.query(sql, (err) => {
          if (err) {
            console.error('Error executing SQL:', err);
          } else {
            console.log('Database schema imported successfully!');

            // Add some sample employee data
            const sampleEmployees = `
              INSERT INTO employee (first_name, last_name, gender, email, password, job_title, phone, ssn, hire_date)
              VALUES
              ('John', 'Doe', 'Male', 'john.doe@themepark.com', 'password123', 'General Manager', '555-0101', '123-45-6789', '2023-01-15'),
              ('Jane', 'Smith', 'Female', 'jane.smith@themepark.com', 'password123', 'Manager', '555-0102', '987-65-4321', '2023-02-20'),
              ('Bob', 'Johnson', 'Male', 'bob.johnson@themepark.com', 'password123', 'Mechanical Employee', '555-0103', '456-78-9012', '2023-03-10'),
              ('Alice', 'Brown', 'Female', 'alice.brown@themepark.com', 'password123', 'Mechanical Employee', '555-0104', '321-54-9876', '2023-04-05'),
              ('Charlie', 'Wilson', 'Male', 'charlie.wilson@themepark.com', 'password123', 'Ticket Seller', '555-0105', '654-32-1987', '2023-05-12')
              ON DUPLICATE KEY UPDATE first_name = VALUES(first_name);
            `;

            connection.query(sampleEmployees, (err) => {
              if (err) {
                console.error('Error adding sample employees:', err);
              } else {
                console.log('Sample employee data added successfully!');
              }
              connection.end();
              console.log('\nSetup complete! You can now run the application.');
            });
          }
        });
      } else {
        console.error('SQL file not found at:', sqlFile);
        connection.end();
      }
    });
  });
});
