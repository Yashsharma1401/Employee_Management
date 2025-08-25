import express from 'express';
import { protect, authorize, canAccessEmployee } from '../middleware/auth.js';
import { validateAttendance } from '../middleware/validation.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Clock in/out routes
router.post('/clock-in', validateAttendance, clockIn);
router.patch('/clock-out/:id', clockOut);

// Get attendance records
router.get('/my-attendance', getMyAttendance);
router.get('/employee/:employeeId', canAccessEmployee, getEmployeeAttendance);
router.get('/summary/:employeeId', canAccessEmployee, getAttendanceSummary);

// Admin/Manager routes
router.use(authorize('super_admin', 'admin', 'hr', 'manager'));
router.get('/', getAllAttendance);
router.post('/manual-entry', validateAttendance, createManualEntry);
router.patch('/:id/approve', approveAttendance);
router.get('/reports', getAttendanceReports);

// Attendance controller functions
import Attendance from '../models/Attendance.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

const clockIn = catchAsync(async (req, res, next) => {
  const { location } = req.body;
  const today = new Date().toDateString();
  
  // Check if already clocked in today
  const existingAttendance = await Attendance.findOne({
    employee: req.user._id,
    date: { $gte: new Date(today) }
  });

  if (existingAttendance) {
    return next(new AppError('Already clocked in today', 400));
  }

  const attendance = await Attendance.create({
    employee: req.user._id,
    clockIn: new Date(),
    location
  });

  res.status(201).json({
    status: 'success',
    message: 'Clocked in successfully',
    data: { attendance }
  });
});

const clockOut = catchAsync(async (req, res, next) => {
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return next(new AppError('Attendance record not found', 404));
  }

  if (attendance.employee.toString() !== req.user._id.toString()) {
    return next(new AppError('Unauthorized', 403));
  }

  if (attendance.clockOut) {
    return next(new AppError('Already clocked out', 400));
  }

  attendance.clockOut = new Date();
  await attendance.save();

  res.status(200).json({
    status: 'success',
    message: 'Clocked out successfully',
    data: { attendance }
  });
});

const getMyAttendance = catchAsync(async (req, res, next) => {
  const { month, year } = req.query;
  const currentDate = new Date();
  const targetMonth = month || currentDate.getMonth() + 1;
  const targetYear = year || currentDate.getFullYear();

  const attendance = await Attendance.find({
    employee: req.user._id,
    $expr: {
      $and: [
        { $eq: [{ $month: "$date" }, parseInt(targetMonth)] },
        { $eq: [{ $year: "$date" }, parseInt(targetYear)] }
      ]
    }
  }).sort({ date: -1 });

  res.status(200).json({
    status: 'success',
    results: attendance.length,
    data: { attendance }
  });
});

export default router;
