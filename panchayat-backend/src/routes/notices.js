import express from 'express';
import { listNotices, createNotice, createGlobalNotice, updateNotice, deleteNotice } from '../controllers/noticesController.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', verifyToken, listNotices);
router.post('/global', verifyToken, requireRole('admin'), createGlobalNotice);
router.post('/', verifyToken, requireRole('admin', 'clerk'), createNotice);
router.put('/:id', verifyToken, requireRole('admin', 'clerk'), updateNotice);
router.delete('/:id', verifyToken, requireRole('admin'), deleteNotice);

export default router;
