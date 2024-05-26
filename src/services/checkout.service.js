'use strict';

const { findCartById } = require('../models/repositories/cart.repository');
const { BadRequestError } = require('../core/error.response');
const {
    checkProductByServer,
} = require('../models/repositories/product.repository');
const { getDiscountAmount } = require('./discount.service');
const { acquireLock, releaseLock } = require('./redis.service');
const { order } = require('../models/order.model');
const CartService = require('../services/cart.service');
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

    static async orderByUser({
        cartId,
        userId,
        shop_order_ids,
        user_payment = {},
        user_address = {},
    }) {
        const { shop_order_ids_new, checkout_order } =
            await this.checkoutReview({
                cartId,
                userId,
                shop_order_ids,
            });
        const products = shop_order_ids_new.flatMap(
            (order) => order.item_products
        );
        console.log(`[1] products::`, products);
        const acquireProduct = [];

        for (let i = 0; i < products.length; i++) {
            const { quantity, productId } = products[i];

            const keyLock = await acquireLock(productId, quantity, cartId);
            console.log(`keyLock:: ${keyLock}`);
            acquireProduct.push(keyLock ? true : false);

            if (keyLock) {
                await releaseLock(keyLock);
            }
        }
        //check neu co san pham het hang trong kho
        if (acquireProduct.includes(false)) {
            throw new BadRequestError(
                'Some products have been updated, please return to the cart!'
            );
        }

        const newOrder = await order.create({
            order_userId: userId,
            order_shipping: user_address,
            order_payment: user_payment,
            order_checkout: checkout_order,
            order_products: shop_order_ids_new,
        });

        // case 1 : if inserted success remove product from cart
        if (newOrder) {
            //remove product from cart
            const { order_products } = newOrder;
            order_products.item_products.map(async (product) => {
                await CartService.deleteUserCart({
                    userId,
                    productId: product.productId,
                });
            });
        }

        return newOrder;
    }

    /*
        Query Orders [Users] 
     */
    static async getOrderByUser() {}

    /*
        Query Orders Using Id [Users] 
     */
    static async getOneOrderByUser() {}

    /*
        Cancel Orders  [Users] 
     */
    static async cancelOrderByUser() {}

    /*
        Update Order Status by Shop [Shop | Admin]
     */
    static async updateOrdeStatusByShop() {}
}

module.exports = CheckoutService;
