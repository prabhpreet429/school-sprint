import { Router } from 'express';
import { createResult, getResults, updateResult, deleteResult } from '../controllers/resultController.js';

const router = Router();

router.get('/', getResults);
router.post('/', createResult);
router.put('/:id', updateResult);
router.delete('/:id', deleteResult);

export default router;

