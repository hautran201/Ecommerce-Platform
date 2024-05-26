'use strict';

const { CREATED, SuccessReponse } = require('../core/success.response');
const InventoryService = require('../services/inventory.service');

class CartController {
    addStockInInventory = async (req, res, next) => {
        new SuccessReponse({
            message: 'Add Stock In Inventory Success',
            metadata: await InventoryService.addStockInInventory({
                ...req.body,
                shopId: req.user.userId,
            }),
        }).send(res);
    };
}

module.exports = new CartController();
