import express from 'express';
import Performance from '../models/Performance.js';
import { protect, authorize, canAccessEmployee } from '../middleware/auth.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(protect);

// Get my performance reviews
const getMyPerformance = catchAsync(async (req, res, next) => {
  const reviews = await Performance.find({ employee: req.user._id })
    .populate('reviewer', 'firstName lastName')
    .sort({ 'reviewPeriod.endDate': -1 });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews }
  });
});

// Acknowledge performance review
const acknowledgeReview = catchAsync(async (req, res, next) => {
  const review = await Performance.findById(req.params.id);

  if (!review) {
    return next(new AppError('Performance review not found', 404));
  }

  if (review.employee.toString() !== req.user._id.toString()) {
    return next(new AppError('Unauthorized', 403));
  }

  review.employeeAcknowledged = true;
  review.employeeAcknowledgedDate = new Date();
  review.employeeComments = req.body.comments;

  await review.save();

  res.status(200).json({
    status: 'success',
    message: 'Performance review acknowledged',
    data: { review }
  });
});

router.get('/my-reviews', getMyPerformance);
router.patch('/:id/acknowledge', acknowledgeReview);

// Manager/HR routes
router.use(authorize('super_admin', 'admin', 'hr', 'manager'));

// Create performance review
const createReview = catchAsync(async (req, res, next) => {
  const reviewData = {
    ...req.body,
    reviewer: req.user._id
  };

  const review = await Performance.create(reviewData);

  res.status(201).json({
    status: 'success',
    message: 'Performance review created successfully',
    data: { review }
  });
});

// Get all reviews
const getAllReviews = catchAsync(async (req, res, next) => {
  const { employee, quarter, year } = req.query;
  
  const query = {};
  if (employee) query.employee = employee;
  if (quarter) query['reviewPeriod.quarter'] = quarter;
  if (year) query['reviewPeriod.year'] = year;

  const reviews = await Performance.find(query)
    .populate('employee', 'firstName lastName employeeId')
    .populate('reviewer', 'firstName lastName')
    .sort({ 'reviewPeriod.endDate': -1 });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews }
  });
});

// Update review
const updateReview = catchAsync(async (req, res, next) => {
  const review = await Performance.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!review) {
    return next(new AppError('Performance review not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Performance review updated successfully',
    data: { review }
  });
});

// Approve review (HR)
const approveReview = catchAsync(async (req, res, next) => {
  const review = await Performance.findById(req.params.id);

  if (!review) {
    return next(new AppError('Performance review not found', 404));
  }

  review.hrApproved = true;
  review.hrApprovedBy = req.user._id;
  review.hrApprovedDate = new Date();
  review.status = 'approved';

  await review.save();

  res.status(200).json({
    status: 'success',
    message: 'Performance review approved',
    data: { review }
  });
});

router.route('/')
  .get(getAllReviews)
  .post(createReview);

router.route('/:id')
  .patch(updateReview);

router.patch('/:id/approve', authorize('super_admin', 'admin', 'hr'), approveReview);

export default router;
