'use strict';

const discount = require('../models/discount.model');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const {
    checkDiscountExists,
    findAllDiscountCodesUnSelect,
    findAllDiscountCodesSelect,
} = require('../models/repositories/discount.repository');
const { convertToObjectIdMongodb } = require('../utils');
const {
    findAllProducts,
} = require('../models/repositories/product.repository');

class DiscountService {
    static createDiscountCode = async (payload) => {
        const {
            code,
            start_date,
            end_date,
            is_active,
            shopId,
            min_order_value,
            product_ids,
            applies_to,
            name,
            description,
            type,
            value,
            max_uses,
            uses_count,
            users_used,
            max_uses_per_user,
        } = payload;

        if (
            new Date() > new Date(start_date) ||
            new Date() > new Date(end_date)
        ) {
            throw new BadRequestError('Discount date invalid');
        }

        if (new Date(start_date) > new Date(end_date)) {
            throw new BadRequestError('Start date must be before end date!');
        }

        //creat index for discount code
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId),
            },
        });

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('Discount exists!');
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value || 0,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_user_count: uses_count,
            discount_users_used: users_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === 'all' ? [] : product_ids,
        });

        return newDiscount;
    };

    static updateDiscountCode = async (payload) => {
        const { code, shopId } = payload;

        //creat index for discount code
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId),
            },
        });

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new NotFoundError('Discount exists!');
        }
    };

    // Get all discount codes
    static async getAllDiscountCodesWithProduct({
        code,
        shopId,
        userId,
        limit,
        page,
    }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId),
            },
        });

        if (!foundDiscount) {
            throw new NotFoundError('Discount does not exists!');
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount;

        let products;
        if (discount_applies_to === 'all') {
            products = await findAllProducts({
                filter: {
                    product_shop: shopId,
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name', 'product_price'],
            });
        }

        if (discount_applies_to === 'specific') {
            products = await findAllProducts({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name', 'product_price'],
            });
        }

        return products;
    }

    // Get all discount code by shop
    static async getAllDiscountCodesByShop({ limit, page, shopId }) {
        const discounts = await findAllDiscountCodesSelect({
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true,
            },
            model: discount,
            limit: +limit,
            page: +page,
            sort: 'ctime',
            select: ['discount_code', 'discount_name'],
        });

        return discounts;
    }

    static async getDiscountAmount({ code, shopId, userId, products }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId),
            },
        });

        if (!foundDiscount) {
            throw new NotFoundError('Discount doesn"t exists!');
        }

        const {
            discount_is_active,
            discount_max_uses,
            discount_min_order_value,
            discount_users_used,
            discount_type,
            discount_end_date,
            discount_start_date,
            discount_value,
            discount_product_ids,
            discount_applies_to,
        } = foundDiscount;

        console.log(`[Discount value::]`, discount_value);

        if (!discount_is_active) {
            throw new NotFoundError('Discout expried!');
        }

        if (!discount_max_uses) {
            throw new NotFoundError('Discout are out!');
        }

        if (new Date() > new Date(discount_end_date)) {
            throw new NotFoundError(`Discount code has expried!`);
        }

        console.log(`discount_product_ids::`, discount_product_ids);
        //check xem co gia tri toi thieu hay khong
        let totalOrder = 0;
        if (discount_min_order_value > 0) {
            if (discount_applies_to === 'all') {
                totalOrder = products.reduce((acc, product) => {
                    return (
                        acc + product.product_price * product.product_quantity
                    );
                }, 0);
            } else {
                products.map((product) => {
                    if (discount_product_ids.includes(product.productId)) {
                        totalOrder +=
                            product.product_quantity * product.product_price;
                    }
                });
            }

            if (totalOrder < discount_min_order_value) {
                throw new NotFoundError(
                    `Discount required a minium order value of ${discount_min_order_value}!`
                );
            }
        }

        // if (discount_max_uses_per_user > 0) {
        //     const userUsedDiscount = discount_users_used.find(
        //         (user) => user.id === userId
        //     );
        //     if (userUsedDiscount) {
        //         //....
        //     }
        // }

        //check discount nay la fixed_amount
        const amount =
            discount_type === 'fixed_amount'
                ? discount_value
                : totalOrder * (discount_value / 100);

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount,
        };
    }

    static async deleteDiscount({ shopId, code }) {
        // const foundDiscount = await checkDiscountExists({
        //     model: discount,
        //     filter: {
        //         discount_code: code,
        //         discount_shopId: convertToObjectIdMongodb(shopId),
        //     },
        // });

        // if(foundDiscount) {
        //     //... Bo sung mot so logic trc khi xoa
        // }
        const deleted = await discount.findByIdAndDelete({
            discount_code: code,
            discount_shopId: shopId,
        });

        return deleted;
    }

    static async cancelDiscountCode({ code, shopId, userId }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId),
            },
        });
        if (!foundDiscount) {
            throw new NotFoundError(`Discount does not exist!`);
        }

        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_user_count: -1,
            },
        });

        return result;
    }
}

module.exports = DiscountService;
