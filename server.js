const express = require('express');
const cors = require('cors');
const db = require("./db");
const apiUsersRouter = require('./routes/apiUsers');
const imgRouter = require('./routes/img');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// todo: .ts

(async () => {
    // This checks what is the current state of the table in the database
    // (which columns it has, what are their data types, etc),
    // and then performs the necessary changes in the table to make it match the model.
    await db.sync({alter: true});
    // Testing the connection
    try {
        await db.authenticate();
        console.log('Connection has been established successfully.');

        // start the server if success
        app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
        })
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

app.use('/api/users', apiUsersRouter);
app.use('/img', imgRouter);

app.get('/broken', () => {
    throw new Error('Broken!');
});

// Express默认返回404 Cannot GET /* 处理访问了不存在的路径，以下自定义了一个router middleware去处理404(自定义返回的内容形式)；
// => 其实可以用默认的功能然后交由前端处理
// 给前端看的，不是给用户看的，response里包含了所有信息 => 前端用router处理
app.use('/*', (req, res) => {
    res.status(404).send(`Page Not Found. Cannot ${req.method} ${req.originalUrl}`);
});

// 自定义错误处理函数 => express有built-in的errorHandler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});