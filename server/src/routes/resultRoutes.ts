import { Router } from 'express';
import { createResult, getResults, updateResult, deleteResult } from '../controllers/resultController.js';
import { verifyToken } from '../controllers/authController.js';

const router = Router();

router.get('/', getResults);
router.post('/', verifyToken, createResult);
router.put('/:id', updateResult);
router.delete('/:id', deleteResult);

export default router;

