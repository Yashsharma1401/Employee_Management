import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required']
  },
  leaveType: {
    type: String,
    required: [true, 'Leave type is required'],
    enum: {
      values: ['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency', 'unpaid'],
      message: 'Leave type must be one of: annual, sick, personal, maternity, paternity, emergency, unpaid'
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  totalDays: {
    type: Number,
    required: [true, 'Total days is required'],
    min: [0.5, 'Minimum leave is 0.5 days']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [300, 'Rejection reason cannot be more than 300 characters']
  },
  documents: [{
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  isEmergency: {
    type: Boolean,
    default: false
  },
  handoverNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Handover notes cannot be more than 1000 characters']
  },
  contactDuringLeave: {
    phone: String,
    email: String,
    address: String
  }
}, {
  timestamps: true
});

// Validate end date is after start date
leaveSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  
  // Calculate total days
  const timeDiff = this.endDate.getTime() - this.startDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  
  if (!this.totalDays) {
    this.totalDays = daysDiff;
  }
  
  next();
});

export default mongoose.model('Leave', leaveSchema);
