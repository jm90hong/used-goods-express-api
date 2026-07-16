import { Router } from 'express';   
import { createItem, getItems } from '../controllers/item.controllet';



const router = Router();


router.post('/create', createItem);
router.get('/list', getItems);



export default router;