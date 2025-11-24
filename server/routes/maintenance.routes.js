import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// POST / - Schedule ride maintenance
router.post('/', async (req, res) => {
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

// GET / - Get all maintenance schedules with details
router.get('/', async (req, res) => {
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

// GET /employee/:employeeId - Get maintenance schedules for a specific employee
router.get('/:employeeId', async (req, res) => {
  const { employeeId } = req.params;

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
      emj_current.worked_hour
    FROM maintenance m
    INNER JOIN employee_maintenance_job emj_current
      ON m.maintenance_id = emj_current.maintenance_id
      AND emj_current.employee_id = ?
    LEFT JOIN ride r ON m.ride_id = r.ride_id
    ORDER BY m.scheduled_date DESC
  `;

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(sql, [employeeId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json({
      message: 'Employee maintenance schedules retrieved successfully',
      data: results,
      count: results.length
    });
  } catch (err) {
    console.error('Error fetching employee maintenance schedules:', err);
    return res.status(500).json({
      message: 'Error fetching employee maintenance schedules',
      error: err.message
    });
  }
});

// PUT /:id - Update maintenance status
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const sql = 'UPDATE maintenance SET status = ? WHERE maintenance_id = ?';

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(sql, [status, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Maintenance task not found' });
    }

    res.json({
      message: 'Maintenance status updated successfully',
      maintenance_id: id,
      status: status
    });
  } catch (err) {
    console.error('Error updating maintenance status:', err);
    return res.status(500).json({
      message: 'Error updating maintenance status',
      error: err.message
    });
  }
});

export default router;
