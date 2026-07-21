import { Router } from 'express';  
import { createTossPayment } from '../controllers/toss.controller';

const router = Router();


router.post('/create', createTossPayment);


export default router;