import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Final direct-link configuration for guaranteed signature matching
cloudinary.config({
  cloud_name: 'dtqz9npgu',
  api_key: '832232444623993',
  api_secret: 'cwv--HCc5rNb-6d_iAN6C0E4NTI'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'civic_issues',
    allowedFormats: ['jpg', 'png', 'jpeg', 'heic', 'heif'],
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB Hard Limit
});

export { cloudinary, upload };
