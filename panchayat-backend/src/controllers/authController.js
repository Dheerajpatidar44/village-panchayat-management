import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ detail: 'email, password, and role are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Check registration request for informative error
      if (role === 'citizen') {
        const req2 = await prisma.registrationRequest.findFirst({ where: { email } });
        if (req2?.status === 'pending')  return res.status(401).json({ detail: 'Account pending approval' });
        if (req2?.status === 'rejected') return res.status(401).json({ detail: 'Registration rejected' });
      }
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    if (user.role !== role) {
      return res.status(401).json({ detail: 'Invalid credentials or incorrect role selected' });
    }

    if (!user.is_active) {
      return res.status(401).json({ detail: 'Account is inactive' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ detail: 'Invalid credentials' });

    const token = jwt.sign(
      { sub: user.email, role: user.role, id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      access_token: token,
      token_type: 'bearer',
      role: user.role,
      user: { name: user.full_name, id: user.id, email: user.email },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { full_name, date_of_birth, gender, aadhaar_number, email, mobile, address, village, pincode, password } = req.body;

    if (!email || !password || !full_name || !aadhaar_number) {
      return res.status(400).json({ detail: 'Required fields missing' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ detail: 'Email already registered' });

    const existingReq = await prisma.registrationRequest.findFirst({
      where: { OR: [{ email }, { aadhaar_number }] },
    });
    if (existingReq) return res.status(400).json({ detail: 'Registration request already exists' });

    const password_hash = await bcrypt.hash(password, 10);
    const regReq = await prisma.registrationRequest.create({
      data: {
        full_name,
        date_of_birth: new Date(date_of_birth),
        gender,
        aadhaar_number,
        email,
        mobile,
        address,
        village: village || 'Sarahi',
        pincode,
        password_hash,
        status: 'pending',
      },
    });

    return res.status(201).json({
      message: 'Registration request submitted successfully. Please wait for admin approval.',
      request_id: regReq.id,
    });
  } catch (err) { next(err); }
};

// GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        mobile: true,
        is_active: true,
        created_at: true,
        profile: true,
        clerk_profile: true,
      },
    });

    if (!user) return res.status(404).json({ detail: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};
