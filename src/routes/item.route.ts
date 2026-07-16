import { Router } from 'express';   
import { createItem } from '../controllers/item.controllet';



const router = Router();


router.post('/create', createItem);



export default router;