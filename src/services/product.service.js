'use strict';

const { product, clothing, electronic } = require('../models/product.model');
const { BadRequestError } = require('../core/error.response');

//define Factory class create product
class ProductFactory {
    static createProduct(type, payload) {
        switch (type) {
            case 'Electronic':
                return new Electronic(payload).createProduct();
            case 'Clothing':
                return new Clothing(payload).createProduct();
            case 'Furniture':
                return new Furniture(payload).createProduct();

            default:
                throw new BadRequestError(`Invalid product type ${type}`);
        }
    }
}

//define base product class
class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes,
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
    }

    async createProduct(product_id) {
        return await product.create({ ...this, _id: product_id });
    }
}

//define sub-class different product type Clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newClothing)
            throw new BadRequestError('Create new Electronic error');

        const newProduct = await super.createProduct(newClothing._id);
        if (!newProduct) throw new BadRequestError('Create new Product error');

        return newProduct;
    }
}

//define sub-class different product type Electronic
class Electronic extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newElectronic)
            throw new BadRequestError('Create new Electronic error');

        const newProduct = await super.createProduct(newElectronic._id);
        if (!newProduct) throw new BadRequestError('Create new Product error');

        return newProduct;
    }
}
//define sub-class different product type Electronic
class Furniture extends Product {
    async createProduct() {
        const newFurniture = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newFurniture)
            throw new BadRequestError('Create new Electronic error');

        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct) throw new BadRequestError('Create new Product error');

        return newProduct;
    }
}

module.exports = ProductFactory;
