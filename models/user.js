const sequelize = require('../db');
const {DataTypes} = require('sequelize');

// Model definition
const User = sequelize.define('CustomModelNameWhenTableNameIsSet', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    lastName: {
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
    tableName: 'users',
    underscored: true // set the field option on all attributes to the snake_case version of its name
});

module.exports = User;