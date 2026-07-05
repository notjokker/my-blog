import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('只允许上传图片文件'));
  }
});

const router = Router();

router.post('/', upload.single('image'), (req: any, res: Response) => {
  if (!req.file) return res.status(400).json({ error: '没有选择文件' });
  const url = '/uploads/' + req.file.filename;
  res.status(201).json({ url });
});

export default router;