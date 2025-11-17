import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const ridePhotosDir = path.join(__dirname, '..', 'uploads', 'ride_photos');
const storePhotosDir = path.join(__dirname, '..', 'uploads', 'store_photos');
const merchandisePhotosDir = path.join(__dirname, '..', 'uploads', 'merchandise_photos');

if (!fs.existsSync(ridePhotosDir)) {
  fs.mkdirSync(ridePhotosDir, { recursive: true });
}
if (!fs.existsSync(storePhotosDir)) {
  fs.mkdirSync(storePhotosDir, { recursive: true });
}
if (!fs.existsSync(merchandisePhotosDir)) {
  fs.mkdirSync(merchandisePhotosDir, { recursive: true });
}

// Storage for ride photos
const rideStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, ridePhotosDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage for store photos
const storeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, storePhotosDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage for merchandise photos
const merchandiseStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, merchandisePhotosDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ storage: rideStorage });
export const uploadStore = multer({ storage: storeStorage });
export const uploadMerchandise = multer({ storage: merchandiseStorage });
