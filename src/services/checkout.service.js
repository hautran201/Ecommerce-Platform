'use strict';

const { findCartById } = require('../models/repositories/cart.repository');
const { BadRequestError } = require('../core/error.response');
const {
    checkProductByServer,
} = require('../models/repositories/product.repository');
const { getDiscountAmount } = require('./discount.service');

class CheckoutService {
    /**
        {
            cartId,
            userId,
            shop_order_ids: [
                {
                    shopId,
                    shop_discounts: []
                    item_products: [
                        {
                            productId,
                            price,
                            quantity
                        }
                    ]
                }
                {
                    shopId,
                    shop_discounts: [{
                        shopId,
                        discountId,
                        codeId
                    }]
                    item_products: [
                        {
                            productId,
                            price,
                            quantity
                        }
                    ]
                }
            ]
        } 
     */
    //
    static async checkoutReview({ cartId, userId, shop_order_ids }) {
        //check cartId
        const foundCart = await findCartById(cartId);
        if (!foundCart) throw new BadRequestError('cart does not exist!');

        const checkout_order = {
                totalPrice: 0,
                feeShip: 0,
                totalDiscount: 0,
                totalCheckout: 0,
            },
            shop_order_ids_new = [];

        //tinh tong tien
        for (let i = 0; i < shop_order_ids.length; i++) {
            const {
                shopId,
                shop_discounts = [],
                item_products = [],
            } = shop_order_ids[i];

            console.log(`shop_order_ids:: `, shop_order_ids[i]);
            console.log(`Shop discount:: ${shop_discounts[0].codeId}`);
            //check product available
            const checkProductServer = await checkProductByServer(
                item_products
            );
            console.log('checkProductServer::', checkProductServer);
            if (!checkProductServer) throw new BadRequestError('Order wrong!');

            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                console.log(`Product::`, product);
                return acc + product.product_quantity * product.product_price;
            }, 0);
            console.log(`Checkout price::`, checkoutPrice);

            //tong tien truoc xu ly
            checkout_order.totalPrice = checkoutPrice;

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, //tien truoc khi giam gia
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer,
            };

            //new shop_discounts ton tai > 0, check co hop le hay khong
            if (shop_discounts.length > 0) {
                const { discount } = await getDiscountAmount({
                    code: shop_discounts[0].codeId,
                    shopId,
                    userId,
                    products: checkProductServer,
                });

                console.log(`Discount ::`, discount);
                //tong cong discountgiam gia
                checkout_order.totalDiscount += discount;

                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount;
                }

                checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
                shop_order_ids_new.push(itemCheckout);
            }

            return {
                shop_order_ids,
                shop_order_ids_new,
                checkout_order,
            };
        }
    }
}

module.exports = CheckoutService;
