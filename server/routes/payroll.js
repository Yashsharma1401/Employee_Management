import express from 'express';
import Payroll from '../models/Payroll.js';
import { protect, authorize, canAccessEmployee } from '../middleware/auth.js';
import { validatePayroll } from '../middleware/validation.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get my payroll records
const getMyPayrolls = catchAsync(async (req, res, next) => {
  const payrolls = await Payroll.find({ employee: req.user._id })
    .sort({ 'payPeriod.year': -1, 'payPeriod.month': -1 });

  res.status(200).json({
    status: 'success',
    results: payrolls.length,
    data: { payrolls }
  });
});

// Get payslip by ID
const getPayslip = catchAsync(async (req, res, next) => {
  const payroll = await Payroll.findById(req.params.id)
    .populate('employee', 'firstName lastName employeeId designation');

  if (!payroll) {
    return next(new AppError('Payroll record not found', 404));
  }

  // Check access
  if (payroll.employee._id.toString() !== req.user._id.toString() && 
      !['super_admin', 'admin', 'hr'].includes(req.user.role)) {
    return next(new AppError('Unauthorized access', 403));
  }

  res.status(200).json({
    status: 'success',
    data: { payroll }
  });
});

router.get('/my-payrolls', getMyPayrolls);
router.get('/payslip/:id', getPayslip);

// HR/Admin only routes
router.use(authorize('super_admin', 'admin', 'hr'));

// Create payroll
const createPayroll = catchAsync(async (req, res, next) => {
  // Check if payroll already exists for this period
  const existingPayroll = await Payroll.findOne({
    employee: req.body.employee,
    'payPeriod.month': req.body.payPeriod.month,
    'payPeriod.year': req.body.payPeriod.year
  });

  if (existingPayroll) {
    return next(new AppError('Payroll already exists for this period', 400));
  }

  const payroll = await Payroll.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Payroll created successfully',
    data: { payroll }
  });
});

// Get all payrolls
const getAllPayrolls = catchAsync(async (req, res, next) => {
  const { month, year, employee, page = 1, limit = 10 } = req.query;
  
  const query = {};
  if (month) query['payPeriod.month'] = month;
  if (year) query['payPeriod.year'] = year;
  if (employee) query.employee = employee;

  const skip = (page - 1) * limit;

  const payrolls = await Payroll.find(query)
    .populate('employee', 'firstName lastName employeeId')
    .sort({ 'payPeriod.year': -1, 'payPeriod.month': -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Payroll.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: payrolls.length,
    data: {
      payrolls,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// Update payroll
const updatePayroll = catchAsync(async (req, res, next) => {
  const payroll = await Payroll.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!payroll) {
    return next(new AppError('Payroll record not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Payroll updated successfully',
    data: { payroll }
  });
});

// Process payment
const processPayment = catchAsync(async (req, res, next) => {
  const { paymentMethod, transactionId } = req.body;
  
  const payroll = await Payroll.findById(req.params.id);

  if (!payroll) {
    return next(new AppError('Payroll record not found', 404));
  }

  payroll.paymentStatus = 'paid';
  payroll.paymentDate = new Date();
  payroll.paymentMethod = paymentMethod;
  payroll.transactionId = transactionId;
  payroll.approvedBy = req.user._id;
  payroll.approvalDate = new Date();

  await payroll.save();

  res.status(200).json({
    status: 'success',
    message: 'Payment processed successfully',
    data: { payroll }
  });
});

router.route('/')
  .get(getAllPayrolls)
  .post(validatePayroll, createPayroll);

router.route('/:id')
  .patch(updatePayroll);

router.patch('/:id/process-payment', processPayment);

export default router;
