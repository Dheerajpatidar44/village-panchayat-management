import prisma from '../lib/prisma.js';

const genComplaintNumber = () => `COMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

// POST /api/complaints
export const createComplaint = async (req, res, next) => {
  try {
    const { complaint_type, subject, description, location, priority } = req.body;
    if (!complaint_type || !subject || !description) {
      return res.status(400).json({ detail: 'complaint_type, subject, description are required' });
    }
    const complaint = await prisma.complaint.create({
      data: {
        complaint_number: genComplaintNumber(),
        citizen_id: req.user.id,
        complaint_type,
        subject,
        description,
        location,
        priority: priority || 'medium',
        status: 'open',
      },
    });
    res.status(201).json(complaint);
  } catch (err) { next(err); }
};

// GET /api/complaints
export const listComplaints = async (req, res, next) => {
  try {
    const where = req.user.role === 'citizen' ? { citizen_id: req.user.id } : {};
    const complaints = await prisma.complaint.findMany({
      where,
      include: { citizen: { select: { full_name: true, email: true } }, assignee: { select: { full_name: true } } },
      orderBy: { submitted_at: 'desc' },
    });
    res.json(complaints);
  } catch (err) { next(err); }
};

// GET /api/complaints/:id
export const getComplaint = async (req, res, next) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: { citizen: { select: { full_name: true, email: true } }, assignee: { select: { full_name: true } } },
    });
    if (!complaint) return res.status(404).json({ detail: 'Complaint not found' });
    // Citizen can only view own complaints
    if (req.user.role === 'citizen' && complaint.citizen_id !== req.user.id) {
      return res.status(403).json({ detail: 'Access denied' });
    }
    res.json(complaint);
  } catch (err) { next(err); }
};

// PUT /api/complaints/:id — update status (admin/clerk)
export const updateComplaint = async (req, res, next) => {
  try {
    const { status, assigned_to_id, priority } = req.body;
    const data = {};
    if (status) data.status = status;
    if (assigned_to_id) data.assigned_to_id = assigned_to_id;
    if (priority) data.priority = priority;
    if (status === 'resolved') data.resolved_at = new Date();

    const complaint = await prisma.complaint.update({ where: { id: req.params.id }, data });
    res.json(complaint);
  } catch (err) { next(err); }
};
