'use strict';

const _ = require('lodash');
const getInfoData = ({ fileds = [], object = {} }) => {
    return _.pick(object, fileds);
};

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map((el) => [el, 1]));
};

const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map((el) => [el, 0]));
};

const removeUndefinedObject = (obj) => {
    Object.keys(obj).forEach((key) => {
        if (obj[key] == null) {
            delete obj[key];
        }
    });
    return obj;
};

const updateNestedObjectParser = (obj) => {
    console.log('1::: ', obj);
    const final = {};
    removeUndefinedObject(obj);
    Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            const response = updateNestedObjectParser(obj[key]);
            Object.keys(response).forEach((keyChild) => {
                final[`${key}.${keyChild}`] = response[keyChild];
            });
        } else {
            final[key] = obj[key];
        }
    });

    console.log('2::: ', final);
    return final;
};

module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeUndefinedObject,
    updateNestedObjectParser,
};
