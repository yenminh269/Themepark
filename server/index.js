import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import "dotenv/config";

// Import route modules
import customerRoutes from './routes/customer.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import rideRoutes from './routes/ride.routes.js';
import storeRoutes from './routes/store.routes.js';
import maintenanceRoutes from './routes/maintenance.routes.js';
import orderRoutes from './routes/order.routes.js';
import merchandiseRoutes from './routes/merchandise.routes.js';
import scheduleRoutes from './routes/schedule.routes.js';
import adminRoutes from './routes/admin.routes.js';
import managerRoutes from './routes/manager.routes.js';
import reportsRoutes from './routes/reports.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ===== CORS Configuration =====
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://thethemepark.vercel.app',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ===== Middlewares =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // serve uploaded images

// ===== Mount Route Modules =====
app.use('/api/customer', customerRoutes);
app.use('/employee', employeeRoutes);
app.use('/employees', employeeRoutes);
app.use('/ride', rideRoutes);
app.use('/rides', rideRoutes);
app.use('/store', storeRoutes);
app.use('/stores', storeRoutes);
app.use('/ride-maintenance', maintenanceRoutes);
app.use('/maintenances', maintenanceRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/employee-maintenances', maintenanceRoutes);
app.use('/api', orderRoutes);
app.use('/api', merchandiseRoutes);
app.use('/api', scheduleRoutes);
app.use('/admin', adminRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/reports', reportsRoutes);

// ===== Health Check Endpoint =====
app.get('/', (_req, res) => {
  res.json({ message: 'Theme Park Management System API is running' });
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
