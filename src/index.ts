import 'dotenv/config';
import express, { Request, Response } from 'express';
import userRoutes from './routes/user.route';
import itemRoutes from './routes/item.route';
import paymentRoutes from './routes/payment.route';
import cors from 'cors';

const app = express();
const port = 5000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//라우터 등록
app.use('/api/user', userRoutes);
app.use('/api/item', itemRoutes);
app.use('/api/payment', paymentRoutes);



app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '서버 상태 정상',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



