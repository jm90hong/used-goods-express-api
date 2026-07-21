import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import bcrypt from 'bcrypt';
import axios from 'axios';

const prisma = new PrismaClient();


export const createTossPayment = async (req: Request, res: Response) : Promise<Response> => {
    const { paymentKey, orderId, amount } = req.body;

    // 필수 파라미터 누락 검증
    if (!paymentKey || !orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: '필수 파라미터(paymentKey, orderId, amount)가 누락되었습니다.',
      });
    }
  
    try {
      /* [보안 및 위변조 방지 팁]
       * 실제 서비스 구현 시, 아래 주석처럼 DB 조회를 통해 주문 금액을 검증하세요.
       * const order = await findOrderById(orderId);
       * if (order.amount !== Number(amount)) {
       *   return res.status(400).json({ message: '결제 금액이 위변조되었습니다.' });
       * }
       */
  
      // 1. 토스 API 인증 헤더 생성 (Basic Auth)
      const secretKey = process.env.TOSS_SECRET_KEY!;
      const encryptedSecretKey = Buffer.from(`${secretKey}:`).toString('base64');
  
      // 2. 토스페이먼츠 결제 승인 API 호출
      const response = await axios.post(
        'https://api.tosspayments.com/v1/payments/confirm',
        {
          paymentKey,
          orderId,
          amount,
        },
        {
          headers: {
            Authorization: `Basic ${encryptedSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      const paymentData = response.data;
  
      /* [DB 처리]
       * 결제 승인 정보를 데이터베이스에 저장합니다.
       * await savePaymentResult(orderId, paymentData);
       */
  
      // 3. 성공 응답 반환
      return res.status(200).json({
        success: true,
        data: paymentData,
      });
    } catch (error: any) {
      console.error('결제 승인 오류:', error.response?.data || error.message);
  
      const errorMessage =
        error.response?.data?.message || '결제 승인 중 오류가 발생했습니다.';
      const statusCode = error.response?.status || 500;
  
      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
}