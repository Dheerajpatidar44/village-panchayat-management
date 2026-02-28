import prisma from '../lib/prisma.js';

const genAppNumber = () => `CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

// POST /api/certificates
export const createCertificate = async (req, res, next) => {
  try {
    const { certificate_type, data, purpose } = req.body;
    if (!certificate_type || !purpose) {
      return res.status(400).json({ detail: 'certificate_type and purpose are required' });
    }
    const cert = await prisma.certificate.create({
      data: {
        application_number: genAppNumber(),
        citizen_id: req.user.id,
        certificate_type,
        data: data || {},
        purpose,
        status: 'pending',
      },
    });
    res.status(201).json(cert);
  } catch (err) { next(err); }
};

// GET /api/certificates
export const listCertificates = async (req, res, next) => {
  try {
    const where = req.user.role === 'citizen' ? { citizen_id: req.user.id } : {};
    const certs = await prisma.certificate.findMany({
      where,
      include: { citizen: { select: { full_name: true, email: true } } },
      orderBy: { submitted_at: 'desc' },
    });
    res.json(certs);
  } catch (err) { next(err); }
};

// GET /api/certificates/:id
export const getCertificate = async (req, res, next) => {
  try {
    const cert = await prisma.certificate.findUnique({
      where: { id: req.params.id },
      include: { citizen: { select: { full_name: true, email: true } } },
    });
    if (!cert) return res.status(404).json({ detail: 'Certificate not found' });
    if (req.user.role === 'citizen' && cert.citizen_id !== req.user.id) {
      return res.status(403).json({ detail: 'Access denied' });
    }
    res.json(cert);
  } catch (err) { next(err); }
};

// PUT /api/certificates/:id — admin/clerk approve/reject
export const updateCertificate = async (req, res, next) => {
  try {
    const { status, remarks, certificate_url } = req.body;
    const data = {};
    if (status) data.status = status;
    if (remarks) data.remarks = remarks;
    if (certificate_url) data.certificate_url = certificate_url;
    if (status && status !== 'pending') {
      data.processed_at = new Date();
      data.processed_by_id = req.user.id;
    }
    const cert = await prisma.certificate.update({ where: { id: req.params.id }, data });
    res.json(cert);
  } catch (err) { next(err); }
};
