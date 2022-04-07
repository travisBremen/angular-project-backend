const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require('../models/user');

const HOST = 'http://localhost:3000/';
const IMAGE_DIR = 'img';
const LOCAL_IMG_DIR = path.join(__dirname, '../',IMAGE_DIR);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, LOCAL_IMG_DIR);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({storage: storage});

router.post('/', upload.single('avatar'), async (req, res, next) => {
    console.log('POST /img req file:', req.file);

    const userId = req.query.id;
    const user = await User.findByPk(userId);
    if (!user) {
        console.log('Not found!');
        res.status(400).send('400 Bad Request: Invalid user ID');
        return;
    }

    const file = req.file;
    if (!file) {
        // const error = new Error('Please upload a file');
        // error.httpStatusCode = 400;
        // return next(error);
        console.log('Invalid file');
        res.status(400).send('400 Bad Request: Invalid file');
        return;
    }

    // TODO: 没有HOST的话默认是前端地址而不是后端？ 前端的avatar是直接放在img src里的
    let fileUrl = HOST + IMAGE_DIR + '/' + file.filename;

    // persistence
    await user.update({avatar: fileUrl});

    // todo why send() not working in the front-end?
    res.status(201).json(fileUrl);
    // res.status(201).send(fileUrl);
});

// Serving static files
// router.use('/img', express.static(IMAGE_DIR));

// 定义了跟静态文件服务器一样的地址
router.get('/:name', (req, res, next) => {
    const filePath = LOCAL_IMG_DIR + req.url;
    console.log('Get file from path:', filePath);

    res.sendFile(filePath, (err) => {
        if (err) {
            // next(err); // pass error to default(built-in) or custom error handler
            console.error(err.stack);
            res.status(404).send('404 Not Found: No such file!');
        } else {
            console.log('Sent:', path.basename(filePath));
        }
    });
});

module.exports = router;