import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required']
  },
  payPeriod: {
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: [1, 'Month must be between 1-12'],
      max: [12, 'Month must be between 1-12']
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [2020, 'Year must be 2020 or later']
    }
  },
  
  // Salary Components
  basicSalary: {
    type: Number,
    required: [true, 'Basic salary is required'],
    min: [0, 'Basic salary cannot be negative']
  },
  allowances: {
    hra: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    overtime: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  deductions: {
    tax: { type: Number, default: 0 },
    providentFund: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    loan: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  
  // Attendance Details
  workingDays: {
    type: Number,
    required: [true, 'Working days is required'],
    min: [0, 'Working days cannot be negative']
  },
  presentDays: {
    type: Number,
    required: [true, 'Present days is required'],
    min: [0, 'Present days cannot be negative']
  },
  absentDays: {
    type: Number,
    default: 0,
    min: [0, 'Absent days cannot be negative']
  },
  overtimeHours: {
    type: Number,
    default: 0,
    min: [0, 'Overtime hours cannot be negative']
  },
  
  // Calculated Fields
  grossSalary: {
    type: Number,
    default: 0
  },
  totalDeductions: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    default: 0
  },
  
  // Payment Details
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'cheque'],
    default: 'bank_transfer'
  },
  transactionId: {
    type: String
  },
  
  // Approval
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  
  // Notes
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  
  // Documents
  payslipGenerated: {
    type: Boolean,
    default: false
  },
  payslipUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate totals before saving
payrollSchema.pre('save', function(next) {
  // Calculate gross salary
  const totalAllowances = Object.values(this.allowances).reduce((sum, val) => sum + (val || 0), 0);
  this.grossSalary = this.basicSalary + totalAllowances;
  
  // Calculate total deductions
  this.totalDeductions = Object.values(this.deductions).reduce((sum, val) => sum + (val || 0), 0);
  
  // Calculate net salary
  this.netSalary = this.grossSalary - this.totalDeductions;
  
  // Calculate absent days
  this.absentDays = this.workingDays - this.presentDays;
  
  next();
});

// Compound index for employee and pay period
payrollSchema.index({ employee: 1, 'payPeriod.month': 1, 'payPeriod.year': 1 }, { unique: true });

export default mongoose.model('Payroll', payrollSchema);
