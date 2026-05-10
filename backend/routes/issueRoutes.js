import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
import {
  createIssue,
  getMyIssues,
  getNearbyIssues,
  getPublicMetrics,
  getAllIssues,
  updateIssueStatus,
  upvoteIssue
} from '../controllers/issueController.js';

const router = express.Router();

// Public Routes
router.get('/nearby', getNearbyIssues);
router.get('/public/metrics', getPublicMetrics);
router.get('/', getAllIssues);

// Protected Citizen Routes
router.post('/', protect, createIssue);
router.get('/my', protect, getMyIssues);
router.post('/:id/upvote', protect, upvoteIssue);

// Protected Admin Routes
router.put('/:id/status', protect, admin, updateIssueStatus);

export default router;
