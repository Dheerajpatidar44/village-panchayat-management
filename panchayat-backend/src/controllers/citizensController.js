import prisma from '../lib/prisma.js';

// GET /api/citizens — list citizen users with profiles (admin/clerk)
export const listCitizens = async (req, res, next) => {
  try {
    const citizens = await prisma.user.findMany({
      where: { role: 'citizen' },
      include: { profile: true },
      orderBy: { created_at: 'desc' },
    });
    res.json(citizens);
  } catch (err) { next(err); }
};

// GET /api/citizens/:id
export const getCitizen = async (req, res, next) => {
  try {
    const citizen = await prisma.user.findFirst({
      where: { id: req.params.id, role: 'citizen' },
      include: { profile: true, certificates: true, complaints: true },
    });
    if (!citizen) return res.status(404).json({ detail: 'Citizen not found' });
    res.json(citizen);
  } catch (err) { next(err); }
};

// GET /api/citizens/profile/me — citizen's own profile
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
    });
    if (!user) return res.status(404).json({ detail: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// PUT /api/citizens/profile/me — update own profile
export const updateMyProfile = async (req, res, next) => {
  try {
    const { full_name, mobile } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { ...(full_name && { full_name }), ...(mobile && { mobile }) },
      select: { id: true, email: true, full_name: true, role: true, mobile: true },
    });
    res.json(user);
  } catch (err) { next(err); }
};
