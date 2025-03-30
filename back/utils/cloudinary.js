import multer from 'multer';
import path from 'node:path';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';



const storage =  new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'striveblog',
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    allowed_formats: ['jpg', 'png', 'jpeg']
  }
});

const uploadCloudinary = multer({ storage });

export default uploadCloudinary;