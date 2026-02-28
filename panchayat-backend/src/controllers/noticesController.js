import prisma from '../lib/prisma.js';

// GET /api/notices
export const listNotices = async (req, res, next) => {
  try {
    const where = req.user.role === 'citizen' ? { is_published: true } : {};
    const notices = await prisma.notice.findMany({
      where,
      include: { creator: { select: { full_name: true } } },
      orderBy: { created_at: 'desc' },
    });
    res.json(notices);
  } catch (err) { next(err); }
};

// POST /api/notices — Admin/Clerk
export const createNotice = async (req, res, next) => {
  try {
    const { title, content, notice_type, priority, is_published, is_global, expiry_date } = req.body;
    if (!title || !content || !notice_type) {
      return res.status(400).json({ detail: 'title, content, and notice_type are required' });
    }
    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        notice_type,
        priority: priority || 'normal',
        is_published: is_published || false,
        is_global: is_global || false,
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        created_by_id: req.user.id,
      },
    });
    res.status(201).json(notice);
  } catch (err) { next(err); }
};

// POST /api/notices/global — Admin only: broadcast global notice
export const createGlobalNotice = async (req, res, next) => {
  try {
    const { title, description, priority, expiryDate } = req.body;
    if (!title || !description) {
      return res.status(400).json({ detail: 'title and description are required' });
    }
    const notice = await prisma.notice.create({
      data: {
        title,
        content: description,
        notice_type: 'global',
        priority: priority || 'high',
        is_published: true,
        is_global: true,
        expiry_date: expiryDate ? new Date(expiryDate) : null,
        created_by_id: req.user.id,
      },
      include: { creator: { select: { full_name: true } } },
    });
    res.status(201).json({ message: 'Global notice broadcast successfully', notice });
  } catch (err) { next(err); }
};

// PUT /api/notices/:id — Admin/Clerk
export const updateNotice = async (req, res, next) => {
  try {
    const { title, content, notice_type, priority, is_published, is_global, expiry_date } = req.body;
    const notice = await prisma.notice.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(notice_type && { notice_type }),
        ...(priority && { priority }),
        ...(is_published !== undefined && { is_published }),
        ...(is_global !== undefined && { is_global }),
        ...(expiry_date && { expiry_date: new Date(expiry_date) }),
      },
    });
    res.json(notice);
  } catch (err) { next(err); }
};

// DELETE /api/notices/:id — Admin only
export const deleteNotice = async (req, res, next) => {
  try {
    await prisma.notice.delete({ where: { id: req.params.id } });
    res.json({ message: 'Notice deleted successfully' });
  } catch (err) { next(err); }
};
