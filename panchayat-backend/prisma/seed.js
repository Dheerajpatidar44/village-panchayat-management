import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Village Panchayat database...\n');

  // ─── 1. Create Users ─────────────────────────────────────────────────────────

  const usersData = [
    { email: 'admin@panchayat.com', password: 'admin123', role: 'admin', full_name: 'Ramesh Kumar', mobile: '9999999999' },
    { email: 'admin@gram.in', password: 'password123', role: 'admin', full_name: 'Sunita Patel', mobile: '9000000001' },
    { email: 'clerk1@gram.in', password: 'clerk123', role: 'clerk', full_name: 'Vijay Sharma', mobile: '9000000002', clerk: { employee_id: 'EMP-001', department: 'Revenue', designation: 'Senior Clerk' } },
    { email: 'clerk2@gram.in', password: 'clerk123', role: 'clerk', full_name: 'Priya Gupta', mobile: '9000000003', clerk: { employee_id: 'EMP-002', department: 'Civil Works', designation: 'Junior Clerk' } },
    { email: 'citizen1@gram.in', password: 'citizen123', role: 'citizen', full_name: 'Mohanlal Verma', mobile: '9111111111', dob: '1985-06-15', aadhaar: '111122223333', gender: 'male', address: 'House No 5, Main Street', village: 'Sarahi', pincode: '483880' },
    { email: 'citizen2@gram.in', password: 'citizen123', role: 'citizen', full_name: 'Savita Devi', mobile: '9222222222', dob: '1990-03-22', aadhaar: '444455556666', gender: 'female', address: 'Near Temple, Ward 2', village: 'Sarahi', pincode: '483880' },
    { email: 'citizen3@gram.in', password: 'citizen123', role: 'citizen', full_name: 'Raju Singh', mobile: '9333333333', dob: '1978-11-08', aadhaar: '777788889999', gender: 'male', address: 'Farmers Colony, Lane 4', village: 'Sarahi', pincode: '483880' },
    { email: 'citizen4@gram.in', password: 'citizen123', role: 'citizen', full_name: 'Anita Kumari', mobile: '9444444444', dob: '1995-07-19', aadhaar: '000011112222', gender: 'female', address: 'Block A, Government Housing', village: 'Sarahi', pincode: '483880' },
    { email: 'citizen5@gram.in', password: 'citizen123', role: 'citizen', full_name: 'Dinesh Patel', mobile: '9555555555', dob: '1982-02-14', aadhaar: '333344445555', gender: 'male', address: 'Old Market Area, Shop No 22', village: 'Sarahi', pincode: '483880' },
  ];

  const createdUsers = {};

  for (const u of usersData) {
    let user = await prisma.user.findUnique({ where: { email: u.email } });
    if (user) {
      console.log(`⚠️  Already exists: ${u.email} (skipped)`);
      createdUsers[u.email] = user;
      continue;
    }

    const password_hash = await bcrypt.hash(u.password, 10);

    user = await prisma.user.create({
      data: {
        email: u.email,
        password_hash,
        role: u.role,
        full_name: u.full_name,
        mobile: u.mobile,
        is_active: true,
        ...(u.clerk && {
          clerk_profile: {
            create: {
              employee_id: u.clerk.employee_id,
              department: u.clerk.department,
              designation: u.clerk.designation,
            },
          },
        }),
        ...(u.aadhaar && {
          profile: {
            create: {
              aadhaar_number: u.aadhaar,
              date_of_birth: new Date(u.dob),
              gender: u.gender,
              address: u.address,
              village: u.village,
              pincode: u.pincode,
            },
          },
        }),
      },
    });

    console.log(`✅ Created: ${u.email} | role: ${u.role} | password: ${u.password}`);
    createdUsers[u.email] = user;
  }

  const admin = createdUsers['admin@gram.in'] || await prisma.user.findUnique({ where: { email: 'admin@gram.in' } });
  const admin2 = createdUsers['admin@panchayat.com'] || await prisma.user.findUnique({ where: { email: 'admin@panchayat.com' } });
  const citizen1 = createdUsers['citizen1@gram.in'];
  const citizen2 = createdUsers['citizen2@gram.in'];
  const citizen3 = createdUsers['citizen3@gram.in'];
  const citizen4 = createdUsers['citizen4@gram.in'];
  const citizen5 = createdUsers['citizen5@gram.in'];
  const clerk1 = createdUsers['clerk1@gram.in'];

  // ─── 2. Additional Citizens for Scale (to get 8000+ count) ───────────────────
  // We'll add them as large batch in registration requests (simulating panchayat data)

  // ─── 3. Registration Requests ─────────────────────────────────────────────────

  const regCount = await prisma.registrationRequest.count();
  if (regCount === 0) {
    const pendingRegs = [
      { full_name: 'Suresh Yadav', email: 'suresh@example.com', mobile: '9600000001', aadhaar: '101010101010', dob: '1988-04-10', gender: 'male', address: 'Village Road, Sarahi', pincode: '483880', password: 'pass123' },
      { full_name: 'Kavita Singh', email: 'kavita@example.com', mobile: '9600000002', aadhaar: '202020202020', dob: '1993-09-25', gender: 'female', address: 'Block B, Sarahi', pincode: '483880', password: 'pass123' },
      { full_name: 'Rakesh Mishra', email: 'rakesh@example.com', mobile: '9600000003', aadhaar: '303030303030', dob: '1980-12-01', gender: 'male', address: 'Colony No 3, Sarahi', pincode: '483880', password: 'pass123' },
    ];

    for (const r of pendingRegs) {
      await prisma.registrationRequest.create({
        data: {
          full_name: r.full_name,
          date_of_birth: new Date(r.dob),
          gender: r.gender,
          aadhaar_number: r.aadhaar,
          email: r.email,
          mobile: r.mobile,
          address: r.address,
          village: 'Sarahi',
          pincode: r.pincode,
          password_hash: await bcrypt.hash(r.password, 10),
          status: 'pending',
        },
      });
    }
    console.log('✅ Registration requests created (3 pending)');
  }

  // ─── 4. Schemes ───────────────────────────────────────────────────────────────

  const schemeCount = await prisma.scheme.count();
  if (schemeCount === 0) {
    const schemes = [
      { scheme_name: 'PM Awas Yojana', description: 'Housing scheme for rural poor citizens providing financial assistance for house construction.', allocated_funds: 5000000, utilized_funds: 3100000, total_applications: 450, approved_applications: 120 },
      { scheme_name: 'MGNREGA Employment', description: 'Guaranteed 100 days of wage employment to rural households under MGNREGA.', allocated_funds: 3000000, utilized_funds: 2790000, total_applications: 1200, approved_applications: 1100 },
      { scheme_name: 'CM Health Mission', description: 'Free healthcare services and medicines for BPL families.', allocated_funds: 1500000, utilized_funds: 600000, total_applications: 85, approved_applications: 40 },
      { scheme_name: 'Village Solar Project', description: 'Installing solar panels in rural homes for clean energy at subsidized rates.', allocated_funds: 2000000, utilized_funds: 400000, total_applications: 30, approved_applications: 10 },
      { scheme_name: 'Jal Jeevan Mission', description: 'Providing safe drinking water to every rural household through tap water connections.', allocated_funds: 4000000, utilized_funds: 2400000, total_applications: 320, approved_applications: 280 },
    ];

    const createdSchemes = [];
    for (const s of schemes) {
      const scheme = await prisma.scheme.create({
        data: { ...s, created_by_id: admin.id, is_active: true },
      });
      createdSchemes.push(scheme);
    }
    console.log('✅ 5 schemes created');

    // Scheme applications
    const citizens = [citizen1, citizen2, citizen3, citizen4, citizen5].filter(Boolean);
    const statuses = ['pending', 'approved', 'rejected', 'approved', 'pending'];
    for (let i = 0; i < citizens.length; i++) {
      await prisma.schemeApplication.create({
        data: {
          scheme_id: createdSchemes[i % createdSchemes.length].id,
          citizen_id: citizens[i].id,
          status: statuses[i],
          notes: 'Application submitted via Panchayat portal',
          reviewed_at: statuses[i] !== 'pending' ? new Date() : null,
        },
      });
    }
    console.log('✅ Scheme applications created');
  }

  // ─── 5. Complaints ────────────────────────────────────────────────────────────

  const complaintCount = await prisma.complaint.count();
  if (complaintCount === 0) {
    const complaints = [
      { citizen_id: citizen1?.id, complaint_type: 'Water Supply', subject: 'No water supply for 3 days', description: 'Water supply has been disrupted for 3 consecutive days in our area. Request immediate action.', location: 'Ward 2, Main Street', priority: 'high', status: 'open' },
      { citizen_id: citizen2?.id, complaint_type: 'Sanitation', subject: 'Drainage blocked near school', description: 'The main drainage near the government school is completely blocked causing unhygienic conditions.', location: 'Near Government School', priority: 'high', status: 'in_progress', assigned_to_id: clerk1?.id },
      { citizen_id: citizen3?.id, complaint_type: 'Road', subject: 'Road damaged after rain', description: 'The road connecting Ward 3 to main market has severe potholes after recent rains.', location: 'Ward 3 to Market Road', priority: 'medium', status: 'resolved', resolved_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { citizen_id: citizen4?.id, complaint_type: 'Street Light', subject: 'Street lights not working', description: '5 street lights in our colony have not been working for 2 weeks. Area is very dark at night.', location: 'Colony Block A', priority: 'medium', status: 'open' },
      { citizen_id: citizen5?.id, complaint_type: 'Garbage', subject: 'Garbage not collected', description: 'Garbage has not been collected for over a week in our area causing health concerns.', location: 'Old Market Area', priority: 'low', status: 'resolved', resolved_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { citizen_id: citizen1?.id, complaint_type: 'Water Supply', subject: 'Water quality issue', description: 'The tap water supplied has a foul smell and yellow color. Not fit for drinking.', location: 'Ward 2', priority: 'high', status: 'in_progress', assigned_to_id: clerk1?.id },
      { citizen_id: citizen2?.id, complaint_type: 'Road', subject: 'Speed breaker needed', description: 'There is no speed breaker near the school zone causing accidents. Need urgent installation.', location: 'School Road', priority: 'medium', status: 'open' },
    ];

    let compNum = 1001;
    for (const c of complaints) {
      if (!c.citizen_id) continue;
      await prisma.complaint.create({
        data: {
          complaint_number: `COMP-${new Date().getFullYear()}-${compNum++}`,
          citizen_id: c.citizen_id,
          complaint_type: c.complaint_type,
          subject: c.subject,
          description: c.description,
          location: c.location,
          priority: c.priority,
          status: c.status,
          assigned_to_id: c.assigned_to_id || null,
          resolved_at: c.resolved_at || null,
          submitted_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
    console.log('✅ 7 complaints created');
  }

  // ─── 6. Certificates ──────────────────────────────────────────────────────────

  const certCount = await prisma.certificate.count();
  if (certCount === 0) {
    const certs = [
      { citizen_id: citizen1?.id, cert_type: 'Residence Certificate', purposes: 'Bank Account Opening', status: 'approved', processed_by_id: admin.id },
      { citizen_id: citizen2?.id, cert_type: 'Income Certificate', purposes: 'Government Job Application', status: 'pending' },
      { citizen_id: citizen3?.id, cert_type: 'Caste Certificate', purposes: 'College Admission', status: 'approved', processed_by_id: admin.id },
      { citizen_id: citizen4?.id, cert_type: 'Residence Certificate', purposes: 'Passport Application', status: 'rejected', processed_by_id: clerk1?.id },
      { citizen_id: citizen5?.id, cert_type: 'Income Certificate', purposes: 'Scholarship Application', status: 'pending' },
    ];

    let certNum = 3001;
    for (const c of certs) {
      if (!c.citizen_id) continue;
      await prisma.certificate.create({
        data: {
          application_number: `CERT-${new Date().getFullYear()}-${certNum++}`,
          citizen_id: c.citizen_id,
          certificate_type: c.cert_type,
          purpose: c.purposes,
          data: { notes: 'Submitted via portal' },
          status: c.status,
          processed_by_id: c.processed_by_id || null,
          processed_at: c.status !== 'pending' ? new Date() : null,
          submitted_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
    console.log('✅ 5 certificates created');
  }

  // ─── 7. Notices ───────────────────────────────────────────────────────────────

  const noticeCount = await prisma.notice.count();
  if (noticeCount === 0) {
    const notices = [
      { title: 'Gram Sabha Meeting - March 2026', content: 'Monthly Gram Sabha meeting will be held on 15th March 2026 at Panchayat Bhawan at 10 AM. All villagers are requested to attend.', notice_type: 'meeting', priority: 'high', is_published: true },
      { title: 'Water Supply Interruption Notice', content: 'Water supply will be interrupted on 5th March 2026 between 8 AM to 2 PM for pipeline maintenance work.', notice_type: 'infrastructure', priority: 'normal', is_published: true },
      { title: 'Property Tax Payment Deadline', content: 'Last date for property tax payment is 31st March 2026. Citizens are requested to pay before the deadline to avoid penalties.', notice_type: 'financial', priority: 'urgent', is_published: true },
      { title: 'New Scheme: PM Kisan Enrollment', content: 'Enrollment for PM Kisan Samman Nidhi is now open. Eligible farmers can apply at Panchayat office with required documents.', notice_type: 'scheme', priority: 'high', is_published: true, is_global: true },
      { title: 'Health Camp - Free Checkup', content: 'Free health camp organized by District Health Department on 20th March 2026. All villagers can avail free medical checkup.', notice_type: 'health', priority: 'normal', is_published: false },
    ];

    for (const n of notices) {
      await prisma.notice.create({
        data: {
          title: n.title,
          content: n.content,
          notice_type: n.notice_type,
          priority: n.priority,
          is_published: n.is_published,
          is_global: n.is_global || false,
          created_by_id: admin.id,
          expiry_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
      });
    }
    console.log('✅ 5 notices created');
  }

  // ─── 8. Revenue ───────────────────────────────────────────────────────────────

  const revenueCount = await prisma.revenue.count();
  if (revenueCount === 0) {
    const now = new Date();
    const revenueData = [];

    // Generate 12 months of revenue data
    for (let m = 1; m <= 12; m++) {
      const year = now.getMonth() + 1 >= m ? now.getFullYear() : now.getFullYear() - 1;
      revenueData.push(
        { amount: 45000 + Math.random() * 20000, category: 'tax', description: 'Property Tax Collection', month: m, year, collected_by_id: admin.id },
        { amount: 15000 + Math.random() * 10000, category: 'fee', description: 'Certificate Fee Collection', month: m, year, collected_by_id: admin.id },
        { amount: 25000 + Math.random() * 15000, category: 'scheme_fund', description: 'Government Scheme Funds Received', month: m, year, collected_by_id: admin.id },
      );
    }

    for (const r of revenueData) {
      await prisma.revenue.create({
        data: {
          amount: Math.round(r.amount),
          category: r.category,
          description: r.description,
          month: r.month,
          year: r.year,
          collected_by_id: r.collected_by_id,
          collected_at: new Date(r.year, r.month - 1, Math.floor(Math.random() * 28) + 1),
        },
      });
    }
    console.log('✅ 36 revenue records created (12 months × 3 categories)');
  }

  // ─── 9. System Settings ───────────────────────────────────────────────────────

  const settingsCount = await prisma.systemSetting.count();
  if (settingsCount === 0) {
    const settings = [
      { key: 'village_name', value: 'Sarahi Village' },
      { key: 'district', value: 'Katni' },
      { key: 'state', value: 'Madhya Pradesh' },
      { key: 'sarpanch_name', value: 'Ramesh Kumar' },
      { key: 'contact_email', value: 'admin@panchayat.gov.in' },
      { key: 'contact_phone', value: '9999999999' },
      { key: 'digitization_target', value: '90' },
      { key: 'financial_year', value: '2025-26' },
    ];
    await prisma.systemSetting.createMany({ data: settings });
    console.log('✅ System settings created');
  }

  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Test Credentials:');
  console.log('  Admin:   admin@panchayat.com / admin123');
  console.log('  Admin:   admin@gram.in / password123');
  console.log('  Clerk:   clerk1@gram.in / clerk123');
  console.log('  Clerk:   clerk2@gram.in / clerk123');
  console.log('  Citizen: citizen1@gram.in / citizen123');
  console.log('  Citizen: citizen2@gram.in / citizen123');
  console.log('  Citizen: citizen3@gram.in / citizen123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
