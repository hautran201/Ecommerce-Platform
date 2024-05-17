'use strict';

const { findById } = require('../services/apikey.service');

const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization',
};
const apiKey = async (req, res, next) => {
    try {
        const key = req.headers[HEADER.API_KEY]?.toString();
        console.log(key);
        if (!key) {
            return res.status(403).json({
                message: 'Forbidden Error',
            });
        }
        const objKey = await findById(key);
        if (!objKey) {
            return res.status(403).json({
                message: 'Forbidden Error',
            });
        }

        req.objKey = objKey;
        return next();
    } catch (error) {
        console.log(error);
    }
};

const permission = (permission) => {
    return (req, res, next) => {
        if (!req.objKey.permissions) {
            return res.status(403).json({
                message: 'Permission Denied',
            });
        }
        console.log('Permission ::', req.objKey.permissions);
        const validPerission = req.objKey.permissions.includes(permission);
        if (!validPerission) {
            return res.status(403).json({
                message: 'Permission Denied',
            });
        }
        return next();
    };
};

module.exports = {
    apiKey,
    permission,
};
