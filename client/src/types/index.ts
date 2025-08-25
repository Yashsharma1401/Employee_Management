// User and Employee types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employeeId: string;
  role: 'super_admin' | 'admin' | 'hr' | 'manager' | 'employee';
  department: Department;
  designation: string;
  joiningDate: string;
  salary: {
    basic: number;
    allowances: number;
    deductions: number;
  };
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  manager?: User;
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  profileImage: string;
  leaveBalance: {
    annual: number;
    sick: number;
    personal: number;
  };
  lastLogin?: string;
  fullName: string;
  totalSalary: number;
  createdAt: string;
  updatedAt: string;
}

// Department type
export interface Department {
  _id: string;
  name: string;
  description?: string;
  head?: User;
  budget: number;
  location?: string;
  isActive: boolean;
  establishedDate: string;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Attendance type
export interface Attendance {
  _id: string;
  employee: User;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakTime: number;
  totalHours: number;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'work_from_home';
  notes?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  isManualEntry: boolean;
  approvedBy?: User;
  approvalDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Leave type
export interface Leave {
  _id: string;
  employee: User;
  leaveType: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'emergency' | 'unpaid';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedDate: string;
  approvedBy?: User;
  approvalDate?: string;
  rejectionReason?: string;
  documents?: Array<{
    name: string;
    url: string;
    uploadDate: string;
  }>;
  isEmergency: boolean;
  handoverNotes?: string;
  contactDuringLeave?: {
    phone: string;
    email: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Payroll type
export interface Payroll {
  _id: string;
  employee: User;
  payPeriod: {
    month: number;
    year: number;
  };
  basicSalary: number;
  allowances: {
    hra: number;
    transport: number;
    medical: number;
    food: number;
    bonus: number;
    overtime: number;
    other: number;
  };
  deductions: {
    tax: number;
    providentFund: number;
    insurance: number;
    loan: number;
    advance: number;
    other: number;
  };
  workingDays: number;
  presentDays: number;
  absentDays: number;
  overtimeHours: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed';
  paymentDate?: string;
  paymentMethod: 'bank_transfer' | 'cash' | 'cheque';
  transactionId?: string;
  approvedBy?: User;
  approvalDate?: string;
  notes?: string;
  payslipGenerated: boolean;
  payslipUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Performance type
export interface Performance {
  _id: string;
  employee: User;
  reviewer: User;
  reviewPeriod: {
    startDate: string;
    endDate: string;
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Annual' | 'Mid-Year';
    year: number;
  };
  goals: Array<{
    title: string;
    description: string;
    weight: number;
    targetValue: string;
    achievedValue: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'exceeded' | 'not_achieved';
    score: number;
  }>;
  competencies: {
    technicalSkills: number;
    communication: number;
    teamwork: number;
    leadership: number;
    problemSolving: number;
    initiative: number;
    punctuality: number;
    qualityOfWork: number;
  };
  overallRating: number;
  performanceLevel: 'outstanding' | 'exceeds_expectations' | 'meets_expectations' | 'below_expectations' | 'unsatisfactory';
  achievements?: string;
  areasForImprovement?: string;
  reviewerComments?: string;
  employeeComments?: string;
  developmentPlan: Array<{
    area: string;
    action: string;
    timeline: string;
    support?: string;
  }>;
  status: 'draft' | 'pending_employee_review' | 'pending_manager_review' | 'completed' | 'approved';
  employeeAcknowledged: boolean;
  employeeAcknowledgedDate?: string;
  managerApproved: boolean;
  managerApprovedDate?: string;
  hrApproved: boolean;
  hrApprovedBy?: User;
  hrApprovedDate?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  status: 'success';
  results: number;
  data: {
    [key: string]: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total?: number;
      totalEmployees?: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  department: string;
  designation: string;
  salary: {
    basic: number;
    allowances?: number;
    deductions?: number;
  };
  role?: string;
  joiningDate?: string;
  manager?: string;
}

// Dashboard types
export interface DashboardStats {
  todayAttendance?: Attendance;
  monthlyAttendance: {
    totalDays: number;
    totalHours: number;
    presentDays: number;
  };
  pendingLeaves: number;
  recentPayslip?: Payroll;
  leaveBalance: {
    annual: number;
    sick: number;
    personal: number;
  };
}

export interface AdminDashboardStats {
  employeeStats: Array<{
    _id: string;
    count: number;
  }>;
  departmentStats: Array<{
    _id: string;
    count: number;
  }>;
  todayAttendanceOverview: Array<{
    _id: string;
    count: number;
  }>;
  pendingLeaveRequests: number;
  payrollSummary: {
    totalEmployees: number;
    totalGross: number;
    totalNet: number;
    paid: number;
  };
  recentReviews: Performance[];
}

// Form types
export interface FormErrors {
  [key: string]: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
}
