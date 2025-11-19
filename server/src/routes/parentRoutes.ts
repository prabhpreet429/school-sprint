import { Router } from 'express';
import { createParent, getParents, updateParent, deleteParent } from '../controllers/parentController.ts';

const router = Router();

// Route to get all parents with optional search
router.get('/', getParents);

// Route to create a new parent
router.post('/', createParent);

// Route to update a parent
router.put('/:id', updateParent);

// Route to delete a parent
router.delete('/:id', deleteParent);

export default router;

