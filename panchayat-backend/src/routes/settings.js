import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', verifyToken, requireRole('admin'), getSettings);
router.put('/', verifyToken, requireRole('admin'), updateSettings);

export default router;
