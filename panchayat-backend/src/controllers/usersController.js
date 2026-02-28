import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';

// GET /api/users — Admin: list all users with pagination
export const listUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, q } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(role && { role }),
      ...(q && {
        OR: [
          { full_name: { contains: q } },
          { email: { contains: q } },
          { mobile: { contains: q } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, full_name: true, role: true,
          mobile: true, is_active: true, created_at: true,
          profile: true, clerk_profile: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
};

// GET /api/users/clerks — Admin: list all clerks
export const listClerks = async (req, res, next) => {
  try {
    const clerks = await prisma.user.findMany({
      where: { role: 'clerk' },
      select: {
        id: true, email: true, full_name: true, mobile: true,
        is_active: true, created_at: true, clerk_profile: true,
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(clerks);
  } catch (err) { next(err); }
};

// POST /api/users/clerks — Admin: create a new clerk
export const createClerk = async (req, res, next) => {
  try {
    const { full_name, email, password, mobile, department, designation, employee_id } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ detail: 'full_name, email, and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ detail: 'Email already registered' });

    const empId = employee_id || `EMP-${Date.now()}`;
    const password_hash = await bcrypt.hash(password, 10);

    const clerk = await prisma.user.create({
      data: {
        email,
        password_hash,
        role: 'clerk',
        full_name,
        mobile,
        is_active: true,
        clerk_profile: {
          create: {
            employee_id: empId,
            department: department || 'General',
            designation: designation || 'Clerk',
          },
        },
      },
      include: { clerk_profile: true },
    });

    const { password_hash: _, ...safeClerk } = clerk;
    res.status(201).json(safeClerk);
  } catch (err) { next(err); }
};

// GET /api/users/:id — Get single user
export const getUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, email: true, full_name: true, role: true,
        mobile: true, is_active: true, created_at: true,
        profile: true, clerk_profile: true,
        certificates: { orderBy: { submitted_at: 'desc' }, take: 5 },
        complaints: { orderBy: { submitted_at: 'desc' }, take: 5 },
      },
    });
    if (!user) return res.status(404).json({ detail: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// PUT /api/users/:id — Admin: update user
export const updateUser = async (req, res, next) => {
  try {
    const { full_name, mobile, is_active, role } = req.body;
    const data = {};
    if (full_name) data.full_name = full_name;
    if (mobile) data.mobile = mobile;
    if (is_active !== undefined) data.is_active = is_active;
    if (role && req.user.role === 'admin') data.role = role;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, email: true, full_name: true, role: true, mobile: true, is_active: true },
    });
    res.json(user);
  } catch (err) { next(err); }
};

// DELETE /api/users/:id/deactivate — Soft delete
export const deactivateUser = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { is_active: false },
    });
    res.json({ message: 'User deactivated successfully' });
  } catch (err) { next(err); }
};
