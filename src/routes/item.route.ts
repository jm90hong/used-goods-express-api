import { Router } from 'express';   
import { createItem, getItemByIdx, getItems } from '../controllers/item.controllet';



const router = Router();

//상품 생성
router.post('/create', createItem);

//상품 목록 조회
router.get('/list', getItems);

//상품 상세 조회
router.get('/:idx', getItemByIdx);



export default router;