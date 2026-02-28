import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';

// GET /api/registrations — Admin: list all pending registration requests
export const listRegistrations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const requests = await prisma.registrationRequest.findMany({
      where,
      orderBy: { submitted_at: 'desc' },
    });
    res.json(requests);
  } catch (err) { next(err); }
};

// GET /api/registrations/:id
export const getRegistration = async (req, res, next) => {
  try {
    const reg = await prisma.registrationRequest.findUnique({ where: { id: req.params.id } });
    if (!reg) return res.status(404).json({ detail: 'Registration request not found' });
    res.json(reg);
  } catch (err) { next(err); }
};

// PUT /api/registrations/:id — Admin: approve or reject
export const updateRegistration = async (req, res, next) => {
  try {
    const { status, rejection_reason } = req.body;
    if (!status) return res.status(400).json({ detail: 'status is required' });

    const reg = await prisma.registrationRequest.findUnique({ where: { id: req.params.id } });
    if (!reg) return res.status(404).json({ detail: 'Registration request not found' });

    // Update request status
    const updated = await prisma.registrationRequest.update({
      where: { id: req.params.id },
      data: {
        status,
        reviewed_at: new Date(),
        reviewed_by_id: req.user.id,
        ...(rejection_reason && { rejection_reason }),
      },
    });

    // If approved, create a User account
    if (status === 'approved') {
      const existingUser = await prisma.user.findUnique({ where: { email: reg.email } });
      if (!existingUser) {
        const newUser = await prisma.user.create({
          data: {
            email: reg.email,
            password_hash: reg.password_hash,
            role: 'citizen',
            full_name: reg.full_name,
            mobile: reg.mobile,
            is_active: true,
          },
        });
        // Create citizen profile
        await prisma.citizenProfile.create({
          data: {
            user_id: newUser.id,
            aadhaar_number: reg.aadhaar_number,
            date_of_birth: reg.date_of_birth,
            gender: reg.gender,
            address: reg.address,
            village: reg.village,
            pincode: reg.pincode,
          },
        });
      }
    }

    res.json({ message: `Registration ${status}`, registration: updated });
  } catch (err) { next(err); }
};
