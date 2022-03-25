const bodyParser = require('body-parser')
const express = require('express');
const cors = require('cors');
const userList = require('./users');

const app = express()
const port = 3000
const users = userList.data;

// app.use(express.json());
app.use(bodyParser.json());

app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello Hello Hello');
})

app.get('/api/users', (req, res) => {
    res.status(200).json(users);
})

app.get('/api/users/:userId', (req, res) => {
    const userId = req.params.userId;
    for (let user of users) {
        if (user.id.toString() === userId) {
            res.status(200).json(user);
            return;
        }
    }

    res.status(400).send('400 Bad Request: Invalid user ID');
})

app.put('/api/users/:userId', (req, res) => {
    if (!req.body['id']) {
        res.status(400).send('400 Bad Request: Empty update info');
        return;
    }

    let targetUsers = users.filter(user => user.id === req.body.id);
    if (targetUsers.length !== 1) {
        res.status(400).send('400 Bad Request: Invalid user ID');
        return;
    }

    // todo: update user in db
    res.status(200).json(req.body);
})

//todo: query
app.delete('/api/users/:userId', (req, res) => {
    const userId = req.params.userId;
    for (let user of users) {
        if (user.id.toString() === userId) {
            res.sendStatus(204);
            return;
        }
    }

    res.status(400).send('400 Bad Request: Invalid user ID');
})

app.get('/broken', (req, res) => {
    throw new Error('Broken!');
});

app.use('*', (req, res) => {
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