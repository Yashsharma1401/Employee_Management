import express from 'express';
import {
  getAllDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats,
  getDepartmentsList
} from '../controllers/departmentController.js';
import { authenticate, authorize, hasMinimumRole } from '../middleware/auth.js';
import { validateDepartment } from '../middleware/validation.js';

const router = express.Router();

// Protect all routes
router.use(authenticate);

// Get departments list (for dropdowns) - all authenticated users
router.get('/list', getDepartmentsList);

// Get all departments - all authenticated users can view
router.get('/', getAllDepartments);

// Get single department - all authenticated users can view
router.get('/:id', getDepartment);

// Get department statistics - managers and above
router.get('/:id/stats', hasMinimumRole('manager'), getDepartmentStats);

// Create department - admin and above
router.post('/', hasMinimumRole('admin'), validateDepartment, createDepartment);

// Update department - admin and above
router.put('/:id', hasMinimumRole('admin'), validateDepartment, updateDepartment);

// Delete department - admin and above
router.delete('/:id', hasMinimumRole('admin'), deleteDepartment);

export default router;
