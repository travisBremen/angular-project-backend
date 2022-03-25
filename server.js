const express = require('express');
const cors = require('cors');
const _ = require('lodash');
const userList = require('./users');

const app = express()
const port = 3000
const users = userList.data;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello Hello Hello');
})

// app.get('/api/users', (req, res) => {
//     res.status(200).json(users);
// })

app.get('/api/users', (req, res) => {
    if (!req.query.id) {
        res.status(200).json(users);
        return;
    }

    const userId = req.query.id;

    let user = _.find(users, {id: Number(userId)});
    if (!user) {
        res.status(400).send('400 Bad Request: Invalid user ID');
        return;
    }

    res.status(200).json(user);
})

app.put('/api/users', (req, res) => {
    if (!req.body['id']) {
        res.status(400).send('400 Bad Request: Empty update info');
        return;
    }

    const userId = req.query.id;

    let user = _.find(users, {id: Number(userId)});
    if (!user) {
        res.status(400).send('400 Bad Request: Invalid user ID');
        return;
    }

    // todo: update user in db
    res.status(200).json(req.body);
})

app.delete('/api/users', (req, res) => {
    const userId = req.query.id;

    let user = _.find(users, {id: Number(userId)});
    if (!user) {
        res.status(400).send('400 Bad Request: Invalid user ID');
        return;
    }

    res.sendStatus(204);
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