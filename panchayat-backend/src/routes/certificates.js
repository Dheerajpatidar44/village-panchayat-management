import express from 'express';
import { createCertificate, listCertificates, getCertificate, updateCertificate } from '../controllers/certificatesController.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', verifyToken, requireRole('citizen'), createCertificate);
router.get('/', verifyToken, listCertificates);
router.get('/:id', verifyToken, getCertificate);
router.put('/:id', verifyToken, requireRole('admin', 'clerk'), updateCertificate);

export default router;
