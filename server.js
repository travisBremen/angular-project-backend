const express = require('express');
const path = require('path');
const cors = require('cors');
const {Sequelize, DataTypes} = require('sequelize');
const config = require('./config');
const fs = require('fs');
const mime = require('mime-types');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Connecting to a database
const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql'
});

// todo: db table and column naming / model sync => timestamps
// todo: file structure
// todo: avatar column: jpg / file storage

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
        get() {
            // todo 将数据库column "avatar"的索引数据转换成服务器的文件路径
            // TODO 为什么返回的路径是两个斜杠 //
            let fileName = this.getDataValue('avatar') + '.jpg';
            return path.join(__dirname, 'img', fileName);
        }
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
        app.listen(port, () => {
            console.log(`Listening on port ${port}`);
        })
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

app.get('/', (req, res) => {
    res.send('Hello Hello Hello');
});

// todo: .ts
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
    // todo: 这里看不到吗？ Executing (default): UPDATE `Users` SET `first_name`=?,`last_name`=?,`email`=? WHERE `id` = ?
    await user.save();

    res.status(200).json(req.body);
});

app.put('/img', async (req, res) => {
    console.log('PUT /img request body:', req.body);

    const userId = req.query.id
    const user = await User.findByPk(userId);
    if (!user) {
        console.log('Not found!');
        res.status(400).send('400 Bad Request: Invalid user ID');
        return;
    }

    const contentType = req.headers['content-type'];
    console.log('Request body content-type:', contentType);

    const extension = mime.extension(contentType);
    if (extension !== 'jpeg' && extension !== 'png' && extension !== 'gif') {
        console.log('Invalid request body type!');
        res.status(400).send('400 Bad Request: Invalid request body type');
        return;
    }

    // TODO 这里extension都统一存储成jpg格式，不然在img endpoint很难获取各自的格式
    const filePath = './img/' + userId + '.jpg';
    // const filePath = './img/' + userId + '.' + extension;
    let writeStream = fs.createWriteStream(filePath);
    req.pipe(writeStream);

    req.on('end', () => {
        console.log('Persist image file to path:', filePath);
        user.update({avatar: userId.toString()});

        // TODO 返回status code还是文件？
        res.sendStatus(200);
    });

    writeStream.on('error', (err) => {
        console.error(err.stack);
    });
});

// todo: post

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

// todo: router
// todo: other middleware?

app.get('/img/:name', (req, res, next) => {
    const fileName = req.params.name;

    // TODO 是用这个本地绝对路径吗 => __dirname还是localhost
    // const filePath = path.join(__dirname, 'img', fileName);
    const filePath = __dirname + req.url;
    console.log('Get file from path:', filePath);

    // TODO 定义url / filePath 要不要带文件格式 => 都可以，跟avatar的getter统一就行

    // TODO 同步异步？
    res.sendFile(filePath, (err) => {
        if (err) {
            // next(err);
            console.error(err.stack);
            // TODO 400还是404呢？
            res.status(400).send('Bad Request: No such file!');
        } else {
            console.log('Sent:', fileName);
        }
    });
});

app.get('/broken', (req, res) => {
    throw new Error('Broken!');
});

// 给前端看的，不是给用户看的，response里包含了所有404的信息
// TODO 如果访问url是前端没有定义的呢？或者是直接访问url呢？
//  => 服务器返回的页面？
app.use('/*', (req, res) => {
    res.status(404).send(`Page Not Found. Cannot ${req.method} ${req.originalUrl}`);
});

// Express 的自定义错误处理函数
app.use((err, req, res, next) => {
    console.error('Internal Server Error:', err.stack);
    res.sendStatus(500);
});