'use strict';

const { BadRequestError } = require('../core/error.response');
const { inventory } = require('../models/inventory.model');
const { getProductById } = require('../models/repositories/product.repository');
const { convertToObjectIdMongodb } = require('../utils');
class InventoryService {
    static async addStockInInventory({
        stock,
        productId,
        shopId,
        location = '55, 1E, KDC Trung Son, TPHCM',
    }) {
        const product = await getProductById(
            convertToObjectIdMongodb(productId)
        );
        if (product) {
            throw new BadRequestError('The product does not exists.');
        }

        const query = { inven_shopId: shopId, inven_productId: productId },
            updateSet = {
                $inc: {
                    inven_stock: stock,
                },
                $set: {
                    inven_location: location,
                },
            },
            options = { upsert: true, new: true };

        return await inventory.findOneAndUpdate(query, updateSet, options);
    }
}

module.exports = InventoryService;
