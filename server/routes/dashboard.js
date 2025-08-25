import express from 'express';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import Performance from '../models/Performance.js';
import { protect, authorize } from '../middleware/auth.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(protect);

// Employee dashboard
const getEmployeeDashboard = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Today's attendance
  const todayAttendance = await Attendance.findOne({
    employee: userId,
    date: {
      $gte: new Date(currentDate.setHours(0, 0, 0, 0)),
      $lt: new Date(currentDate.setHours(23, 59, 59, 999))
    }
  });

  // This month's attendance summary
  const monthlyAttendance = await Attendance.aggregate([
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
        totalHours: { $sum: "$totalHours" },
        presentDays: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } }
      }
    }
  ]);

  // Pending leaves
  const pendingLeaves = await Leave.find({
    employee: userId,
    status: 'pending'
  }).countDocuments();

  // Recent payslip
  const recentPayslip = await Payroll.findOne({
    employee: userId
  }).sort({ 'payPeriod.year': -1, 'payPeriod.month': -1 });

  res.status(200).json({
    status: 'success',
    data: {
      todayAttendance,
      monthlyAttendance: monthlyAttendance[0] || { totalDays: 0, totalHours: 0, presentDays: 0 },
      pendingLeaves,
      recentPayslip,
      leaveBalance: req.user.leaveBalance
    }
  });
});

// Admin dashboard
const getAdminDashboard = catchAsync(async (req, res, next) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Employee stats
  const employeeStats = await User.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  // Department wise employee count
  const departmentStats = await User.aggregate([
    {
      $match: { status: 'active' }
    },
    {
      $lookup: {
        from: 'departments',
        localField: 'department',
        foreignField: '_id',
        as: 'dept'
      }
    },
    {
      $unwind: '$dept'
    },
    {
      $group: {
        _id: '$dept.name',
        count: { $sum: 1 }
      }
    }
  ]);

  // Today's attendance overview
  const todayAttendanceOverview = await Attendance.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(currentDate.setHours(0, 0, 0, 0)),
          $lt: new Date(currentDate.setHours(23, 59, 59, 999))
        }
      }
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  // Pending leave requests
  const pendingLeaveRequests = await Leave.find({
    status: 'pending'
  }).countDocuments();

  // Monthly payroll summary
  const payrollSummary = await Payroll.aggregate([
    {
      $match: {
        'payPeriod.month': currentMonth,
        'payPeriod.year': currentYear
      }
    },
    {
      $group: {
        _id: null,
        totalEmployees: { $sum: 1 },
        totalGross: { $sum: "$grossSalary" },
        totalNet: { $sum: "$netSalary" },
        paid: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] } }
      }
    }
  ]);

  // Recent performance reviews
  const recentReviews = await Performance.find()
    .populate('employee', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    status: 'success',
    data: {
      employeeStats,
      departmentStats,
      todayAttendanceOverview,
      pendingLeaveRequests,
      payrollSummary: payrollSummary[0] || { totalEmployees: 0, totalGross: 0, totalNet: 0, paid: 0 },
      recentReviews
    }
  });
});

// Routes
router.get('/employee', getEmployeeDashboard);
router.get('/admin', authorize('super_admin', 'admin', 'hr'), getAdminDashboard);

export default router;
