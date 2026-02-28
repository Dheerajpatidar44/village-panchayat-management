import prisma from '../lib/prisma.js';

// GET /api/search?q=keyword&limit=10
export const globalSearch = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ detail: 'Search query must be at least 2 characters' });
    }

    const term = q.trim();
    const take = Math.min(parseInt(limit) || 10, 50);

    const [citizens, schemes, complaints, certificates, notices] = await Promise.all([
      // Citizens
      prisma.user.findMany({
        where: {
          role: 'citizen',
          OR: [
            { full_name: { contains: term } },
            { email: { contains: term } },
            { mobile: { contains: term } },
          ],
        },
        select: { id: true, full_name: true, email: true, mobile: true, role: true, created_at: true },
        take,
      }),

      // Schemes
      prisma.scheme.findMany({
        where: {
          OR: [
            { scheme_name: { contains: term } },
            { description: { contains: term } },
          ],
        },
        select: { id: true, scheme_name: true, description: true, is_active: true, total_applications: true },
        take,
      }),

      // Complaints
      prisma.complaint.findMany({
        where: {
          OR: [
            { complaint_number: { contains: term } },
            { subject: { contains: term } },
            { complaint_type: { contains: term } },
            { description: { contains: term } },
            { citizen: { full_name: { contains: term } } },
          ],
        },
        include: { citizen: { select: { full_name: true } } },
        take,
        orderBy: { submitted_at: 'desc' },
      }),

      // Certificates
      prisma.certificate.findMany({
        where: {
          OR: [
            { application_number: { contains: term } },
            { certificate_type: { contains: term } },
            { citizen: { full_name: { contains: term } } },
          ],
        },
        include: { citizen: { select: { full_name: true } } },
        take,
        orderBy: { submitted_at: 'desc' },
      }),

      // Notices
      prisma.notice.findMany({
        where: {
          OR: [
            { title: { contains: term } },
            { content: { contains: term } },
          ],
        },
        select: { id: true, title: true, notice_type: true, priority: true, is_published: true, created_at: true },
        take,
      }),
    ]);

    res.json({
      query: term,
      results: {
        citizens: citizens.map(c => ({ ...c, _type: 'citizen' })),
        schemes: schemes.map(s => ({ ...s, _type: 'scheme' })),
        complaints: complaints.map(c => ({ ...c, _type: 'complaint' })),
        certificates: certificates.map(c => ({ ...c, _type: 'certificate' })),
        notices: notices.map(n => ({ ...n, _type: 'notice' })),
      },
      totalCount: citizens.length + schemes.length + complaints.length + certificates.length + notices.length,
    });
  } catch (err) { next(err); }
};
