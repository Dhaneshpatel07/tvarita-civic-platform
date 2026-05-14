import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import User from './models/User.js';
import Issue from './models/Issue.js';
import Metric from './models/Metric.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Clean Cloudinary
    console.log('☁️ Cleaning Cloudinary...');
    const result = await cloudinary.api.delete_all_resources({
        resource_type: 'image',
        type: 'upload',
        prefix: 'civic_issues/' // Target our specific folder
    });
    console.log('✅ Cloudinary Cleanup Result:', result);

    // 2. Clean MongoDB (except Users)
    console.log('🍃 Cleaning MongoDB Issues and Metrics...');
    const issueDelete = await Issue.deleteMany({});
    const metricDelete = await Metric.deleteMany({});
    console.log(`✅ Deleted ${issueDelete.deletedCount} Issues`);
    console.log(`✅ Deleted ${metricDelete.deletedCount} Metrics`);

    // 3. List Users
    console.log('\n👥 Current Registered Users:');
    const users = await User.find({}, 'name email role createdAt');
    if (users.length === 0) {
        console.log('No users found.');
    } else {
        console.table(users.map(u => ({
            Name: u.name,
            Email: u.email,
            Role: u.role,
            Joined: u.createdAt.toDateString()
        })));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup Failed:', error);
    process.exit(1);
  }
}

cleanup();
