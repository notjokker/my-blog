import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

// 设置存储位置和文件名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 限制 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('只允许上传图片文件 (jpeg, jpg, png, gif, webp)'));
  }
});

const router = Router();

// 上传图片接口（需登录）
router.post('/', upload.single('image'), (req: any, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有选择文件' });
  }
  // 返回可访问的 URL
  const url = '/uploads/' + req.file.filename;
  res.status(201).json({ url });
});

export default router;