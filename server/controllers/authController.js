import { db } from '../config/database.js';
import { usersTable, departmentsTable, attendanceTable, leaveTable, performanceTable } from '../schema/index.js';
import { eq, and, or, sql, desc, gte, lte } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

// Register new user
export const register = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    departmentId,
    designation,
    basicSalary,
    allowances = 0,
    deductions = 0,
    role = 'employee',
    joiningDate,
    managerId
  } = req.body;

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(usersTable)
    .where(or(eq(usersTable.email, email), eq(usersTable.phone, phone)))
    .limit(1);

  if (existingUser.length > 0) {
    return next(new AppError('User with this email or phone already exists', 400));
  }

  // Check if department exists
  const departmentExists = await db
    .select()
    .from(departmentsTable)
    .where(eq(departmentsTable.id, departmentId))
    .limit(1);

  if (departmentExists.length === 0) {
    return next(new AppError('Department not found', 400));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

  // Generate employee ID
  const userCount = await db
    .select({ count: sql`count(*)` })
    .from(usersTable);
  
  const year = new Date().getFullYear();
  const employeeId = `EMP${year}${String(Number(userCount[0].count) + 1).padStart(4, '0')}`;

  // Create new user
  const newUser = await db
    .insert(usersTable)
    .values({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      employeeId,
      departmentId,
      designation,
      basicSalary,
      allowances,
      deductions,
      role,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      managerId
    })
    .returning();

  const user = newUser[0];
  
  // Remove password from output
  delete user.password;

  // Generate token
  const token = generateToken(user.id);

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    token,
    data: {
      user
    }
  });
});

// Login user
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email and include password
  const users = await db
    .select({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
      phone: usersTable.phone,
      password: usersTable.password,
      employeeId: usersTable.employeeId,
      role: usersTable.role,
      designation: usersTable.designation,
      status: usersTable.status,
      departmentId: usersTable.departmentId,
      managerId: usersTable.managerId,
      joiningDate: usersTable.joiningDate,
      lastLogin: usersTable.lastLogin,
      leaveBalance: usersTable.leaveBalance,
      departmentName: departmentsTable.name
    })
    .from(usersTable)
    .leftJoin(departmentsTable, eq(usersTable.departmentId, departmentsTable.id))
    .where(eq(usersTable.email, email))
    .limit(1);

  if (users.length === 0) {
    return next(new AppError('Invalid email or password', 401));
  }

  const user = users[0];

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check if user is active
  if (user.status !== 'active') {
    return next(new AppError('Your account is not active. Please contact administrator.', 401));
  }

  // Update last login
  await db
    .update(usersTable)
    .set({ lastLogin: new Date() })
    .where(eq(usersTable.id, user.id));

  // Remove password from output
  delete user.password;

  // Generate token
  const token = generateToken(user.id);

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    token,
    data: {
      user: {
        ...user,
        department: { name: user.departmentName }
      }
    }
  });
});

// Get current user profile
export const getMe = catchAsync(async (req, res, next) => {
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
      dateOfBirth: usersTable.dateOfBirth,
      address: usersTable.address,
      emergencyContact: usersTable.emergencyContact,
      profileImage: usersTable.profileImage,
      leaveBalance: usersTable.leaveBalance,
      lastLogin: usersTable.lastLogin,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
      departmentName: departmentsTable.name,
      departmentDescription: departmentsTable.description,
      managerFirstName: sql`manager.first_name`,
      managerLastName: sql`manager.last_name`,
      managerEmail: sql`manager.email`,
      managerDesignation: sql`manager.designation`
    })
    .from(usersTable)
    .leftJoin(departmentsTable, eq(usersTable.departmentId, departmentsTable.id))
    .leftJoin(sql`${usersTable} as manager`, sql`${usersTable.managerId} = manager.id`)
    .where(eq(usersTable.id, req.user.id))
    .limit(1);

  if (users.length === 0) {
    return next(new AppError('User not found', 404));
  }

  const user = users[0];

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        ...user,
        department: {
          name: user.departmentName,
          description: user.departmentDescription
        },
        manager: user.managerFirstName ? {
          firstName: user.managerFirstName,
          lastName: user.managerLastName,
          email: user.managerEmail,
          designation: user.managerDesignation
        } : null
      }
    }
  });
});

// Update current user profile
export const updateMe = catchAsync(async (req, res, next) => {
  // Fields that user can update themselves
  const allowedFields = [
    'phone',
    'address',
    'emergencyContact',
    'profileImage'
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

  // Add updatedAt timestamp
  updateData.updatedAt = new Date();

  const updatedUsers = await db
    .update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, req.user.id))
    .returning();

  if (updatedUsers.length === 0) {
    return next(new AppError('User not found', 404));
  }

  // Get user with department info
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
      address: usersTable.address,
      emergencyContact: usersTable.emergencyContact,
      profileImage: usersTable.profileImage,
      departmentName: departmentsTable.name,
      departmentDescription: departmentsTable.description
    })
    .from(usersTable)
    .leftJoin(departmentsTable, eq(usersTable.departmentId, departmentsTable.id))
    .where(eq(usersTable.id, req.user.id))
    .limit(1);

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user: {
        ...users[0],
        department: {
          name: users[0].departmentName,
          description: users[0].departmentDescription
        }
      }
    }
  });
});

// Change password
export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const users = await db
    .select({
      id: usersTable.id,
      password: usersTable.password
    })
    .from(usersTable)
    .where(eq(usersTable.id, req.user.id))
    .limit(1);

  if (users.length === 0) {
    return next(new AppError('User not found', 404));
  }

  const user = users[0];

  // Check current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 400));
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);

  // Update password
  await db
    .update(usersTable)
    .set({ 
      password: hashedNewPassword,
      updatedAt: new Date()
    })
    .where(eq(usersTable.id, req.user.id));

  // Generate new token
  const token = generateToken(user.id);

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
    token
  });
});

// Logout (client-side token removal)
export const logout = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// Get user stats (for dashboard)
export const getUserStats = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Get attendance stats for current month
  const attendanceStats = await db
    .select({
      totalDays: sql`COUNT(*)::int`,
      presentDays: sql`COUNT(CASE WHEN status = 'present' THEN 1 END)::int`,
      totalHours: sql`COALESCE(SUM(total_hours), 0)::numeric`
    })
    .from(attendanceTable)
    .where(
      and(
        eq(attendanceTable.employeeId, userId),
        sql`EXTRACT(MONTH FROM date) = ${currentMonth}`,
        sql`EXTRACT(YEAR FROM date) = ${currentYear}`
      )
    );

  // Get leave stats
  const leaveStats = await db
    .select({
      leaveType: leaveTable.leaveType,
      totalDays: sql`SUM(total_days)::numeric`
    })
    .from(leaveTable)
    .where(
      and(
        eq(leaveTable.employeeId, userId),
        or(
          eq(leaveTable.status, 'approved'),
          eq(leaveTable.status, 'pending')
        )
      )
    )
    .groupBy(leaveTable.leaveType);

  // Get latest performance review
  const latestPerformance = await db
    .select()
    .from(performanceTable)
    .where(eq(performanceTable.employeeId, userId))
    .orderBy(desc(performanceTable.endDate))
    .limit(1);

  // Get user's leave balance
  const userLeaveBalance = await db
    .select({ leaveBalance: usersTable.leaveBalance })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  res.status(200).json({
    status: 'success',
    data: {
      attendance: attendanceStats[0] || { totalDays: 0, presentDays: 0, totalHours: 0 },
      leaveBalance: userLeaveBalance[0]?.leaveBalance || { annual: 21, sick: 10, personal: 5 },
      usedLeave: leaveStats,
      latestPerformance: latestPerformance[0] || null
    }
  });
});
