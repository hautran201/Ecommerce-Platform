'use strict';

const { CREATED, SuccessReponse } = require('../core/success.response');
const AccessService = require('../services/access.service');

class AccessController {
    signUp = async (req, res, next) => {
        new CREATED({
            message: 'Sign Up Success',
            metadata: await AccessService.signUp(req.body),
        }).send(res);
    };
    login = async (req, res, next) => {
        new SuccessReponse({
            metadata: await AccessService.login(req.body),
        }).send(res);
    };

    logout = async (req, res, next) => {
        new SuccessReponse({
            message: 'Logout Success',
            metadata: await AccessService.logout(req.keyStore),
        }).send(res);
    };

    handlerRefreshToken = async (req, res, next) => {
        new SuccessReponse({
            message: 'Get Token Success',
            metadata: await AccessService.handlerRefreshToken({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore,
            }),
        }).send(res);
    };
}

module.exports = new AccessController();
