import express from 'express';
import { getReportsSummary } from '../controllers/reportsController.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/summary', verifyToken, requireRole('admin', 'clerk'), getReportsSummary);

export default router;
