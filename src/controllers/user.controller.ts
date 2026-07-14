//user.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import bcrypt from 'bcrypt';
import axios from 'axios';

const prisma = new PrismaClient();


//bigint serializer 에러 바로 bigint 를 문자로 리턴 함수 세팅
(BigInt.prototype as any).toJSON = function() {
    return this.toString();
};



//로그인 (아이디, 비밀번호 확인)
export const login = async (req: Request, res: Response) : Promise<Response> => {
    try{
        const { id, pw } = req.body;

        //유효성 검사
        if(!id || !pw){
            return res.status(400).json({
                success: false,
                message: '아이디와 비밀번호를 입력해주세요.',
                error: 'id, pw 필수 입력'
            });
        }

        //id로 회원 조회
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        });
        
        if(!user){
            return res.status(400).json({
                success: false,
                message: '존재하지 않는 아이디입니다.',
                error: 'id 또는 pw 오류',
                errorCode: 'id'
            });
        }

        //비밀번호 확인
        const isPasswordValid = await bcrypt.compare(pw, user.pw);
        console.log(isPasswordValid);
        if(!isPasswordValid){
            return res.status(400).json({
                success: false,
                message: '비밀번호가 일치하지 않습니다.',
                error: 'id 또는 pw 오류',
                errorCode: 'pw'
            });
        }

        
        //user 에서 pw 제외 하고 리턴
        const { pw: string, ...userWithoutPw } = user;
        
        return res.status(200).json({
            success: true,
            message: '로그인 성공',
            data: userWithoutPw
        });



    }catch(error){
        console.error('내부 서버 에러(관리자에게 문의)', error);
        return res.status(500).json({
            success: false,
            message: '내부 서버 에러(관리자에게 문의)',
            error: error
        });
    }
};




//회원 가입
export const createUser = async (req: Request, res: Response) : Promise<Response> => {
   try{

    const { id, pw, nick, address1, address2, point=0 } = req.body;
    

    //유효성 검사
    if(!id || !pw || !nick || !address1){
        return res.status(400).json({
            success: false,
            message: '회원 가입 실패 유효성 검사 실패',
            error: 'id, pw, nick, address1 필수 입력'
        });
    }


    //id 중복 체크
    const existingUser = await prisma.user.findUnique({
        where: {
            id: id
        }
    });
    if(existingUser){
        return res.status(400).json({
            success: false,
            message: '이미 가입된 아이디가 존재합니다.',
            error: 'id 중복'
        });
    }


    //nick 중복 체크
    const existingNick = await prisma.user.findUnique({
        where: {
            nick: nick
        }
    });

    if(existingNick){
        return res.status(400).json({
            success: false,
            message: '이미 가입된 닉네임이 존재합니다.',
            error: 'nick 중복'
        });
    }


    //pw 암호화
    const hashedPw = await bcrypt.hash(pw, 10);


    //kakao location 위도 경도 조회
    const kakaoLocation = await axios.get(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${address1}`,
        {
            headers: {
                Authorization: `KakaoAK f56155d970a622e8b173c4d82e9ca94e`
            }
        }
    );
    const latitude = kakaoLocation.data.documents[0].y; //위도
    const longitude = kakaoLocation.data.documents[0].x; //경도

   

    const user = await prisma.user.create({
        data: {
            id, 
            pw:hashedPw, 
            nick, 
            address1,
            address2, 
            point, 
            created_at: new Date(),
            lat: Number(latitude),
            lng: Number(longitude)
        }
    });

    return res.status(200).json({
        success: true,
        message: '회원 가입 성공',
        data: user
    });

   }catch(error){
    console.error('내부 서버 에러(관리자에게 문의)', error);
    return res.status(500).json({
        success: false,
        message: '내부 서버 에러(관리자에게 문의)',
        error: error
    });
   }
};




//회원 전체 조회
export const getUsers = async (req: Request, res: Response) : Promise<Response> => {
    const users = await prisma.user.findMany();
    return res.json(users);
};