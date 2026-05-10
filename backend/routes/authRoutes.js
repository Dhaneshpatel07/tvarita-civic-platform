import express from 'express';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if(!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'citizen',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if(!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @route   PUT /api/auth/token
// @desc    Register a hardware Expo device token to a citizen identity
router.put('/token', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if(user) {
       user.pushToken = req.body.token;
       await user.save();
       res.json({ message: 'Hardware lock successfully mapped to Citizen Database.' });
    } else {
       res.status(404).json({ message: 'User verification failed heavily' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
