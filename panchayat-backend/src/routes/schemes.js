import express from 'express';
import { listSchemes, createScheme, updateScheme, deleteScheme } from '../controllers/schemesController.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', verifyToken, listSchemes);
router.post('/', verifyToken, requireRole('admin'), createScheme);
router.put('/:id', verifyToken, requireRole('admin'), updateScheme);
router.delete('/:id', verifyToken, requireRole('admin'), deleteScheme);

export default router;
