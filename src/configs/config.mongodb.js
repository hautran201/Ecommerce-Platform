const dev = {
    app: {
        port: process.env.DEV_APP_PORT || 3000,
    },
    db: {
        host: process.env.DEV_DB_HOST || 'localhost',
        port: process.env.DEV_DB_PORT || 27017,
        name: process.env.DEV_DB_NAME || 'ecommerce-dev',
    },
};

const prod = {
    app: {
        port: process.env.PROD_APP_PORT,
    },
    db: {
        uri: process.env.MONGODB_URI,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        },
    },
};

const config = { dev, prod };
const env = process.env.NODE_ENV || 'dev';

module.exports = config[env];
