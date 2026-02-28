import express from 'express';
import { getSummary, getPerformance, getSystemIntegrity, exportDashboard } from '../controllers/dashboardController.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/summary', verifyToken, requireRole('admin', 'clerk'), getSummary);
router.get('/performance', verifyToken, requireRole('admin', 'clerk'), getPerformance);
router.get('/system-integrity', verifyToken, requireRole('admin', 'clerk'), getSystemIntegrity);
router.get('/export', verifyToken, requireRole('admin', 'clerk'), exportDashboard);

export default router;
