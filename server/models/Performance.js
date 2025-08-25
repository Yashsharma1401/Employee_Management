import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required']
  },
  reviewer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer is required']
  },
  
  // Review Period
  reviewPeriod: {
    startDate: {
      type: Date,
      required: [true, 'Review start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'Review end date is required']
    },
    quarter: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4', 'Annual', 'Mid-Year'],
      required: [true, 'Review period is required']
    },
    year: {
      type: Number,
      required: [true, 'Review year is required']
    }
  },
  
  // Performance Metrics
  goals: [{
    title: {
      type: String,
      required: [true, 'Goal title is required']
    },
    description: {
      type: String,
      required: [true, 'Goal description is required']
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative'],
      max: [100, 'Weight cannot exceed 100']
    },
    targetValue: {
      type: String
    },
    achievedValue: {
      type: String
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'exceeded', 'not_achieved'],
      default: 'not_started'
    },
    score: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [5, 'Score cannot exceed 5']
    }
  }],
  
  // Competencies Rating
  competencies: {
    technicalSkills: {
      type: Number,
      min: [1, 'Rating must be between 1-5'],
      max: [5, 'Rating must be between 1-5']
    },
    communication: {
      type: Number,
      min: [1, 'Rating must be between 1-5'],
      max: [5, 'Rating must be between 1-5']
    },
    teamwork: {
      type: Number,
      min: [1, 'Rating must be between 1-5'],
      max: [5, 'Rating must be between 1-5']
    },
    leadership: {
      type: Number,
      min: [1, 'Rating must be between 1-5'],
      max: [5, 'Rating must be between 1-5']
    },
    problemSolving: {
      type: Number,
      min: [1, 'Rating must be between 1-5'],
      max: [5, 'Rating must be between 1-5']
    },
    initiative: {
      type: Number,
      min: [1, 'Rating must be between 1-5'],
      max: [5, 'Rating must be between 1-5']
    },
    punctuality: {
      type: Number,
      min: [1, 'Rating must be between 1-5'],
      max: [5, 'Rating must be between 1-5']
    },
    qualityOfWork: {
      type: Number,
      min: [1, 'Rating must be between 1-5'],
      max: [5, 'Rating must be between 1-5']
    }
  },
  
  // Overall Performance
  overallRating: {
    type: Number,
    min: [1, 'Overall rating must be between 1-5'],
    max: [5, 'Overall rating must be between 1-5']
  },
  performanceLevel: {
    type: String,
    enum: ['outstanding', 'exceeds_expectations', 'meets_expectations', 'below_expectations', 'unsatisfactory'],
    default: 'meets_expectations'
  },
  
  // Feedback
  achievements: {
    type: String,
    maxlength: [1000, 'Achievements cannot be more than 1000 characters']
  },
  areasForImprovement: {
    type: String,
    maxlength: [1000, 'Areas for improvement cannot be more than 1000 characters']
  },
  reviewerComments: {
    type: String,
    maxlength: [1000, 'Reviewer comments cannot be more than 1000 characters']
  },
  employeeComments: {
    type: String,
    maxlength: [1000, 'Employee comments cannot be more than 1000 characters']
  },
  
  // Development Plan
  developmentPlan: [{
    area: {
      type: String,
      required: [true, 'Development area is required']
    },
    action: {
      type: String,
      required: [true, 'Development action is required']
    },
    timeline: {
      type: String,
      required: [true, 'Timeline is required']
    },
    support: {
      type: String
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'pending_employee_review', 'pending_manager_review', 'completed', 'approved'],
    default: 'draft'
  },
  
  // Signatures/Approval
  employeeAcknowledged: {
    type: Boolean,
    default: false
  },
  employeeAcknowledgedDate: {
    type: Date
  },
  managerApproved: {
    type: Boolean,
    default: false
  },
  managerApprovedDate: {
    type: Date
  },
  hrApproved: {
    type: Boolean,
    default: false
  },
  hrApprovedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  hrApprovedDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Calculate overall rating before saving
performanceSchema.pre('save', function(next) {
  if (this.competencies) {
    const competencyValues = Object.values(this.competencies).filter(val => val != null);
    if (competencyValues.length > 0) {
      const averageCompetency = competencyValues.reduce((sum, val) => sum + val, 0) / competencyValues.length;
      
      // Calculate goal achievement percentage
      const completedGoals = this.goals.filter(goal => goal.status === 'completed' || goal.status === 'exceeded');
      const goalAchievementRate = this.goals.length > 0 ? (completedGoals.length / this.goals.length) * 5 : 0;
      
      // Weighted average: 70% competencies, 30% goal achievement
      this.overallRating = Number(((averageCompetency * 0.7) + (goalAchievementRate * 0.3)).toFixed(2));
      
      // Set performance level based on overall rating
      if (this.overallRating >= 4.5) {
        this.performanceLevel = 'outstanding';
      } else if (this.overallRating >= 3.5) {
        this.performanceLevel = 'exceeds_expectations';
      } else if (this.overallRating >= 2.5) {
        this.performanceLevel = 'meets_expectations';
      } else if (this.overallRating >= 1.5) {
        this.performanceLevel = 'below_expectations';
      } else {
        this.performanceLevel = 'unsatisfactory';
      }
    }
  }
  next();
});

// Compound index for employee and review period
performanceSchema.index({ 
  employee: 1, 
  'reviewPeriod.quarter': 1, 
  'reviewPeriod.year': 1 
}, { unique: true });

export default mongoose.model('Performance', performanceSchema);
