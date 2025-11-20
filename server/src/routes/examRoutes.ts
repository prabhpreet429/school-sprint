import { Router } from 'express';
import { createExam, getExams, updateExam, deleteExam } from '../controllers/examController.js';

const router = Router();

router.get('/', getExams);
router.post('/', createExam);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);

export default router;

