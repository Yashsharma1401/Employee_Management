import express from 'express';
import {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeDashboard,
  getTeamMembers,
  bulkUpdateEmployees
} from '../controllers/employeeController.js';
import { protect, authorize, canAccessEmployee } from '../middleware/auth.js';
import { validateRegistration } from '../middleware/validation.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes accessible by all authenticated users
router.get('/team', getTeamMembers); // Get team members for managers

// Routes that require employee access check
router.get('/:id', canAccessEmployee, getEmployee);
router.get('/:id/dashboard', canAccessEmployee, getEmployeeDashboard);

// Admin/HR only routes
router.use(authorize('super_admin', 'admin', 'hr'));

router.route('/')
  .get(getAllEmployees)
  .post(validateRegistration, createEmployee);

router.route('/:id')
  .patch(updateEmployee)
  .delete(deleteEmployee);

router.patch('/bulk-update', bulkUpdateEmployees);

export default router;
