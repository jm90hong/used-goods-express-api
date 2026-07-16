import { Router } from 'express';   
import { createUser, getUsers, login } from '../controllers/user.controller';


const router = Router();


router.get('/list', getUsers);
router.post('/create', createUser);
router.post('/login', login);


export default router;