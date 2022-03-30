const express = require('express');
const cors = require('cors');
const {Sequelize, DataTypes} = require('sequelize');
const config = require('./config');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Connecting to a database
const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql'
});

// todo: db table and column naming
// todo: db design, relationship
// todo: file structure
// todo: avatar column: jpg / file storage

// Model definition
const User = sequelize.define('User', {
    id : {
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
        allowNull: false
    }
}, {
    timestamps: false
});

(async () => {
    // Testing the connection
    try {
        // await sequelize.authenticate();
        // console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

    // todo: Model synchronization
})();

app.get('/', (req, res) => {
    res.send('Hello Hello Hello');
})

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
    const userId = req.query.id;
    const user = await User.findByPk(userId);
    if (!user) {
        console.log('Not found!');
        res.status(400).send('400 Bad Request: Invalid user ID');
        return;
    }
    console.log('User:', user.toJSON());

    res.status(200).json(user);
})

app.put('/api/users', async (req, res) => {
    if (!req.body['id']) {
        res.status(400).send('400 Bad Request: Empty update info');
        return;
    }

    const userId = req.query.id;
    console.log(req.body);
    const user = await User.findByPk(userId);
    if (!user) {
        console.log('Not found!');
        res.status(400).send('400 Bad Request: Invalid user ID');
        return;
    }

    // todo: 这里看不到吗？ Executing (default):
    //  UPDATE `Users` SET `first_name`=?,`last_name`=?,`email`=? WHERE `id` = ?
    user.set({
        first_name: req.body['firstName'],
        last_name: req.body['lastName'],
        email: req.body['email']
    });
    await user.save();

    res.status(200).json(req.body);
})

// todo: post

app.delete('/api/users', async (req, res) => {
    const userId = req.query.id;
    const user = await User.findByPk(userId);
    if (!user) {
        console.log('Not found!');
        res.status(400).send('400 Bad Request: Invalid user ID');
        return;
    }
    await user.destroy();

    res.sendStatus(204);
})

app.get('/broken', (req, res) => {
    throw new Error('Broken!');
});

app.use('/*', (req, res) => {
    res.status(404).send(`404 Not Found. Cannot ${req.method} ${req.originalUrl}`);
});

// Express 的自定义错误处理函数
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.sendStatus(500);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})