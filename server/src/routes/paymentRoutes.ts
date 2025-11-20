import { Router } from 'express';
import { createPayment, getPayments, updatePayment, deletePayment } from '../controllers/paymentController.js';

const router = Router();

router.get('/', getPayments);
router.post('/', createPayment);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

export default router;

