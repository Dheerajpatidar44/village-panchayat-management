import prisma from '../lib/prisma.js';

// GET /api/reports/summary
export const getReportsSummary = async (req, res, next) => {
  try {
    const [
      totalUsers,
      byRole,
      totalComplaints,
      complaintsByStatus,
      totalCertificates,
      certsByStatus,
      totalSchemes,
      activeSchemes,
      totalNotices,
      publishedNotices,
      totalRevenue,
      pendingRegistrations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
      prisma.complaint.count(),
      prisma.complaint.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.certificate.count(),
      prisma.certificate.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.scheme.count(),
      prisma.scheme.count({ where: { is_active: true } }),
      prisma.notice.count(),
      prisma.notice.count({ where: { is_published: true } }),
      prisma.revenue.aggregate({ _sum: { amount: true } }),
      prisma.registrationRequest.count({ where: { status: 'pending' } }),
    ]);

    const roleMap = byRole.reduce((acc, r) => ({ ...acc, [r.role]: r._count.id }), {});
    const complaintStatusMap = complaintsByStatus.reduce((acc, r) => ({ ...acc, [r.status]: r._count.id }), {});
    const certStatusMap = certsByStatus.reduce((acc, r) => ({ ...acc, [r.status]: r._count.id }), {});

    res.json({
      users: {
        total: totalUsers,
        admins: roleMap.admin || 0,
        clerks: roleMap.clerk || 0,
        citizens: roleMap.citizen || 0,
        pendingRegistrations,
      },
      complaints: {
        total: totalComplaints,
        open: complaintStatusMap.open || 0,
        in_progress: complaintStatusMap.in_progress || 0,
        resolved: complaintStatusMap.resolved || 0,
        closed: complaintStatusMap.closed || 0,
      },
      certificates: {
        total: totalCertificates,
        pending: certStatusMap.pending || 0,
        approved: certStatusMap.approved || 0,
        rejected: certStatusMap.rejected || 0,
      },
      schemes: {
        total: totalSchemes,
        active: activeSchemes,
        inactive: totalSchemes - activeSchemes,
      },
      notices: {
        total: totalNotices,
        published: publishedNotices,
        draft: totalNotices - publishedNotices,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
        formatted: formatRevenue(totalRevenue._sum.amount || 0),
      },
    });
  } catch (err) { next(err); }
};

function formatRevenue(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}
