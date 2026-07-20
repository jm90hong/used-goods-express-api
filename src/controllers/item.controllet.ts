//item.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import bcrypt from 'bcrypt';
import axios from 'axios';

const prisma = new PrismaClient();


//bigint serializer 에러 바로 bigint 를 문자로 리턴 함수 세팅
(BigInt.prototype as any).toJSON = function() {
    return this.toString();
};

//idx로 상품 조회
export const getItemByIdx = async (req: Request, res: Response) : Promise<Response> => {
    try{
        const {idx} = req.params;

        const item = await prisma.item.findUnique({
            where: {
                idx: Number(idx),
            },
            include: {
                user: true,
            },
        });
        
        return res.status(200).json({
            success: true,
            message: '상품 조회 완료',
            data: item,
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




//item 조회 pagination
export const getItems = async (req: Request, res: Response) : Promise<Response> => {
    try{
        const {page=1, limit=10, search_word='', order='desc' as 'asc' | 'desc' } = req.query;


        var whereCondition: any = {};

        if(search_word != ''){
            whereCondition.name = {
                contains: search_word as string,
            };
        }
        
        //pagination 계산
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const items = await prisma.item.findMany({
            skip : skip,
            take : take,
            orderBy: {
                idx: order as 'asc' | 'desc',
            },
            where: whereCondition,
            include: {
                user: true,
            },
        });

        return res.status(200).json({
            success: true,
            message: '상품 조회 완료',
            data: items,
        });
    }catch(error){
        console.error('내부 서버 에러(관리자에게 문의)', error);
        return res.status(500).json({
            success: false,
            message: '내부 서버 에러(관리자에게 문의)',
        });
    }
}


//상품 등록 요청
export const createItem = async (req: Request, res: Response) : Promise<Response> => {
    try{
        const {user_idx, item_img_url, name, price, description } = req.body;


        //유효성 검사
        if(!user_idx || !item_img_url || !name || !price || !description){
            return res.status(400).json({
                success: false,
                message: '필수 입력 항목이 누락되었습니다.',
            });
        }

        //user_idx 가 존재하는지 확인
        const user = await prisma.user.findUnique({
            where: {
                idx: user_idx,
            },
        });
        
        if(!user){
            return res.status(400).json({
                success: false,
                message: '존재하지 않는 사용자입니다.',
            });
        }


        //상품 등록
        const item = await prisma.item.create({
            data: {
                img_url: item_img_url,
                name,
                price,
                description,
                created_at: new Date(),

                //외래키는 connect 로 insert
                user: {
                    connect: {
                        idx: user_idx,
                    },
                },
            },
        });

        return res.status(200).json({
            success: true,
            message: '상품 등록 완료',
            data: item,
        })

    }catch(error){
        console.error('내부 서버 에러(관리자에게 문의)', error);
        return res.status(500).json({
            success: false,
            message: '내부 서버 에러(관리자에게 문의)',
        });
    }
}