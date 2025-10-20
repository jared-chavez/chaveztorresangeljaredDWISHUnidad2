import { Router } from 'express';
import { listNews, getNewsById, createNews, updateNews, deleteNews, getNewsImage, updateNewsImage, deleteNewsImage } from '../controllers/newsController';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', listNews);
router.get('/:id', getNewsById);
router.get('/:id/image', getNewsImage);
router.put('/:id/image', upload.single('image'), updateNewsImage);
router.delete('/:id/image', deleteNewsImage);
router.post('/', upload.single('image'), createNews);
router.put('/:id', upload.single('image'), updateNews);
router.delete('/:id', deleteNews);

export default router;


