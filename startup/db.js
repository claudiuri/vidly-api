const config  = require('config');
const winston = require('winston');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async function () {
    let db = process.env.DB || config.get('db');

    if (process.env.NODE_ENV === 'test') {
        const mongod = new MongoMemoryServer();

        db = await mongod.getConnectionString()

        console.log(db);
    }

    mongoose.connect(db, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
        .then(() => winston.info(`Connected to ${db}...`))
}