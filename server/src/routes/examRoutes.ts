import { Router } from 'express';
import { createExam, getExams, updateExam, deleteExam } from '../controllers/examController.js';
import { verifyToken } from '../controllers/authController.js';

const router = Router();

router.get('/', getExams);
router.post('/', verifyToken, createExam);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);

export default router;

