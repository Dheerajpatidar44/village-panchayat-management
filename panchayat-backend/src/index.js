import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Routes
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import citizensRoutes from './routes/citizens.js';
import complaintsRoutes from './routes/complaints.js';
import certificatesRoutes from './routes/certificates.js';
import schemesRoutes from './routes/schemes.js';
import noticesRoutes from './routes/notices.js';
import registrationsRoutes from './routes/registrations.js';
import dashboardRoutes from './routes/dashboard.js';
import searchRoutes from './routes/search.js';
import reportsRoutes from './routes/reports.js';
import settingsRoutes from './routes/settings.js';

import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Gram Panchayat API', status: 'running', version: '2.0.0' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/citizens', citizensRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/notices', noticesRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ detail: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 API base: http://localhost:${PORT}/api`);
});

export default app;
