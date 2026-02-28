import express from 'express';
import { listCitizens, getCitizen, getMyProfile, updateMyProfile } from '../controllers/citizensController.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/profile/me', verifyToken, getMyProfile);
router.put('/profile/me', verifyToken, updateMyProfile);
router.get('/', verifyToken, requireRole('admin', 'clerk'), listCitizens);
router.get('/:id', verifyToken, requireRole('admin', 'clerk'), getCitizen);

export default router;
