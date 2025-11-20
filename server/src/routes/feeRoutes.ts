import { Router } from 'express';
import { createFee, getFees, updateFee, deleteFee } from '../controllers/feeController.js';

const router = Router();

router.get('/', getFees);
router.post('/', createFee);
router.put('/:id', updateFee);
router.delete('/:id', deleteFee);

export default router;

