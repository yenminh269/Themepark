import express from 'express';
import db from '../config/db.js';
import { uploadStore } from '../config/upload.js';

const router = express.Router();

// POST /add - Add a new store with photo upload
router.post('/add', uploadStore.single('photo'), (req, res) => {
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

// GET / - Get all the stores
router.get('/', async (req, res) => {
    db.query(`SELECT * FROM store;`, (err, results) =>{
        if(err){
            return res.status(500).json({
            message: 'Error fetching stores',
            error: err.message
            })
        }
        res.json({data: results });
    });
});

// GET /except-photo - Get all the stores except photo
router.get('/except-photo', async (req, res) => {
  db.query(`SELECT name, type, status, description, open_time, close_time FROM store;`, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Error fetching stores except photo',
        error: err.message
      });
    }
    res.json({ data: results });
  });
});

// GET /:employeeId/stores - Get stores assigned to a specific employee with their shift schedules
router.get('/:employeeId/stores', async (req, res) => {
    const { employeeId } = req.params;
    const sql = `
        SELECT
            s.store_id,
            s.name,
            s.type,
            s.status,
            s.description,
            s.open_time,
            s.close_time,
            esj.work_date,
            esj.shift_start,
            esj.shift_end
        FROM store s
        INNER JOIN employee_store_job esj ON s.store_id = esj.store_id
        WHERE esj.employee_id = ?
        ORDER BY esj.work_date DESC, esj.shift_start
    `;

    db.query(sql, [employeeId], (err, results) => {
        if(err){
            console.error('Database error:', err);
            return res.status(500).json({
                message: 'Error fetching employee stores',
                error: err.message
            });
        }
        res.json({ data: results });
    });
});

// PUT /:id - Update a store
router.put('/:id', uploadStore.single('file'), async (req, res) => {
  const {name, type, status, description, open_time, close_time, photo_path, available_online} = req.body;
  const openTime = open_time.length === 5 ? open_time + ':00' : open_time;
  const closeTime = close_time.length === 5 ? close_time + ':00' : close_time;
  const id = req.params.id;

  if (!name || !type || !status || !description || !open_time || !close_time) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }

  // Determine photo_path: use uploaded file if provided, otherwise use provided photo_path
  let finalPhotoPath = photo_path;
  if (req.file) {
    finalPhotoPath = `/uploads/store_photos/${req.file.filename}`;
  }

  const sql = `
    UPDATE store
    SET
      name = ?,
      type = ?,
      status = ?,
      description = ?,
      open_time = ?,
      close_time = ?,
      photo_path = ?,
      available_online = ?
    WHERE store_id = ?;
  `;
  db.query(sql, [name, type, status, description, openTime, closeTime, finalPhotoPath, available_online, id],
     (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'Error updating store',
        error: err.message
      });
    }
    res.json({ message: "Store updated successfully", data: result, photo_path: finalPhotoPath });
  });
});

// DELETE /:id - Soft delete a store
router.delete('/:id', async (req, res) => {
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

export default router;
