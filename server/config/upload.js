import multer from 'multer';
import path from 'path';

// Storage for ride photos
const rideStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/ride_photos');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage for store photos
const storeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/store_photos');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ storage: rideStorage });
export const uploadStore = multer({ storage: storeStorage });
