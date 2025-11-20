import { Router } from 'express';
import { createStudentFee, getStudentFees, assignFeesByGrade, updateStudentFee, deleteStudentFee } from '../controllers/studentFeeController.js';

const router = Router();

router.get('/', getStudentFees);
router.post('/', createStudentFee);
router.post('/assign-by-grade', assignFeesByGrade);
router.put('/:id', updateStudentFee);
router.delete('/:id', deleteStudentFee);

export default router;

