import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  next();
};

// User registration validation
export const validateRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('department')
    .isMongoId()
    .withMessage('Please provide a valid department'),
  
  body('designation')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Designation must be between 2 and 100 characters'),
  
  body('salary.basic')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Basic salary must be a positive number'),
  
  handleValidationErrors
];

// User login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Leave request validation
export const validateLeaveRequest = [
  body('leaveType')
    .isIn(['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency', 'unpaid'])
    .withMessage('Invalid leave type'),
  
  body('startDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid start date'),
  
  body('endDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid end date'),
  
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  
  handleValidationErrors
];

// Attendance validation
export const validateAttendance = [
  body('clockIn')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid clock in time'),
  
  body('clockOut')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid clock out time'),
  
  body('breakTime')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Break time must be a positive number'),
  
  handleValidationErrors
];

// Department validation
export const validateDepartment = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  
  body('budget')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),
  
  handleValidationErrors
];

// Payroll validation
export const validatePayroll = [
  body('employee')
    .isMongoId()
    .withMessage('Please provide a valid employee ID'),
  
  body('payPeriod.month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  
  body('payPeriod.year')
    .isInt({ min: 2020 })
    .withMessage('Year must be 2020 or later'),
  
  body('basicSalary')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Basic salary must be a positive number'),
  
  body('workingDays')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Working days must be a positive number'),
  
  body('presentDays')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Present days must be a positive number'),
  
  handleValidationErrors
];
