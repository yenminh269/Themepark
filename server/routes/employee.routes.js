import express from 'express';
import bcrypt from 'bcrypt';
import db from '../config/db.js';

const router = express.Router();

// Get all employees - EXCLUDE password
router.get('/', async (req, res) => {
  const sql = `SELECT employee_id, first_name, last_name, gender, email,
               job_title, phone, ssn, hire_date, terminate_date
               FROM employee`;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Error fetching employees',
        error: err.message
      });
    }
    res.json({ data: results });
  });
});

// Get maintenance employees
router.get('/maintenance', async (req, res) => {
  const sql = `SELECT employee_id, first_name, last_name, gender, email,
               job_title, phone, hire_date
               FROM employee
               WHERE deleted_at IS NULL AND terminate_date IS NULL
               AND job_title ='Mechanical Employee'`;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Error fetching employees',
        error: err.message
      });
    }
    res.json({ data: results });
  });
});

// Add new employee
router.post('/add', async (req, res) => {
  const { first_name, last_name, job_title, gender, phone, ssn, hire_date } = req.body;
  const sql = `INSERT INTO employee(first_name, last_name, job_title, gender, phone, ssn, hire_date )
              VALUES (?,?,?,?,?,?,?)`;
  db.query(sql, [first_name, last_name, job_title, gender, phone, ssn, hire_date], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'Error adding employee',
        error: err.message
      })
    }
    res.status(201).json({
      message: 'Employee added successfully',
      employeeId: result.insertId
    });
  })
});

// Update an employee
router.put('/:id', async (req, res) => {
  const {
    first_name, last_name, job_title, gender,
    email, phone, ssn, hire_date, terminate_date
  } = req.body;
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

// Delete an employee
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE employee
               SET deleted_at = NOW(), terminate_date = NOW()
               WHERE employee_id = ?;`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'Error terminating employee',
        error: err.message
      });
    }
    res.json({ message: "Employee terminated successfully", data: result });
  });
});

// Employee Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required'
    });
  }

  try {
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

    let isPasswordValid = false;
    if (password === employee.password) {
      isPasswordValid = true;
    } else {
      try {
        isPasswordValid = await bcrypt.compare(password, employee.password);
      } catch {
        isPasswordValid = false;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const detailSql = `SELECT employee_id, email, first_name, last_name, job_title, phone, hire_date, gender
                       FROM employee
                       WHERE employee_id = ?`;
    const employeeDetails = await new Promise((resolve, reject) => {
      db.query(detailSql, [employee.employee_id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });

    res.json({
      message: 'Login successful',
      data: {
        employee_id: employeeDetails.employee_id,
        email: employeeDetails.email,
        first_name: employeeDetails.first_name,
        last_name: employeeDetails.last_name,
        job_title: employeeDetails.job_title,
        phone: employeeDetails.phone,
        hire_date: employeeDetails.hire_date,
        gender: employeeDetails.gender,
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

export default router;
