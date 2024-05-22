'use strict';

const { cart } = require('../models/cart.model');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const {
    createUserCart,
    updateUserCartQuantity,
} = require('../models/repositories/cart.repository');
const { getProductById } = require('../models/repositories/product.repository');
class CartService {
    static async addToCart({ userId, product = {} }) {
        const cartUser = await cart.findOne({
            cart_userId: userId,
            cart_status: 'active',
        });

        const { productId } = product;
        const foundProduct = await getProductById(productId);
        if (!foundProduct) throw new NotFoundError('Product not Exists!');

        const productData = {
            ...product,
            name: foundProduct.product_name,
            price: foundProduct.product_price,
        };
        console.log(productData);
        if (!cartUser) {
            return await createUserCart({ userId, product: productData });
        }

        if (!cartUser.cart_products.length) {
            cartUser.cart_products = [productData];
            return await cartUser.save();
        }

        //logic chua toio uu
        cartUser.cart_products.map(async (item) => {
            if (item.productId === productId) {
                return await updateUserCartQuantity({
                    userId,
                    product: productData,
                });
            }
        });
        cartUser.cart_products.push(productData);
        return await cartUser.save();
    }

    //Update user cart quantity
    /*
        shop_order_ids : [{
            shopId,
            item_products: {
                quantity,
                price,
                shopId,
                old_quantity,
                productId
            }
            version
        }]
    */
    static async addToCartV2({ userId, shop_order_ids }) {
        const { productId, quantity, old_quantity } =
            shop_order_ids[0]?.item_products;

        const foundProduct = await getProductById(productId);
        if (!foundProduct) throw new NotFoundError('Product not Exists!');

        if (
            foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId
        ) {
            throw new NotFoundError('Product do not belong to the shop!');
        }

        if (quantity === 0) {
            // delete
        }

        return await updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity,
            },
        });
    }

    //delete
    static async deleteUserCart({ userId, productId }) {
        const query = { cart_userId: userId, cart_status: 'active' },
            updateSet = {
                $pull: {
                    cart_products: {
                        productId,
                    },
                },
            };
        const deleteCart = await cart.updateOne(query, updateSet);
        return deleteCart;
    }

    //get list cart user
    static async getListUserCart({ userId }) {
        return await cart.findOne({ cart_userId: +userId }).lean();
    }
}

module.exports = CartService;
