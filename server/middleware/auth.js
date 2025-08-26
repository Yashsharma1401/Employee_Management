import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { usersTable, departmentsTable } from '../schema/index.js';
import { eq, sql } from 'drizzle-orm';
import { catchAsync, AppError } from './errorHandler.js';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Verify JWT token and authenticate user
export const authenticate = catchAsync(async (req, res, next) => {
  // Get token from header
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Access denied. No token provided.', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const users = await db
      .select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
        phone: usersTable.phone,
        employeeId: usersTable.employeeId,
        role: usersTable.role,
        designation: usersTable.designation,
        status: usersTable.status,
        departmentId: usersTable.departmentId,
        managerId: usersTable.managerId,
        joiningDate: usersTable.joiningDate,
        leaveBalance: usersTable.leaveBalance,
        lastLogin: usersTable.lastLogin,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
        departmentName: departmentsTable.name
      })
      .from(usersTable)
      .leftJoin(departmentsTable, eq(usersTable.departmentId, departmentsTable.id))
      .where(eq(usersTable.id, decoded.id))
      .limit(1);

    if (users.length === 0) {
      return next(new AppError('User not found. Token is invalid.', 401));
    }

    const user = users[0];

    // Check if user is active
    if (user.status !== 'active') {
      return next(new AppError('Your account is not active. Please contact administrator.', 401));
    }

    // Add user to request object
    req.user = {
      ...user,
      department: { name: user.departmentName }
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    } else {
      return next(new AppError('Token verification failed', 401));
    }
  }
});

// Authorization middleware - check user roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Access denied. Please authenticate first.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied. Insufficient privileges.', 403));
    }

    next();
  };
};

// Check if user owns the resource or has sufficient privileges
export const checkOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    const userId = req.params[userIdField] || req.body[userIdField];
    
    // Super admin and admin can access any resource
    if (['super_admin', 'admin'].includes(req.user.role)) {
      return next();
    }

    // HR can access most resources
    if (req.user.role === 'hr') {
      return next();
    }

    // Managers can access their team members' resources
    if (req.user.role === 'manager') {
      // Additional check needed - we'll let it pass for now and handle in controllers
      return next();
    }

    // Employees can only access their own resources
    if (req.user.role === 'employee') {
      if (parseInt(userId) !== req.user.id) {
        return next(new AppError('Access denied. You can only access your own resources.', 403));
      }
    }

    next();
  };
};

// Middleware to check if user can modify employee data
export const canModifyEmployee = catchAsync(async (req, res, next) => {
  const targetEmployeeId = parseInt(req.params.id);
  
  // Super admin and admin can modify anyone
  if (['super_admin', 'admin'].includes(req.user.role)) {
    return next();
  }

  // HR can modify most employees
  if (req.user.role === 'hr') {
    return next();
  }

  // Managers can modify their direct reports
  if (req.user.role === 'manager') {
    const targetEmployee = await db
      .select({ managerId: usersTable.managerId })
      .from(usersTable)
      .where(eq(usersTable.id, targetEmployeeId))
      .limit(1);

    if (targetEmployee.length === 0) {
      return next(new AppError('Employee not found', 404));
    }

    if (targetEmployee[0].managerId === req.user.id) {
      return next();
    }
  }

  // Employees can only modify themselves (limited fields)
  if (req.user.role === 'employee' && targetEmployeeId === req.user.id) {
    // Restrict fields that employees can modify
    const allowedFields = ['phone', 'address', 'emergencyContact', 'profileImage'];
    const requestedFields = Object.keys(req.body);
    
    const invalidFields = requestedFields.filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      return next(new AppError(`You are not allowed to modify these fields: ${invalidFields.join(', ')}`, 403));
    }
    
    return next();
  }

  return next(new AppError('Access denied. Insufficient privileges to modify this employee.', 403));
});

// Middleware to validate department access
export const validateDepartmentAccess = catchAsync(async (req, res, next) => {
  const departmentId = req.params.departmentId || req.body.departmentId;
  
  if (!departmentId) {
    return next();
  }

  // Super admin and admin have access to all departments
  if (['super_admin', 'admin', 'hr'].includes(req.user.role)) {
    return next();
  }

  // Managers and employees can only access their own department
  if (parseInt(departmentId) !== req.user.departmentId) {
    return next(new AppError('Access denied. You can only access your own department.', 403));
  }

  next();
});

// Role hierarchy for permissions
export const ROLE_HIERARCHY = {
  'super_admin': 5,
  'admin': 4,
  'hr': 3,
  'manager': 2,
  'employee': 1
};

// Check if user has higher or equal role level
export const hasMinimumRole = (minimumRole) => {
  return (req, res, next) => {
    const userRoleLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const minimumRoleLevel = ROLE_HIERARCHY[minimumRole] || 0;

    if (userRoleLevel < minimumRoleLevel) {
      return next(new AppError('Access denied. Insufficient role level.', 403));
    }

    next();
  };
};
