"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '..', '..', '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const extname = allowed.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowed.test(file.mimetype);
        if (mimetype && extname)
            return cb(null, true);
        cb(new Error('只允许上传图片文件'));
    }
});
const router = (0, express_1.Router)();
router.post('/', upload.single('image'), (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: '没有选择文件' });
    const url = '/uploads/' + req.file.filename;
    res.status(201).json({ url });
});
exports.default = router;
//# sourceMappingURL=upload.routes.js.map