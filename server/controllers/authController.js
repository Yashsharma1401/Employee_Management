import User from '../models/User.js';
import Department from '../models/Department.js';
import { generateToken } from '../middleware/auth.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

// Register new user
export const register = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    department,
    designation,
    salary,
    role = 'employee',
    joiningDate,
    manager
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [{ email }, { phone }] 
  });

  if (existingUser) {
    return next(new AppError('User with this email or phone already exists', 400));
  }

  // Check if department exists
  const departmentExists = await Department.findById(department);
  if (!departmentExists) {
    return next(new AppError('Department not found', 400));
  }

  // Create new user
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    department,
    designation,
    salary,
    role,
    joiningDate: joiningDate || Date.now(),
    manager
  });

  // Remove password from output
  user.password = undefined;

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    token,
    data: {
      user
    }
  });
});

// Login user
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email and include password
  const user = await User.findOne({ email }).select('+password').populate('department', 'name');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check if user is active
  if (user.status !== 'active') {
    return next(new AppError('Your account is not active. Please contact administrator.', 401));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Remove password from output
  user.password = undefined;

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    token,
    data: {
      user
    }
  });
});

// Get current user profile
export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .populate('department', 'name description')
    .populate('manager', 'firstName lastName email designation');

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update current user profile
export const updateMe = catchAsync(async (req, res, next) => {
  // Fields that user can update themselves
  const allowedFields = [
    'phone',
    'address',
    'emergencyContact',
    'profileImage'
  ];

  const updateData = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  });

  if (Object.keys(updateData).length === 0) {
    return next(new AppError('No valid fields to update', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).populate('department', 'name description');

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user
    }
  });
});

// Change password
export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = generateToken(user._id);

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
    token
  });
});

// Logout (client-side token removal)
export const logout = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// Get user stats (for dashboard)
export const getUserStats = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  // Import models dynamically to avoid circular dependencies
  const Attendance = (await import('../models/Attendance.js')).default;
  const Leave = (await import('../models/Leave.js')).default;
  const Performance = (await import('../models/Performance.js')).default;

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Get attendance stats for current month
  const attendanceStats = await Attendance.aggregate([
    {
      $match: {
        employee: userId,
        $expr: {
          $and: [
            { $eq: [{ $month: "$date" }, currentMonth] },
            { $eq: [{ $year: "$date" }, currentYear] }
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        presentDays: {
          $sum: {
            $cond: [{ $eq: ["$status", "present"] }, 1, 0]
          }
        },
        totalHours: { $sum: "$totalHours" }
      }
    }
  ]);

  // Get leave stats
  const leaveStats = await Leave.aggregate([
    {
      $match: {
        employee: userId,
        status: { $in: ['approved', 'pending'] }
      }
    },
    {
      $group: {
        _id: "$leaveType",
        totalDays: { $sum: "$totalDays" }
      }
    }
  ]);

  // Get latest performance review
  const latestPerformance = await Performance.findOne({
    employee: userId
  }).sort({ 'reviewPeriod.endDate': -1 });

  res.status(200).json({
    status: 'success',
    data: {
      attendance: attendanceStats[0] || { totalDays: 0, presentDays: 0, totalHours: 0 },
      leaveBalance: req.user.leaveBalance,
      usedLeave: leaveStats,
      latestPerformance
    }
  });
});
