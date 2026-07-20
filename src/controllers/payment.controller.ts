//payment.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();


//bigint serializer 에러 바로 bigint 를 문자로 리턴 함수 세팅
(BigInt.prototype as any).toJSON = function() {
    return this.toString();
};



//결제 요청 payment 생성
export const createPayment = async (req: Request, res: Response) : Promise<Response> => {
    try{
        const {user_idx, item_idx} = req.body;

        const payment = await prisma.payment.create({
            data: {
                created_at: new Date(),
                user: {
                    connect: {
                        idx: Number(user_idx),
                    },
                },
                item: {
                    connect: {
                        idx: Number(item_idx),
                    },
                },
            },
            
        });


        return res.status(200).json({
            success: true,
            message: '결제 요청 완료',
            data: payment,
        });
    }
    catch(error){
        console.error('내부 서버 에러(관리자에게 문의)', error);
        return res.status(500).json({
            success: false,
            message: '내부 서버 에러(관리자에게 문의)',
        });
    }
}
