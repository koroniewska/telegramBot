const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'telegram-bog',
    'root',
    'root',
    {
        host: '',
        port: '',
        dialect: 'postgres'
    }
)