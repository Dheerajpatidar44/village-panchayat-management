import express from 'express';
import { listRegistrations, getRegistration, updateRegistration } from '../controllers/registrationsController.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', verifyToken, requireRole('admin'), listRegistrations);
router.get('/:id', verifyToken, requireRole('admin'), getRegistration);
router.put('/:id', verifyToken, requireRole('admin'), updateRegistration);

export default router;
