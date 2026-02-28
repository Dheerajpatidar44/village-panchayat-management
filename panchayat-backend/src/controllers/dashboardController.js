import prisma from '../lib/prisma.js';
import { createObjectCsvStringifier } from 'csv-writer';

// ─── GET /api/dashboard/summary ──────────────────────────────────────────────

export const getSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Revenue: sum of all revenue
    const revenueAgg = await prisma.revenue.aggregate({ _sum: { amount: true } });
    const totalRevenue = revenueAgg._sum.amount || 0;

    const lastMonthRevenue = await prisma.revenue.aggregate({
      where: { month: lastMonth, year: lastMonthYear },
      _sum: { amount: true },
    });
    const currMonthRevenue = await prisma.revenue.aggregate({
      where: { month: currentMonth, year: currentYear },
      _sum: { amount: true },
    });
    const revenuePrevTotal = lastMonthRevenue._sum.amount || 1;
    const currRev = currMonthRevenue._sum.amount || 0;
    const revenueChange = revenuePrevTotal > 0
      ? (((currRev - revenuePrevTotal) / revenuePrevTotal) * 100).toFixed(1)
      : 0;

    // Citizens
    const totalCitizens = await prisma.user.count({ where: { role: 'citizen', is_active: true } });
    const lastMonthCitizens = await prisma.user.count({
      where: {
        role: 'citizen',
        created_at: {
          gte: new Date(lastMonthYear, lastMonth - 1, 1),
          lt: new Date(currentYear, currentMonth - 1, 1),
        },
      },
    });
    const prevMonthCitizens = await prisma.user.count({
      where: {
        role: 'citizen',
        created_at: {
          gte: new Date(lastMonthYear, lastMonth - 2, 1),
          lt: new Date(lastMonthYear, lastMonth - 1, 1),
        },
      },
    });
    const citizenChange = prevMonthCitizens > 0
      ? (((lastMonthCitizens - prevMonthCitizens) / prevMonthCitizens) * 100).toFixed(1)
      : 0;

    // Approvals: approved certificates + approved scheme applications
    const approvedCerts = await prisma.certificate.count({ where: { status: 'approved' } });
    const approvedSchemes = await prisma.schemeApplication.count({ where: { status: 'approved' } });
    const totalApprovals = approvedCerts + approvedSchemes;

    // Prev month approvals
    const prevApprovedCerts = await prisma.certificate.count({
      where: {
        status: 'approved',
        processed_at: {
          gte: new Date(lastMonthYear, lastMonth - 1, 1),
          lt: new Date(currentYear, currentMonth - 1, 1),
        },
      },
    });
    const prevApprovedSchemes = await prisma.schemeApplication.count({
      where: {
        status: 'approved',
        reviewed_at: {
          gte: new Date(lastMonthYear, lastMonth - 1, 1),
          lt: new Date(currentYear, currentMonth - 1, 1),
        },
      },
    });
    const prevApprovals = prevApprovedCerts + prevApprovedSchemes;
    const approvalsChange = prevApprovals > 0
      ? (((totalApprovals - prevApprovals) / prevApprovals) * 100).toFixed(1)
      : 0;

    // Alerts: pending complaints + pending_registrations
    const pendingComplaints = await prisma.complaint.count({ where: { status: 'open' } });
    const pendingRegistrations = await prisma.registrationRequest.count({ where: { status: 'pending' } });
    const totalAlerts = pendingComplaints + pendingRegistrations;

    const prevPendingComplaints = await prisma.complaint.count({
      where: {
        status: 'open',
        submitted_at: {
          gte: new Date(lastMonthYear, lastMonth - 1, 1),
          lt: new Date(currentYear, currentMonth - 1, 1),
        },
      },
    });
    const alertsChange = prevPendingComplaints > 0
      ? (((totalAlerts - prevPendingComplaints) / prevPendingComplaints) * 100).toFixed(1)
      : 0;

    res.json({
      totalRevenue,
      totalRevenueFormatted: formatRevenue(totalRevenue),
      totalCitizens,
      totalApprovals,
      totalAlerts,
      percentageChanges: {
        revenue: parseFloat(revenueChange),
        citizens: parseFloat(citizenChange),
        approvals: parseFloat(approvalsChange),
        alerts: parseFloat(alertsChange),
      },
    });
  } catch (err) { next(err); }
};

// ─── GET /api/dashboard/performance ──────────────────────────────────────────

export const getPerformance = async (req, res, next) => {
  try {
    const year = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const complaintsRaw = await prisma.complaint.groupBy({
      by: [],
      where: { submitted_at: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
    });

    // Monthly complaints
    const monthlyComplaints = await Promise.all(months.map(async (m) => {
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 1);
      const total = await prisma.complaint.count({ where: { submitted_at: { gte: start, lt: end } } });
      const resolved = await prisma.complaint.count({ where: { submitted_at: { gte: start, lt: end }, status: { in: ['resolved', 'closed'] } } });
      return { month: m, total, resolved };
    }));

    // Monthly scheme applications
    const monthlySchemeApps = await Promise.all(months.map(async (m) => {
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 1);
      const total = await prisma.schemeApplication.count({ where: { applied_at: { gte: start, lt: end } } });
      const approved = await prisma.schemeApplication.count({ where: { applied_at: { gte: start, lt: end }, status: 'approved' } });
      return { month: m, total, approved };
    }));

    // Monthly approvals (certs + scheme)
    const monthlyApprovals = await Promise.all(months.map(async (m) => {
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 1);
      const certs = await prisma.certificate.count({ where: { processed_at: { gte: start, lt: end }, status: 'approved' } });
      const schemeApps = await prisma.schemeApplication.count({ where: { reviewed_at: { gte: start, lt: end }, status: 'approved' } });
      return { month: m, total: certs + schemeApps };
    }));

    // Monthly revenue
    const monthlyRevenue = await Promise.all(months.map(async (m) => {
      const agg = await prisma.revenue.aggregate({
        where: { month: m, year },
        _sum: { amount: true },
      });
      return { month: m, total: agg._sum.amount || 0 };
    }));

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    res.json({
      year,
      labels: monthNames,
      complaintsTrend: monthlyComplaints,
      schemeApplicationsTrend: monthlySchemeApps,
      approvalsTrend: monthlyApprovals,
      revenueTrend: monthlyRevenue,
    });
  } catch (err) { next(err); }
};

// ─── GET /api/dashboard/system-integrity ─────────────────────────────────────

export const getSystemIntegrity = async (req, res, next) => {
  try {
    const totalComplaints = await prisma.complaint.count();
    const resolvedComplaints = await prisma.complaint.count({ where: { status: { in: ['resolved', 'closed'] } } });
    const complaintResolvingRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;

    const schemesAgg = await prisma.scheme.aggregate({ _sum: { allocated_funds: true, utilized_funds: true } });
    const allocatedFunds = schemesAgg._sum.allocated_funds || 0;
    const utilizedFunds = schemesAgg._sum.utilized_funds || 0;
    const schemeUtilizationRate = allocatedFunds > 0 ? Math.round((utilizedFunds / allocatedFunds) * 100) : 0;

    // Monthly goal: digitization — % citizens with cert applications
    const totalCitizens = await prisma.user.count({ where: { role: 'citizen' } });
    const citizensWithCerts = await prisma.certificate.groupBy({ by: ['citizen_id'] });
    const digitizationRate = totalCitizens > 0 ? Math.round((citizensWithCerts.length / totalCitizens) * 100) : 0;

    const pendingCerts = await prisma.certificate.count({ where: { status: 'pending' } });
    const pendingComplaints = await prisma.complaint.count({ where: { status: 'open' } });

    res.json({
      complaintResolvingRate,
      schemeUtilizationRate,
      digitizationRate,
      monthlyGoalProgress: Math.min(digitizationRate, 100),
      details: {
        totalComplaints,
        resolvedComplaints,
        allocatedFunds,
        utilizedFunds,
        pendingCerts,
        pendingComplaints,
      },
    });
  } catch (err) { next(err); }
};

// ─── GET /api/dashboard/export ────────────────────────────────────────────────

export const exportDashboard = async (req, res, next) => {
  try {
    const format = req.query.format || 'csv';

    const [citizens, complaints, certificates, schemes, revenue] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'citizen' },
        select: { id: true, full_name: true, email: true, mobile: true, created_at: true, is_active: true },
        orderBy: { created_at: 'desc' },
      }),
      prisma.complaint.findMany({
        include: { citizen: { select: { full_name: true } } },
        orderBy: { submitted_at: 'desc' },
        take: 500,
      }),
      prisma.certificate.findMany({
        include: { citizen: { select: { full_name: true } } },
        orderBy: { submitted_at: 'desc' },
        take: 500,
      }),
      prisma.scheme.findMany({ orderBy: { created_at: 'desc' } }),
      prisma.revenue.findMany({ orderBy: { collected_at: 'desc' }, take: 500 }),
    ]);

    if (format === 'csv') {
      // Build a combined CSV
      let csv = '';

      csv += '=== CITIZENS ===\n';
      csv += 'Name,Email,Mobile,Joined,Active\n';
      citizens.forEach(c => {
        csv += `"${c.full_name}","${c.email}","${c.mobile || ''}","${c.created_at.toISOString()}","${c.is_active}"\n`;
      });

      csv += '\n=== COMPLAINTS ===\n';
      csv += 'Number,Citizen,Type,Subject,Status,Priority,Submitted\n';
      complaints.forEach(c => {
        csv += `"${c.complaint_number}","${c.citizen.full_name}","${c.complaint_type}","${c.subject}","${c.status}","${c.priority}","${c.submitted_at.toISOString()}"\n`;
      });

      csv += '\n=== CERTIFICATES ===\n';
      csv += 'App Number,Citizen,Type,Status,Submitted,Processed\n';
      certificates.forEach(c => {
        csv += `"${c.application_number}","${c.citizen.full_name}","${c.certificate_type}","${c.status}","${c.submitted_at.toISOString()}","${c.processed_at?.toISOString() || ''}"\n`;
      });

      csv += '\n=== SCHEMES ===\n';
      csv += 'Name,Active,Total Applications,Approved,Allocated Funds,Utilized Funds\n';
      schemes.forEach(s => {
        csv += `"${s.scheme_name}","${s.is_active}","${s.total_applications}","${s.approved_applications}","${s.allocated_funds}","${s.utilized_funds}"\n`;
      });

      csv += '\n=== REVENUE ===\n';
      csv += 'Amount,Category,Description,Collected At\n';
      revenue.forEach(r => {
        csv += `"${r.amount}","${r.category}","${r.description || ''}","${r.collected_at.toISOString()}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="panchayat-analytics-${new Date().toISOString().split('T')[0]}.csv"`);
      return res.send(csv);
    }

    // Default: JSON export
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="panchayat-analytics-${new Date().toISOString().split('T')[0]}.json"`);
    return res.json({ citizens, complaints, certificates, schemes, revenue, exportedAt: new Date() });

  } catch (err) { next(err); }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRevenue(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}
