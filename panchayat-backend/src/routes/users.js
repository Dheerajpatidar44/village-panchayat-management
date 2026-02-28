import express from 'express';
import { listUsers, listClerks, createClerk, getUser, updateUser, deactivateUser } from '../controllers/usersController.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', verifyToken, requireRole('admin', 'clerk'), listUsers);
router.get('/clerks', verifyToken, requireRole('admin'), listClerks);
router.post('/clerks', verifyToken, requireRole('admin'), createClerk);
router.get('/:id', verifyToken, requireRole('admin', 'clerk'), getUser);
router.put('/:id', verifyToken, requireRole('admin'), updateUser);
router.put('/:id/deactivate', verifyToken, requireRole('admin'), deactivateUser);

export default router;
