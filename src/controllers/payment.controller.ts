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

        const result = await prisma.$transaction(async (tx) => {
            //user_idx 가 존재하는지 확인
            const user = await tx.user.findUnique({
                where: {
                    idx: Number(user_idx),
                },
            });
            if(!user){
                throw new Error('사용자가 존재하지 않습니다.');
            }

            //item_idx 가 존재하는지 확인
            const item = await tx.item.findUnique({
                where: {
                    idx: Number(item_idx),
                },
            });
            if(!item){
                throw new Error('상품이 존재하지 않습니다.');
            }

            //회원 point가 상품 price보다 적은지 확인
            if(user.point < item.price){
                throw new Error('회원 point가 상품 price보다 적습니다.');
            }

            //회원 point 차감
            const updatedUser = await tx.user.update({
                where: {
                    idx: Number(user_idx),
                },
                data: {
                    point: user.point - item.price,
                },
            });

            //결제 요청 payment 생성
            const payment = await tx.payment.create({
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

            return {
                remaining_point: updatedUser.point,
                payment: payment,
            };
        });

        return res.status(200).json({
            success: true,
            message: '결제 요청 완료',
            data: result,
            
        });
    }
    catch(error){
        if(error instanceof Error){
            const clientErrors = [
                '사용자가 존재하지 않습니다.',
                '상품이 존재하지 않습니다.',
                '회원 point가 상품 price보다 적습니다.',
            ];
            if(clientErrors.includes(error.message)){
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
        }

        console.error('내부 서버 에러(관리자에게 문의)', error);
        return res.status(500).json({
            success: false,
            message: '내부 서버 에러(관리자에게 문의)',
        });
    }
}
