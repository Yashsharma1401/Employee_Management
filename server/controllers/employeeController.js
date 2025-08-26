import { db } from '../config/database.js';
import { usersTable, departmentsTable, attendanceTable, leaveTable, payrollTable } from '../schema.js';
import { eq, and, or, sql, desc, asc, like, ilike, count, inArray } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

// Get all employees
export const getAllEmployees = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search,
    department,
    role,
    status = 'active',
    sortBy = 'firstName',
    sortOrder = 'asc'
  } = req.query;

  // Build base query conditions
  let conditions = [eq(usersTable.status, status)];

  // Add search functionality
  if (search) {
    conditions.push(
      or(
        ilike(usersTable.firstName, `%${search}%`),
        ilike(usersTable.lastName, `%${search}%`),
        ilike(usersTable.email, `%${search}%`),
        ilike(usersTable.employeeId, `%${search}%`),
        ilike(usersTable.designation, `%${search}%`)
      )
    );
  }

  if (department) {
    conditions.push(eq(usersTable.departmentId, parseInt(department)));
  }

  if (role) {
    conditions.push(eq(usersTable.role, role));
  }

  // Calculate pagination
  const offset = (page - 1) * limit;

  // Get total count
  const totalCount = await db
    .select({ count: count() })
    .from(usersTable)
    .where(and(...conditions));

  const total = totalCount[0].count;

  // Build sort order
  const sortColumn = usersTable[sortBy] || usersTable.firstName;
  const orderBy = sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);

  // Get employees with department and manager info
  const employees = await db
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
      joiningDate: usersTable.joiningDate,
      basicSalary: usersTable.basicSalary,
      allowances: usersTable.allowances,
      deductions: usersTable.deductions,
      departmentId: usersTable.departmentId,
      managerId: usersTable.managerId,
      profileImage: usersTable.profileImage,
      leaveBalance: usersTable.leaveBalance,
      createdAt: usersTable.createdAt,
      departmentName: departmentsTable.name,
      managerFirstName: sql`manager.first_name`,
      managerLastName: sql`manager.last_name`
    })
    .from(usersTable)
    .leftJoin(departmentsTable, eq(usersTable.departmentId, departmentsTable.id))
    .leftJoin(sql`${usersTable} as manager`, sql`${usersTable.managerId} = manager.id`)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(parseInt(limit))
    .offset(offset);

  res.status(200).json({
    status: 'success',
    results: employees.length,
    data: {
      employees: employees.map(emp => ({
        ...emp,
        department: { name: emp.departmentName },
        manager: emp.managerFirstName ? {
          firstName: emp.managerFirstName,
          lastName: emp.managerLastName
        } : null
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalEmployees: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

// Get single employee
export const getEmployee = catchAsync(async (req, res, next) => {
  const employees = await db
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
      joiningDate: usersTable.joiningDate,
      dateOfBirth: usersTable.dateOfBirth,
      address: usersTable.address,
      emergencyContact: usersTable.emergencyContact,
      basicSalary: usersTable.basicSalary,
      allowances: usersTable.allowances,
      deductions: usersTable.deductions,
      departmentId: usersTable.departmentId,
      managerId: usersTable.managerId,
      profileImage: usersTable.profileImage,
      leaveBalance: usersTable.leaveBalance,
      documents: usersTable.documents,
      lastLogin: usersTable.lastLogin,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
      departmentName: departmentsTable.name,
      departmentDescription: departmentsTable.description,
      departmentHeadId: departmentsTable.headId,
      managerFirstName: sql`manager.first_name`,
      managerLastName: sql`manager.last_name`,
      managerEmail: sql`manager.email`,
      managerDesignation: sql`manager.designation`
    })
    .from(usersTable)
    .leftJoin(departmentsTable, eq(usersTable.departmentId, departmentsTable.id))
    .leftJoin(sql`${usersTable} as manager`, sql`${usersTable.managerId} = manager.id`)
    .where(eq(usersTable.id, parseInt(req.params.id)))
    .limit(1);

  if (employees.length === 0) {
    return next(new AppError('Employee not found', 404));
  }

  const employee = employees[0];

  res.status(200).json({
    status: 'success',
    data: {
      employee: {
        ...employee,
        department: {
          name: employee.departmentName,
          description: employee.departmentDescription,
          head: employee.departmentHeadId
        },
        manager: employee.managerFirstName ? {
          firstName: employee.managerFirstName,
          lastName: employee.managerLastName,
          email: employee.managerEmail,
          designation: employee.managerDesignation
        } : null
      }
    }
  });
});

// Create new employee
export const createEmployee = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password = 'Welcome@123',
    departmentId,
    designation,
    basicSalary,
    allowances = 0,
    deductions = 0,
    role = 'employee',
    status = 'active',
    joiningDate,
    managerId,
    dateOfBirth,
    address,
    emergencyContact
  } = req.body;

  // Check if department exists
  if (departmentId) {
    const departmentExists = await db
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.id, departmentId))
      .limit(1);

    if (departmentExists.length === 0) {
      return next(new AppError('Department not found', 400));
    }
  }

  // Check if manager exists (if provided)
  if (managerId) {
    const managerExists = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, managerId))
      .limit(1);

    if (managerExists.length === 0) {
      return next(new AppError('Manager not found', 400));
    }
  }

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(usersTable)
    .where(or(eq(usersTable.email, email), eq(usersTable.phone, phone)))
    .limit(1);

  if (existingUser.length > 0) {
    return next(new AppError('User with this email or phone already exists', 400));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

  // Generate employee ID
  const userCount = await db
    .select({ count: count() })
    .from(usersTable);
  
  const year = new Date().getFullYear();
  const employeeId = `EMP${year}${String(Number(userCount[0].count) + 1).padStart(4, '0')}`;

  // Create employee
  const newEmployee = await db
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
      status,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      managerId,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      address,
      emergencyContact
    })
    .returning();

  const employee = newEmployee[0];
  
  // Remove password from response
  delete employee.password;

  res.status(201).json({
    status: 'success',
    message: 'Employee created successfully',
    data: {
      employee
    }
  });
});

// Update employee
export const updateEmployee = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Fields that can be updated
  const allowedFields = [
    'firstName', 'lastName', 'phone', 'departmentId', 'designation',
    'basicSalary', 'allowances', 'deductions', 'role', 'status', 'managerId', 
    'address', 'emergencyContact', 'dateOfBirth', 'leaveBalance'
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

  // Validate department if being updated
  if (updateData.departmentId) {
    const departmentExists = await db
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.id, updateData.departmentId))
      .limit(1);

    if (departmentExists.length === 0) {
      return next(new AppError('Department not found', 400));
    }
  }

  // Validate manager if being updated
  if (updateData.managerId) {
    const managerExists = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, updateData.managerId))
      .limit(1);

    if (managerExists.length === 0) {
      return next(new AppError('Manager not found', 400));
    }
  }

  // Convert date strings to Date objects if present
  if (updateData.dateOfBirth) {
    updateData.dateOfBirth = new Date(updateData.dateOfBirth);
  }

  // Add updatedAt timestamp
  updateData.updatedAt = new Date();

  const updatedEmployees = await db
    .update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, parseInt(id)))
    .returning();

  if (updatedEmployees.length === 0) {
    return next(new AppError('Employee not found', 404));
  }

  // Get updated employee with relations
  const employees = await db
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
      joiningDate: usersTable.joiningDate,
      basicSalary: usersTable.basicSalary,
      allowances: usersTable.allowances,
      deductions: usersTable.deductions,
      departmentId: usersTable.departmentId,
      managerId: usersTable.managerId,
      departmentName: departmentsTable.name,
      managerFirstName: sql`manager.first_name`,
      managerLastName: sql`manager.last_name`
    })
    .from(usersTable)
    .leftJoin(departmentsTable, eq(usersTable.departmentId, departmentsTable.id))
    .leftJoin(sql`${usersTable} as manager`, sql`${usersTable.managerId} = manager.id`)
    .where(eq(usersTable.id, parseInt(id)))
    .limit(1);

  const employee = employees[0];

  res.status(200).json({
    status: 'success',
    message: 'Employee updated successfully',
    data: {
      employee: {
        ...employee,
        department: { name: employee.departmentName },
        manager: employee.managerFirstName ? {
          firstName: employee.managerFirstName,
          lastName: employee.managerLastName
        } : null
      }
    }
  });
});

// Delete employee (soft delete)
export const deleteEmployee = catchAsync(async (req, res, next) => {
  const updatedEmployees = await db
    .update(usersTable)
    .set({ 
      status: 'terminated',
      updatedAt: new Date()
    })
    .where(eq(usersTable.id, parseInt(req.params.id)))
    .returning();

  if (updatedEmployees.length === 0) {
    return next(new AppError('Employee not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Employee terminated successfully'
  });
});

// Get employee dashboard stats
export const getEmployeeDashboard = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const employeeId = parseInt(id);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Get employee details
  const employees = await db
    .select({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
      employeeId: usersTable.employeeId,
      role: usersTable.role,
      designation: usersTable.designation,
      status: usersTable.status,
      departmentName: departmentsTable.name
    })
    .from(usersTable)
    .leftJoin(departmentsTable, eq(usersTable.departmentId, departmentsTable.id))
    .where(eq(usersTable.id, employeeId))
    .limit(1);

  if (employees.length === 0) {
    return next(new AppError('Employee not found', 404));
  }

  const employee = employees[0];

  // Get attendance summary for current month
  const attendanceSummary = await db
    .select({
      totalDays: sql`COUNT(*)::int`,
      totalHours: sql`COALESCE(SUM(total_hours), 0)::numeric`,
      presentDays: sql`COUNT(CASE WHEN status = 'present' THEN 1 END)::int`,
      lateDays: sql`COUNT(CASE WHEN status = 'late' THEN 1 END)::int`
    })
    .from(attendanceTable)
    .where(
      and(
        eq(attendanceTable.employeeId, employeeId),
        sql`EXTRACT(MONTH FROM date) = ${currentMonth}`,
        sql`EXTRACT(YEAR FROM date) = ${currentYear}`
      )
    );

  // Get recent leave requests
  const recentLeaves = await db
    .select({
      id: leaveTable.id,
      leaveType: leaveTable.leaveType,
      startDate: leaveTable.startDate,
      endDate: leaveTable.endDate,
      status: leaveTable.status,
      totalDays: leaveTable.totalDays
    })
    .from(leaveTable)
    .where(eq(leaveTable.employeeId, employeeId))
    .orderBy(desc(leaveTable.appliedDate))
    .limit(5);

  // Get latest payroll
  const latestPayroll = await db
    .select()
    .from(payrollTable)
    .where(eq(payrollTable.employeeId, employeeId))
    .orderBy(desc(payrollTable.endDate))
    .limit(1);

  res.status(200).json({
    status: 'success',
    data: {
      employee: {
        ...employee,
        department: { name: employee.departmentName }
      },
      attendance: attendanceSummary[0] || {
        totalDays: 0,
        totalHours: 0,
        presentDays: 0,
        lateDays: 0
      },
      recentLeaves,
      latestPayroll: latestPayroll[0] || null
    }
  });
});

// Get team members (for managers)
export const getTeamMembers = catchAsync(async (req, res, next) => {
  const managerId = req.user.id;

  const teamMembers = await db
    .select({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
      employeeId: usersTable.employeeId,
      role: usersTable.role,
      designation: usersTable.designation,
      status: usersTable.status,
      joiningDate: usersTable.joiningDate,
      departmentName: departmentsTable.name
    })
    .from(usersTable)
    .leftJoin(departmentsTable, eq(usersTable.departmentId, departmentsTable.id))
    .where(
      and(
        eq(usersTable.managerId, managerId),
        eq(usersTable.status, 'active')
      )
    )
    .orderBy(asc(usersTable.firstName));

  res.status(200).json({
    status: 'success',
    results: teamMembers.length,
    data: {
      teamMembers: teamMembers.map(member => ({
        ...member,
        department: { name: member.departmentName }
      }))
    }
  });
});

// Bulk update employees
export const bulkUpdateEmployees = catchAsync(async (req, res, next) => {
  const { employeeIds, updateData } = req.body;

  if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
    return next(new AppError('Please provide employee IDs', 400));
  }

  const allowedFields = ['status', 'departmentId', 'basicSalary', 'role'];
  const filteredUpdateData = {};

  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredUpdateData[key] = updateData[key];
    }
  });

  if (Object.keys(filteredUpdateData).length === 0) {
    return next(new AppError('No valid fields to update', 400));
  }

  // Add updatedAt timestamp
  filteredUpdateData.updatedAt = new Date();

  const result = await db
    .update(usersTable)
    .set(filteredUpdateData)
    .where(inArray(usersTable.id, employeeIds.map(id => parseInt(id))))
    .returning({ id: usersTable.id });

  res.status(200).json({
    status: 'success',
    message: `${result.length} employees updated successfully`,
    data: {
      modifiedCount: result.length
    }
  });
});
