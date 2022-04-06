const express = require('express');
const path = require('path');
const cors = require('cors');
const {Sequelize, DataTypes} = require('sequelize');
const multer = require('multer');
const config = require('./config');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3000;
const HOST = 'http://localhost:3000/';
const IMAGE_DIR = 'img';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, IMAGE_DIR));
    },
    filename: function (req, file, cb) {
        // todo date format
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({storage: storage});

// todo: router
// todo: other middleware?
// TODO remove obsolete images
// TODO post request
// todo: .ts

// Connecting to a database
const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql'
});

// todo: db table and column naming / model sync => timestamps
// todo: file structure

// Model definition
const User = sequelize.define('CustomModelNameWhenTableNameIsSet', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    first_name: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: false,
    tableName: 'users'
});

(async () => {
    // Testing the connection
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // start the server if success
        app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
        })
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

app.get('/', (req, res) => {
    res.send('Hello Hello Hello');
});

app.get('/api/users', async (req, res) => {
    // get all users
    if (!req.query.id) {
        const users = await User.findAll();
        console.log("All users:", JSON.stringify(users, null, 2));

        res.status(200).json(users);
        return;
    }

    // get single user
    const user = await User.findByPk(req.query.id);
    if (!user) {
        console.log('Not found!');
        res.status(400).send('400 Bad Request: Invalid user ID');
        return;
    }
    console.log('User:', user.toJSON());

    res.status(200).json(user);
});

app.put('/api/users', async (req, res) => {
    if (!req.body['id']) {
        res.status(400).send('400 Bad Request: Empty update info');
        return;
    }

    console.log('PUT /api/users request body:', req.body);

    const user = await User.findByPk(req.query.id);
    if (!user) {
        console.log('Not found!');
        res.status(400).send('400 Bad Request: Invalid user ID');
        return;
    }

    // 调用model.save()才会将set的数据发送到数据库，而update()会直接同步到数据库
    user.set({
        first_name: req.body['first_name'],
        last_name: req.body['last_name'],
        email: req.body['email']
    });
    await user.save();

    res.status(200).json(req.body);
});

app.post('/img', upload.single('avatar'), async (req, res, next) => {
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
    // await user.update({avatar: fileUrl});

    // todo why send() not working in the front-end?
    res.status(201).json(fileUrl);
    // res.status(201).send(fileUrl);
});

app.delete('/api/users', async (req, res) => {
    const user = await User.findByPk(req.query.id);
    if (!user) {
        console.log('Not found!');
        res.status(400).send('400 Bad Request: Invalid user ID');
        return;
    }
    await user.destroy();

    res.sendStatus(204);
})

// Serving static files
app.use('/img', express.static(IMAGE_DIR));

// 定义了跟静态文件服务器一样的地址
// app.get('/img/:name', (req, res, next) => {
//     const filePath = __dirname + req.url;
//     console.log('Get file from path:', filePath);
//
//     res.sendFile(filePath, (err) => {
//         if (err) {
//             // next(err); // pass error to default(built-in) or custom error handler
//             console.error(err.stack);
//             res.status(404).send('404 Not Found: No such file!');
//         } else {
//             console.log('Sent:', path.basename(filePath));
//         }
//     });
// });

app.get('/broken', (req, res) => {
    throw new Error('Broken!');
});

// Express默认返回404 Cannot GET /* 处理访问了不存在的路径，以下自定义了一个router middleware去处理404(自定义返回的内容形式)；
// => 其实可以用默认的功能然后交由前端处理
// 给前端看的，不是给用户看的，response里包含了所有信息 => 前端用router处理
app.use('/*', (req, res) => {
    res.status(404).send(`Page Not Found. Cannot ${req.method} ${req.originalUrl}`);
});

// 自定义错误处理函数
app.use((err, req, res, next) => {
    console.error('Internal Server Error:', err.stack);
    res.sendStatus(500);
});