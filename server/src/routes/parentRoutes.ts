import { Router } from 'express';
import { createParent, getParents } from '../controllers/parentController.ts';

const router = Router();

// Route to get all parents with optional search
router.get('/', getParents);

// Route to create a new parent
router.post('/', createParent);

export default router;

