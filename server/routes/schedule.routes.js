import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /api/employee-schedules - Get employee schedules
router.get('/employee-schedules', (req, res) => {
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

// POST /api/employee-schedules - Create employee schedule
router.post('/employee-schedules', (req, res) => {
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

// PUT /api/employee-schedules/:id - Update employee schedule
router.put('/employee-schedules/:id', (req, res) => {
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

// DELETE /api/employee-schedules/:id - Delete employee schedule
router.delete('/employee-schedules/:id', (req, res) => {
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

// GET /rain-outs - Get rain out records with employee information
router.get('/rain-outs', (req, res) => {
  const sql = `
    SELECT
      r.*,
      e1.first_name AS activate_emp_first_name,
      e1.last_name AS activate_emp_last_name,
      e2.first_name AS clear_emp_first_name,
      e2.last_name AS clear_emp_last_name
    FROM rain_out r
    LEFT JOIN employee e1 ON r.activate_emp = e1.employee_id
    LEFT JOIN employee e2 ON r.clear_emp = e2.employee_id
    ORDER BY r.rain_out_date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching rain outs:', err);
      return res.status(500).json({ error: 'Failed to fetch rain outs' });
    }
    res.json({ data: results });
  });
});

// POST /rain-outs - Create rain out record
router.post('/rain-outs', (req, res) => {
  const { rain_out_date, note, activate_emp } = req.body;

  if (!rain_out_date) {
    return res.status(400).json({ error: 'Rain out date is required' });
  }

  if (!activate_emp) {
    return res.status(400).json({ error: 'Employee ID is required' });
  }

  // First, check if a rain out already exists for this date
  const checkSql = 'SELECT rain_out_id, status FROM rain_out WHERE rain_out_date = ?';

  db.query(checkSql, [rain_out_date], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Error checking rain out:', checkErr);
      return res.status(500).json({ error: 'Failed to check rain out status' });
    }

    if (checkResults.length > 0) {
      // Rain out already exists for this date
      const existingRainOut = checkResults[0];
      if (existingRainOut.status === 'active') {
        return res.status(409).json({
          error: 'A rain out for this date is already active',
          message: 'A rain out for this date is already active'
        });
      } else {
        return res.status(409).json({
          error: 'A rain out for this date already exists',
          message: 'A rain out for this date already exists'
        });
      }
    }

    // No existing rain out, proceed with insertion
    const insertSql = `
      INSERT INTO rain_out (rain_out_date, note, status, activate_emp)
      VALUES (?, ?, 'active', ?)
    `;

    db.query(insertSql, [rain_out_date, note, activate_emp], (err, result) => {
      if (err) {
        console.error('Error creating rain out:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({
            error: 'Rain out already exists for this date',
            message: 'Rain out already exists for this date'
          });
        }
        return res.status(500).json({ error: 'Failed to create rain out', message: err.message });
      }
      res.json({
        message: 'Rain out recorded successfully',
        rain_out_id: result.insertId
      });
    });
  });
});

// PUT /rain-outs/:id - Update rain out status
router.put('/rain-outs/:id', (req, res) => {
  const rainOutId = req.params.id;
  const { status, note, clear_emp } = req.body;

  let sql, params;

  // If status is 'cleared', also update clear_emp and resolved_at
  if (status === 'cleared' && clear_emp) {
    if (note !== undefined) {
      sql = 'UPDATE rain_out SET status = ?, note = ?, clear_emp = ?, resolved_at = NOW() WHERE rain_out_id = ?';
      params = [status, note, clear_emp, rainOutId];
    } else {
      sql = 'UPDATE rain_out SET status = ?, clear_emp = ?, resolved_at = NOW() WHERE rain_out_id = ?';
      params = [status, clear_emp, rainOutId];
    }
  } else {
    // Regular update without clear_emp
    if (note !== undefined) {
      sql = 'UPDATE rain_out SET status = ?, note = ? WHERE rain_out_id = ?';
      params = [status, note, rainOutId];
    } else {
      sql = 'UPDATE rain_out SET status = ? WHERE rain_out_id = ?';
      params = [status, rainOutId];
    }
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error updating rain out:', err);
      return res.status(500).json({ error: 'Failed to update rain out' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Rain out not found' });
    }

    // If status is 'cleared', manually update ride statuses (as backup to trigger)
    if (status === 'cleared') {
      const updateRidesSql = `
        UPDATE ride
        SET status = 'open'
        WHERE status = 'closed'
        AND ride_id NOT IN (
          SELECT DISTINCT ride_id
          FROM maintenance
          WHERE status != 'done'
        )
      `;

      db.query(updateRidesSql, (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Error updating ride statuses after clearing rain:', updateErr);
          // Don't fail the whole request, just log the error
        } else {
          console.log(`Updated ${updateResult.affectedRows} rides to 'open' status`);
        }
        res.json({
          message: 'Rain out updated successfully',
          ridesUpdated: updateResult ? updateResult.affectedRows : 0
        });
      });
    } else {
      res.json({ message: 'Rain out updated successfully' });
    }
  });
});

export default router;
