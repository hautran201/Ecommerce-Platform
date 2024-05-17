'use strict';

const { default: mongoose } = require('mongoose');
const { countConnect } = require('../helpers/check.connect');
const {
    db: { host, port, name },
} = require('../configs/config.mongodb');
const connectString = `mongodb://${host}:${port}/${name}`;

class Database {
    constructor() {
        this.connect();
    }

    connect(type = 'mongodb') {
        if (1 === 1) {
            mongoose.set('debug', true);
            mongoose.set('debug', { color: true });
        }

        mongoose
            .connect(connectString)
            .then(() => {
                console.log('Database connect successful.');
                countConnect();
            })
            .catch(() => {
                console.log('Failed connect to Database');
            });
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
