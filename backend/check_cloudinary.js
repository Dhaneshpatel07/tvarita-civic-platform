import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function check() {
  try {
    const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'civic_issues/',
        max_results: 10
    });
    console.log('☁️ Cloudinary Folder Status:');
    if (result.resources.length === 0) {
        console.log('✅ Folder "civic_issues/" is empty.');
    } else {
        console.log(`Found ${result.resources.length} resources:`);
        result.resources.forEach(r => console.log(`- ${r.public_id}`));
    }
  } catch (error) {
    console.error('❌ Cloudinary Check Failed:', error.message);
  }
}

check();
