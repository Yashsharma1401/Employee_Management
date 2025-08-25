import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  clockIn: {
    type: Date,
    required: [true, 'Clock in time is required']
  },
  clockOut: {
    type: Date
  },
  breakTime: {
    type: Number, // in minutes
    default: 0
  },
  totalHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half_day', 'work_from_home'],
    default: 'present'
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot be more than 200 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  isManualEntry: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Calculate total hours before saving
attendanceSchema.pre('save', function(next) {
  if (this.clockIn && this.clockOut) {
    const diffMs = this.clockOut - this.clockIn;
    const totalMinutes = Math.floor(diffMs / 60000) - this.breakTime;
    this.totalHours = Number((totalMinutes / 60).toFixed(2));
  }
  next();
});

// Compound index for employee and date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
