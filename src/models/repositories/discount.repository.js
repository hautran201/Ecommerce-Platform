'use strict';

const { getSelectData, unGetSelectData } = require('../../utils');

const checkDiscountExists = async ({ model, filter }) => {
    return await model.findOne(filter).lean();
};

const findAllDiscountCodesUnSelect = async ({
    model,
    limit = 50,
    page = 1,
    sort = 'ctime',
    filter,
    unSelect,
}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
    return await model
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(unGetSelectData(unSelect))
        .lean();
};

const findAllDiscountCodesSelect = async ({
    model,
    limit = 50,
    page = 1,
    sort = 'ctime',
    filter,
    select,
}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
    return await model
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select))
        .lean();
};

module.exports = {
    checkDiscountExists,
    findAllDiscountCodesUnSelect,
    findAllDiscountCodesSelect,
};
