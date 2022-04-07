const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/', async (req, res) => {
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

router.put('/', async (req, res) => {
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
        firstName: req.body['firstName'],
        lastName: req.body['lastName'],
        email: req.body['email']
    });
    await user.save();

    res.status(200).json(user);
});

router.delete('/', async (req, res) => {
    const user = await User.findByPk(req.query.id);
    if (!user) {
        console.log('Not found!');
        res.status(400).send('400 Bad Request: Invalid user ID');
        return;
    }
    await user.destroy();

    res.sendStatus(204);
})

module.exports = router;