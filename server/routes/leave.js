import express from 'express';
import Leave from '../models/Leave.js';
import User from '../models/User.js';
import { protect, authorize, canAccessEmployee } from '../middleware/auth.js';
import { validateLeaveRequest } from '../middleware/validation.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Apply for leave
const applyLeave = catchAsync(async (req, res, next) => {
  const leaveData = {
    ...req.body,
    employee: req.user._id
  };

  // Check leave balance
  const employee = await User.findById(req.user._id);
  const leaveType = req.body.leaveType;
  const requestedDays = req.body.totalDays;

  if (leaveType !== 'unpaid' && employee.leaveBalance[leaveType] < requestedDays) {
    return next(new AppError(`Insufficient ${leaveType} leave balance`, 400));
  }

  const leave = await Leave.create(leaveData);

  res.status(201).json({
    status: 'success',
    message: 'Leave request submitted successfully',
    data: { leave }
  });
});

// Get user's leave requests
const getMyLeaves = catchAsync(async (req, res, next) => {
  const leaves = await Leave.find({ employee: req.user._id })
    .sort({ appliedDate: -1 });

  res.status(200).json({
    status: 'success',
    results: leaves.length,
    data: { leaves }
  });
});

// Update leave request
const updateLeaveRequest = catchAsync(async (req, res, next) => {
  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    return next(new AppError('Leave request not found', 404));
  }

  if (leave.employee.toString() !== req.user._id.toString()) {
    return next(new AppError('Unauthorized', 403));
  }

  if (leave.status !== 'pending') {
    return next(new AppError('Cannot update non-pending leave request', 400));
  }

  const updatedLeave = await Leave.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Leave request updated successfully',
    data: { leave: updatedLeave }
  });
});

// Cancel leave request
const cancelLeave = catchAsync(async (req, res, next) => {
  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    return next(new AppError('Leave request not found', 404));
  }

  if (leave.employee.toString() !== req.user._id.toString()) {
    return next(new AppError('Unauthorized', 403));
  }

  if (leave.status === 'approved') {
    return next(new AppError('Cannot cancel approved leave request', 400));
  }

  leave.status = 'cancelled';
  await leave.save();

  res.status(200).json({
    status: 'success',
    message: 'Leave request cancelled successfully'
  });
});

// Approve/reject leave (managers/HR)
const processLeave = catchAsync(async (req, res, next) => {
  const { status, rejectionReason } = req.body;
  const leave = await Leave.findById(req.params.id).populate('employee');

  if (!leave) {
    return next(new AppError('Leave request not found', 404));
  }

  if (status === 'approved') {
    // Deduct from leave balance
    const employee = leave.employee;
    if (leave.leaveType !== 'unpaid') {
      employee.leaveBalance[leave.leaveType] -= leave.totalDays;
      await employee.save();
    }
  }

  leave.status = status;
  leave.approvedBy = req.user._id;
  leave.approvalDate = new Date();
  if (rejectionReason) leave.rejectionReason = rejectionReason;

  await leave.save();

  res.status(200).json({
    status: 'success',
    message: `Leave request ${status} successfully`,
    data: { leave }
  });
});

// Routes
router.post('/apply', validateLeaveRequest, applyLeave);
router.get('/my-leaves', getMyLeaves);
router.patch('/:id', updateLeaveRequest);
router.patch('/:id/cancel', cancelLeave);

// Manager/HR routes
router.use(authorize('super_admin', 'admin', 'hr', 'manager'));
router.get('/', async (req, res) => {
  const leaves = await Leave.find()
    .populate('employee', 'firstName lastName employeeId')
    .sort({ appliedDate: -1 });
  
  res.json({ status: 'success', data: { leaves } });
});
router.patch('/:id/process', processLeave);

export default router;
