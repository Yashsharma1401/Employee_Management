import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  // Professional Information
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    uppercase: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['super_admin', 'admin', 'hr', 'manager', 'employee'],
      message: 'Role must be one of: super_admin, admin, hr, manager, employee'
    },
    default: 'employee'
  },
  department: {
    type: mongoose.Schema.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true
  },
  joiningDate: {
    type: Date,
    required: [true, 'Joining date is required'],
    default: Date.now
  },
  
  // Salary Information
  salary: {
    basic: {
      type: Number,
      required: [true, 'Basic salary is required'],
      min: [0, 'Salary cannot be negative']
    },
    allowances: {
      type: Number,
      default: 0,
      min: [0, 'Allowances cannot be negative']
    },
    deductions: {
      type: Number,
      default: 0,
      min: [0, 'Deductions cannot be negative']
    }
  },
  
  // Employment Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated', 'on_leave'],
    default: 'active'
  },
  
  // Manager Information
  manager: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  
  // Personal Details
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  
  // Documents
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Profile Image
  profileImage: {
    type: String,
    default: 'default-profile.jpg'
  },
  
  // Leave Balance
  leaveBalance: {
    annual: {
      type: Number,
      default: 21
    },
    sick: {
      type: Number,
      default: 10
    },
    personal: {
      type: Number,
      default: 5
    }
  },
  
  // Last Login
  lastLogin: {
    type: Date
  },
  
  // Password Reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Account Settings
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for total salary
userSchema.virtual('totalSalary').get(function() {
  return this.salary.basic + this.salary.allowances - this.salary.deductions;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate Employee ID
userSchema.pre('save', async function(next) {
  if (!this.isNew || this.employeeId) return next();
  
  const year = new Date().getFullYear();
  const count = await this.constructor.countDocuments();
  this.employeeId = `EMP${year}${String(count + 1).padStart(4, '0')}`;
  next();
});

export default mongoose.model('User', userSchema);
