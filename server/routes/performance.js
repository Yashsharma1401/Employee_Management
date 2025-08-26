import express from 'express';
import { performanceTable } from '../schema.js';
import { authenticate, authorize, canModifyEmployee } from '../middleware/auth.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(authenticate);

// Placeholder routes - these will need to be implemented with proper Drizzle queries
router.get('/', (req, res) => {
  res.json({ message: 'Performance routes need to be implemented with Drizzle' });
});

export default router;
