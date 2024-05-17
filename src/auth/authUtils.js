'use strict';

const JWT = require('jsonwebtoken');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const asyncHandler = require('../helpers/asyncHandler');
const { findByUserId } = require('../services/keytoken.service');
const HEADER = {
    API_KEY: 'x-api-key',
    X_CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id',
};
const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        //access token
        const accessToken = JWT.sign(payload, publicKey, {
            expiresIn: '2 days',
        });

        //refresh token
        const refreshToken = JWT.sign(payload, privateKey, {
            expiresIn: '7 days',
        });

        JWT.verify(accessToken, publicKey, (err, decoded) => {
            if (err) {
                console.error(`verify error::`, err);
            } else {
                console.log(`verify decoded::`, decoded);
            }
        });
        JWT.verify(refreshToken, privateKey, (err, decoded) => {
            if (err) {
                console.error(`verify error::`, err);
            } else {
                console.log(`verify decoded::`, decoded);
            }
        });
        return { accessToken, refreshToken };
    } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
    const userId = req.headers[HEADER.X_CLIENT_ID];
    if (!userId) throw new AuthFailureError('Invalid Request');

    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError('Not found keyStore');

    const refreshToken = req.headers[HEADER.REFRESHTOKEN];
    if (refreshToken) {
        try {
            const decodedUser = JWT.verify(refreshToken, keyStore.privateKey);
            if (userId !== decodedUser.userId)
                throw new AuthFailureError('Invalid userId');
            req.refreshToken = refreshToken;
            req.user = decodedUser;
            req.keyStore = keyStore;
            return next();
        } catch (error) {
            throw error;
        }
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError('Invalid Request');

    try {
        const decodedUser = JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodedUser.userId)
            throw new AuthFailureError('Invalid userId');
        req.keyStore = keyStore;
        req.user = decodedUser;
        return next();
    } catch (error) {
        throw error;
    }
});

const verifyJWT = async (token, keySecret) => {
    console.log(token + '+' + keySecret);
    return JWT.verify(token, keySecret);
};

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
};
