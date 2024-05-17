'use strict';

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require('./keytoken.service');
const { createTokenPair, verifyJWT } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const {
    BadRequestError,
    AuthFailureError,
    ForbiddenError,
} = require('../core/error.response');
const { findByEmail } = require('./shop.service');
const { OK } = require('../utils/statusCode');
const JWT = require('jsonwebtoken');

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITER: 'EDITER',
    ADMIN: 'ADMIN',
};

class AccessService {
    static signUp = async ({ name, email, password }) => {
        //step1: check email exists?
        const holderShop = await shopModel.findOne({ email }).lean();
        if (holderShop) {
            throw new BadRequestError('Error: Shop already registered!');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            roles: [RoleShop.SHOP],
        });

        if (newShop) {
            // create privateKey and publicKey

            const publicKey = crypto.randomBytes(64).toString('hex');
            const privateKey = crypto.randomBytes(64).toString('hex');
            //save conlection KeyStore
            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey,
            });

            if (!keyStore) {
                throw new BadRequestError('Error:: KeyStore error');
            }

            //create token pair
            const tokens = await createTokenPair(
                { userId: newShop._id, email },
                publicKey,
                privateKey
            );
            console.log('Created Token Success::', tokens);
            return {
                shop: getInfoData({
                    fileds: ['_id', 'name', 'email'],
                    object: newShop,
                }),
                tokens,
            };
        }
        return new OK({
            metadata: null,
        });
    };

    static login = async ({ email, password }) => {
        const foundShop = await findByEmail({ email });
        if (!foundShop) {
            throw new BadRequestError(' Shop not registered!');
        }
        console.log(foundShop.password);
        const match = await bcrypt.compare(password, foundShop.password);

        if (!match) {
            throw new AuthFailureError('Authenticate error');
        }

        const publicKey = crypto.randomBytes(64).toString('hex');
        const privateKey = crypto.randomBytes(64).toString('hex');
        //create token pair
        const tokens = await createTokenPair(
            { userId: foundShop._id, email },
            publicKey,
            privateKey
        );
        //save conlection KeyStore
        const keyStore = await KeyTokenService.createKeyToken({
            userId: foundShop._id,
            publicKey,
            privateKey,
            refreshToken: tokens.refreshToken,
        });
        if (!keyStore) {
            throw new BadRequestError('Error:: KeyStore error');
        }

        return {
            shop: getInfoData({
                fileds: ['_id', 'name', 'email'],
                object: foundShop,
            }),
            tokens,
        };
    };

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeTokenByUserId(keyStore._id);
        console.log(delKey);
        return delKey;
    };

    //check this token used
    static handlerRefreshToken = async ({ refreshToken, user, keyStore }) => {
        const { userId, email } = user;

        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyByUserId(userId);

            throw new ForbiddenError(
                'Something wrong happened! Please relogin.'
            );
        }

        if (keyStore.refreshToken !== refreshToken) {
            throw new AuthFailureError('Shop not registered!');
        }

        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new AuthFailureError('Shop not registered! 2');

        const tokens = await createTokenPair(
            { userId, email },
            keyStore.publicKey,
            keyStore.privateKey
        );

        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken, //Used to get new tokens
            },
        });

        return {
            user: { userId, email },
            tokens,
        };
    };
}

module.exports = AccessService;
