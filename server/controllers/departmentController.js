import { db } from '../config/database.js';
import { departmentsTable, usersTable } from '../schema/index.js';
import { eq, and, or, sql, desc, asc, count } from 'drizzle-orm';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

// Get all departments
export const getAllDepartments = catchAsync(async (req, res, next) => {
  const { includeInactive = false } = req.query;

  let conditions = [];
  if (!includeInactive) {
    conditions.push(eq(departmentsTable.isActive, true));
  }

  const departments = await db
    .select({
      id: departmentsTable.id,
      name: departmentsTable.name,
      description: departmentsTable.description,
      headId: departmentsTable.headId,
      budget: departmentsTable.budget,
      location: departmentsTable.location,
      isActive: departmentsTable.isActive,
      establishedDate: departmentsTable.establishedDate,
      createdAt: departmentsTable.createdAt,
      updatedAt: departmentsTable.updatedAt,
      headFirstName: sql`head.first_name`,
      headLastName: sql`head.last_name`,
      headEmail: sql`head.email`,
      employeeCount: sql`COUNT(employees.id)::int`
    })
    .from(departmentsTable)
    .leftJoin(sql`${usersTable} as head`, sql`${departmentsTable.headId} = head.id`)
    .leftJoin(sql`${usersTable} as employees`, sql`${departmentsTable.id} = employees.department_id AND employees.status = 'active'`)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(
      departmentsTable.id,
      departmentsTable.name,
      departmentsTable.description,
      departmentsTable.headId,
      departmentsTable.budget,
      departmentsTable.location,
      departmentsTable.isActive,
      departmentsTable.establishedDate,
      departmentsTable.createdAt,
      departmentsTable.updatedAt,
      sql`head.first_name`,
      sql`head.last_name`,
      sql`head.email`
    )
    .orderBy(asc(departmentsTable.name));

  res.status(200).json({
    status: 'success',
    results: departments.length,
    data: {
      departments: departments.map(dept => ({
        ...dept,
        head: dept.headFirstName ? {
          id: dept.headId,
          firstName: dept.headFirstName,
          lastName: dept.headLastName,
          email: dept.headEmail
        } : null
      }))
    }
  });
});

// Get single department
export const getDepartment = catchAsync(async (req, res, next) => {
  const departmentId = parseInt(req.params.id);

  const departments = await db
    .select({
      id: departmentsTable.id,
      name: departmentsTable.name,
      description: departmentsTable.description,
      headId: departmentsTable.headId,
      budget: departmentsTable.budget,
      location: departmentsTable.location,
      isActive: departmentsTable.isActive,
      establishedDate: departmentsTable.establishedDate,
      createdAt: departmentsTable.createdAt,
      updatedAt: departmentsTable.updatedAt,
      headFirstName: sql`head.first_name`,
      headLastName: sql`head.last_name`,
      headEmail: sql`head.email`,
      headDesignation: sql`head.designation`
    })
    .from(departmentsTable)
    .leftJoin(sql`${usersTable} as head`, sql`${departmentsTable.headId} = head.id`)
    .where(eq(departmentsTable.id, departmentId))
    .limit(1);

  if (departments.length === 0) {
    return next(new AppError('Department not found', 404));
  }

  const department = departments[0];

  // Get department employees
  const employees = await db
    .select({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
      employeeId: usersTable.employeeId,
      designation: usersTable.designation,
      role: usersTable.role,
      status: usersTable.status,
      joiningDate: usersTable.joiningDate
    })
    .from(usersTable)
    .where(
      and(
        eq(usersTable.departmentId, departmentId),
        eq(usersTable.status, 'active')
      )
    )
    .orderBy(asc(usersTable.firstName));

  res.status(200).json({
    status: 'success',
    data: {
      department: {
        ...department,
        head: department.headFirstName ? {
          id: department.headId,
          firstName: department.headFirstName,
          lastName: department.headLastName,
          email: department.headEmail,
          designation: department.headDesignation
        } : null,
        employees,
        employeeCount: employees.length
      }
    }
  });
});

// Create department
export const createDepartment = catchAsync(async (req, res, next) => {
  const {
    name,
    description,
    headId,
    budget = 0,
    location,
    establishedDate
  } = req.body;

  // Check if department name already exists
  const existingDept = await db
    .select()
    .from(departmentsTable)
    .where(eq(departmentsTable.name, name))
    .limit(1);

  if (existingDept.length > 0) {
    return next(new AppError('Department with this name already exists', 400));
  }

  // Validate head if provided
  if (headId) {
    const head = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, headId))
      .limit(1);

    if (head.length === 0) {
      return next(new AppError('Department head not found', 400));
    }
  }

  const newDepartment = await db
    .insert(departmentsTable)
    .values({
      name,
      description,
      headId,
      budget,
      location,
      establishedDate: establishedDate ? new Date(establishedDate) : new Date()
    })
    .returning();

  res.status(201).json({
    status: 'success',
    message: 'Department created successfully',
    data: {
      department: newDepartment[0]
    }
  });
});

// Update department
export const updateDepartment = catchAsync(async (req, res, next) => {
  const departmentId = parseInt(req.params.id);
  
  const allowedFields = [
    'name', 'description', 'headId', 'budget', 'location', 'isActive'
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

  // Check if new name conflicts with existing department
  if (updateData.name) {
    const existingDept = await db
      .select()
      .from(departmentsTable)
      .where(
        and(
          eq(departmentsTable.name, updateData.name),
          sql`${departmentsTable.id} != ${departmentId}`
        )
      )
      .limit(1);

    if (existingDept.length > 0) {
      return next(new AppError('Department with this name already exists', 400));
    }
  }

  // Validate new head if provided
  if (updateData.headId) {
    const head = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, updateData.headId))
      .limit(1);

    if (head.length === 0) {
      return next(new AppError('Department head not found', 400));
    }
  }

  updateData.updatedAt = new Date();

  const updatedDepartments = await db
    .update(departmentsTable)
    .set(updateData)
    .where(eq(departmentsTable.id, departmentId))
    .returning();

  if (updatedDepartments.length === 0) {
    return next(new AppError('Department not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Department updated successfully',
    data: {
      department: updatedDepartments[0]
    }
  });
});

// Delete department (soft delete)
export const deleteDepartment = catchAsync(async (req, res, next) => {
  const departmentId = parseInt(req.params.id);

  // Check if department has active employees
  const employeeCount = await db
    .select({ count: count() })
    .from(usersTable)
    .where(
      and(
        eq(usersTable.departmentId, departmentId),
        eq(usersTable.status, 'active')
      )
    );

  if (employeeCount[0].count > 0) {
    return next(new AppError('Cannot delete department with active employees. Please reassign employees first.', 400));
  }

  const deletedDepartments = await db
    .update(departmentsTable)
    .set({ 
      isActive: false,
      updatedAt: new Date()
    })
    .where(eq(departmentsTable.id, departmentId))
    .returning();

  if (deletedDepartments.length === 0) {
    return next(new AppError('Department not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Department deactivated successfully'
  });
});

// Get department statistics
export const getDepartmentStats = catchAsync(async (req, res, next) => {
  const departmentId = parseInt(req.params.id);

  // Verify department exists
  const department = await db
    .select()
    .from(departmentsTable)
    .where(eq(departmentsTable.id, departmentId))
    .limit(1);

  if (department.length === 0) {
    return next(new AppError('Department not found', 404));
  }

  // Get employee statistics
  const employeeStats = await db
    .select({
      total: count(),
      status: usersTable.status,
      role: usersTable.role
    })
    .from(usersTable)
    .where(eq(usersTable.departmentId, departmentId))
    .groupBy(usersTable.status, usersTable.role);

  // Calculate total salary budget
  const salaryBudget = await db
    .select({
      totalSalary: sql`COALESCE(SUM(basic_salary + allowances - deductions), 0)::numeric`
    })
    .from(usersTable)
    .where(
      and(
        eq(usersTable.departmentId, departmentId),
        eq(usersTable.status, 'active')
      )
    );

  // Process statistics
  const processedStats = {
    totalEmployees: 0,
    activeEmployees: 0,
    byRole: {},
    byStatus: {},
    totalSalaryBudget: salaryBudget[0].totalSalary || 0
  };

  employeeStats.forEach(stat => {
    processedStats.totalEmployees += stat.total;
    
    if (stat.status === 'active') {
      processedStats.activeEmployees += stat.total;
    }

    processedStats.byStatus[stat.status] = (processedStats.byStatus[stat.status] || 0) + stat.total;
    processedStats.byRole[stat.role] = (processedStats.byRole[stat.role] || 0) + stat.total;
  });

  res.status(200).json({
    status: 'success',
    data: {
      department: department[0],
      statistics: processedStats
    }
  });
});

// Get departments for dropdown/select
export const getDepartmentsList = catchAsync(async (req, res, next) => {
  const departments = await db
    .select({
      id: departmentsTable.id,
      name: departmentsTable.name
    })
    .from(departmentsTable)
    .where(eq(departmentsTable.isActive, true))
    .orderBy(asc(departmentsTable.name));

  res.status(200).json({
    status: 'success',
    data: {
      departments
    }
  });
});
