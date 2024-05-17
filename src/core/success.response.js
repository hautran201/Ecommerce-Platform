'use strict';

const { StatusCode, ReasonPhrases } = require('../utils/httpStatusCode');

class SuccessReponse {
    constructor({
        message,
        statusCode = StatusCode.OK,
        reasonStatusCode = ReasonPhrases.OK,
        metadata = {},
    }) {
        this.message = !message ? reasonStatusCode : message;
        this.status = statusCode;
        this.metadata = metadata;
    }
    send(res, headers = {}) {
        return res.status(this.status).json(this);
    }
}

class OK extends SuccessReponse {
    constructor({ message, metadata }) {
        super(message, metadata);
    }
}

class CREATED extends SuccessReponse {
    constructor({
        options = {},
        message,
        statusCode = StatusCode.CREATED,
        reasonStatusCode = ReasonPhrases.CREATED,
        metadata = {},
    }) {
        super({ message, statusCode, reasonStatusCode, metadata });
        this.options = options;
    }
}

module.exports = {
    SuccessReponse,
    OK,
    CREATED,
};
