import express from 'express';
import { createComplaint, listComplaints, getComplaint, updateComplaint } from '../controllers/complaintsController.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', verifyToken, requireRole('citizen'), createComplaint);
router.get('/', verifyToken, listComplaints);
router.get('/:id', verifyToken, getComplaint);
router.put('/:id', verifyToken, requireRole('admin', 'clerk'), updateComplaint);

export default router;
