import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import issueRoutes from './routes/issueRoutes.js';

// Load env vars
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(morgan('dev'));

// Basic healthcheck route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Civic Issue System API is running.' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

// Database connection
const PORT = process.env.PORT || 5000;
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️ MONGODB_URI is not set. Running without database connection.');
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');

    // 🛡️ Guarantee 2dsphere index exists before traffic starts to prevent Geospatial crashes
    await mongoose.model('Issue').createIndexes();
    console.log('🌍 Geospatial 2dsphere Index Verified');

    // Automatically seed a Master Administrator account to allow Web Dashboard access
    const User = mongoose.model('User');
    const adminExists = await User.findOne({ email: 'admin@tvarita.com' });
    
    if (!adminExists) {
        await User.create({
           name: 'Tvarita Administrator',
           email: 'admin@tvarita.com',
           password: 'dhanesh',
           role: 'admin'
        });
        console.log('🛡️ Master Admin Node Seeded: admin@tvarita.com');
    }

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();

// ==========================================
// 🛡️ Global Node.js Panic Interceptors
// Prevents the server from terminating if an external API drops connection
// ==========================================
process.on('unhandledRejection', (reason, promise) => {
  console.error('🛡️ [Global Panic Intercepted] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('🛡️ [Global Panic Intercepted] Uncaught Exception:', error);
});
