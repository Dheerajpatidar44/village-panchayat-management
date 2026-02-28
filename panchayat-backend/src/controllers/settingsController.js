import prisma from '../lib/prisma.js';

const DEFAULT_SETTINGS = {
  village_name: 'Sarahi Village',
  district: 'Katni',
  state: 'Madhya Pradesh',
  sarpanch_name: 'Ramesh Kumar',
  contact_email: 'admin@panchayat.gov.in',
  contact_phone: '9999999999',
  digitization_target: '90',
  financial_year: '2025-26',
};

// GET /api/settings
export const getSettings = async (req, res, next) => {
  try {
    const rows = await prisma.systemSetting.findMany();
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    // Merge with defaults so all keys always present
    res.json({ ...DEFAULT_SETTINGS, ...settings });
  } catch (err) { next(err); }
};

// PUT /api/settings
export const updateSettings = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ detail: 'Settings object required' });
    }

    const upserts = Object.entries(data).map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );

    await Promise.all(upserts);
    res.json({ message: 'Settings updated successfully', settings: data });
  } catch (err) { next(err); }
};
