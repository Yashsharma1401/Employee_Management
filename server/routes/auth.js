import express from 'express';
import {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  logout,
  getUserStats
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegistration, validateLogin } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

// Protected routes
router.use(authenticate); // All routes after this middleware are protected

router.get('/me', getMe);
router.patch('/me', updateMe);
router.patch('/change-password', changePassword);
router.post('/logout', logout);
router.get('/stats', getUserStats);

export default router;
