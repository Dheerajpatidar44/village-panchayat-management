import prisma from '../lib/prisma.js';

// GET /api/schemes — Public (any authenticated)
export const listSchemes = async (req, res, next) => {
  try {
    const schemes = await prisma.scheme.findMany({
      include: { creator: { select: { full_name: true } } },
      orderBy: { created_at: 'desc' },
    });
    res.json(schemes);
  } catch (err) { next(err); }
};

// POST /api/schemes — Admin only
export const createScheme = async (req, res, next) => {
  try {
    const { scheme_name, description, is_active } = req.body;
    if (!scheme_name || !description) {
      return res.status(400).json({ detail: 'scheme_name and description are required' });
    }
    const scheme = await prisma.scheme.create({
      data: { scheme_name, description, is_active: is_active !== false, created_by_id: req.user.id },
    });
    res.status(201).json(scheme);
  } catch (err) { next(err); }
};

// PUT /api/schemes/:id — Admin only
export const updateScheme = async (req, res, next) => {
  try {
    const { scheme_name, description, is_active } = req.body;
    const scheme = await prisma.scheme.update({
      where: { id: req.params.id },
      data: { ...(scheme_name && { scheme_name }), ...(description && { description }), ...(is_active !== undefined && { is_active }) },
    });
    res.json(scheme);
  } catch (err) { next(err); }
};

// DELETE /api/schemes/:id — Admin only
export const deleteScheme = async (req, res, next) => {
  try {
    await prisma.scheme.delete({ where: { id: req.params.id } });
    res.json({ message: 'Scheme deleted successfully' });
  } catch (err) { next(err); }
};
