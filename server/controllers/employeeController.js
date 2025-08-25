import User from '../models/User.js';
import Department from '../models/Department.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

// Get all employees
export const getAllEmployees = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search,
    department,
    role,
    status = 'active',
    sortBy = 'firstName',
    sortOrder = 'asc'
  } = req.query;

  // Build query
  const query = { status };

  // Search functionality
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
      { designation: { $regex: search, $options: 'i' } }
    ];
  }

  if (department) query.department = department;
  if (role) query.role = role;

  // Sorting
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Pagination
  const skip = (page - 1) * limit;

  const employees = await User.find(query)
    .populate('department', 'name')
    .populate('manager', 'firstName lastName')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-password');

  const total = await User.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: employees.length,
    data: {
      employees,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalEmployees: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

// Get single employee
export const getEmployee = catchAsync(async (req, res, next) => {
  const employee = await User.findById(req.params.id)
    .populate('department', 'name description head')
    .populate('manager', 'firstName lastName email designation')
    .select('-password');

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      employee
    }
  });
});

// Create new employee
export const createEmployee = catchAsync(async (req, res, next) => {
  // Check if department exists
  if (req.body.department) {
    const departmentExists = await Department.findById(req.body.department);
    if (!departmentExists) {
      return next(new AppError('Department not found', 400));
    }
  }

  // Check if manager exists (if provided)
  if (req.body.manager) {
    const managerExists = await User.findById(req.body.manager);
    if (!managerExists) {
      return next(new AppError('Manager not found', 400));
    }
  }

  // Create employee with default password
  const employeeData = {
    ...req.body,
    password: req.body.password || 'Welcome@123'
  };

  const employee = await User.create(employeeData);

  // Remove password from response
  employee.password = undefined;

  res.status(201).json({
    status: 'success',
    message: 'Employee created successfully',
    data: {
      employee
    }
  });
});

// Update employee
export const updateEmployee = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Fields that can be updated
  const allowedFields = [
    'firstName', 'lastName', 'phone', 'department', 'designation',
    'salary', 'role', 'status', 'manager', 'address', 'emergencyContact',
    'dateOfBirth', 'leaveBalance'
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

  // Validate department if being updated
  if (updateData.department) {
    const departmentExists = await Department.findById(updateData.department);
    if (!departmentExists) {
      return next(new AppError('Department not found', 400));
    }
  }

  // Validate manager if being updated
  if (updateData.manager) {
    const managerExists = await User.findById(updateData.manager);
    if (!managerExists) {
      return next(new AppError('Manager not found', 400));
    }
  }

  const employee = await User.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  )
  .populate('department', 'name')
  .populate('manager', 'firstName lastName')
  .select('-password');

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Employee updated successfully',
    data: {
      employee
    }
  });
});

// Delete employee (soft delete)
export const deleteEmployee = catchAsync(async (req, res, next) => {
  const employee = await User.findByIdAndUpdate(
    req.params.id,
    { status: 'terminated' },
    { new: true }
  );

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Employee terminated successfully'
  });
});

// Get employee dashboard stats
export const getEmployeeDashboard = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Import models to avoid circular dependencies
  const Attendance = (await import('../models/Attendance.js')).default;
  const Leave = (await import('../models/Leave.js')).default;
  const Payroll = (await import('../models/Payroll.js')).default;

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Get employee details
  const employee = await User.findById(id)
    .populate('department', 'name')
    .select('-password');

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  // Get attendance summary for current month
  const attendanceSummary = await Attendance.aggregate([
    {
      $match: {
        employee: employee._id,
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
        presentDays: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
        lateDays: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } }
      }
    }
  ]);

  // Get recent leave requests
  const recentLeaves = await Leave.find({ employee: id })
    .sort({ appliedDate: -1 })
    .limit(5)
    .select('leaveType startDate endDate status totalDays');

  // Get latest payroll
  const latestPayroll = await Payroll.findOne({ employee: id })
    .sort({ 'payPeriod.year': -1, 'payPeriod.month': -1 });

  res.status(200).json({
    status: 'success',
    data: {
      employee,
      attendance: attendanceSummary[0] || {
        totalDays: 0,
        totalHours: 0,
        presentDays: 0,
        lateDays: 0
      },
      recentLeaves,
      latestPayroll
    }
  });
});

// Get team members (for managers)
export const getTeamMembers = catchAsync(async (req, res, next) => {
  const managerId = req.user._id;

  const teamMembers = await User.find({ 
    manager: managerId,
    status: 'active'
  })
  .populate('department', 'name')
  .select('-password')
  .sort('firstName');

  res.status(200).json({
    status: 'success',
    results: teamMembers.length,
    data: {
      teamMembers
    }
  });
});

// Bulk update employees
export const bulkUpdateEmployees = catchAsync(async (req, res, next) => {
  const { employeeIds, updateData } = req.body;

  if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
    return next(new AppError('Please provide employee IDs', 400));
  }

  const allowedFields = ['status', 'department', 'salary', 'role'];
  const filteredUpdateData = {};

  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredUpdateData[key] = updateData[key];
    }
  });

  if (Object.keys(filteredUpdateData).length === 0) {
    return next(new AppError('No valid fields to update', 400));
  }

  const result = await User.updateMany(
    { _id: { $in: employeeIds } },
    filteredUpdateData
  );

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} employees updated successfully`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});
