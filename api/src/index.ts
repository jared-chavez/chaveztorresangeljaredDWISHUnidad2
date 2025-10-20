import express, { Request, Response } from 'express';
import cors from 'cors';
import newsRoutes from './routes/newsRoutes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/news', newsRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

// Global error handler (e.g., multer invalid file type)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: any) => {
  if (err && err.message === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ message: 'Only PNG, JPEG and WEBP images are allowed' });
  }
  return res.status(500).json({ message: 'Internal Server Error' });
});


