import { Router } from 'express';   
import { createUser, getUsers } from '../controllers/user.controller';


const router = Router();


router.get('/all', getUsers);
router.post('/create', createUser);


export default router;