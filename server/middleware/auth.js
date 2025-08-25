import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const currentUser = await User.findById(decoded.id).select('-password');

    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'Token invalid, user not found'
      });
    }

    // Check if user is active
    if (currentUser.status !== 'active') {
      return res.status(401).json({
        status: 'error',
        message: 'User account is not active'
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token invalid'
    });
  }
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user can access employee data (self or authorized roles)
export const canAccessEmployee = async (req, res, next) => {
  try {
    const employeeId = req.params.id || req.body.employee || req.params.employeeId;
    
    // Super admin and admin can access any employee
    if (['super_admin', 'admin', 'hr'].includes(req.user.role)) {
      return next();
    }

    // Managers can access their team members
    if (req.user.role === 'manager') {
      const employee = await User.findById(employeeId);
      if (employee && employee.manager && employee.manager.toString() === req.user._id.toString()) {
        return next();
      }
    }

    // Users can only access their own data
    if (employeeId === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({
      status: 'error',
      message: 'Access denied. You can only access your own data.'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error in authorization check'
    });
  }
};

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};
