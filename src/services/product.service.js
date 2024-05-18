'use strict';

const {
    product,
    clothing,
    electronic,
    furniture,
} = require('../models/product.model');

const { BadRequestError } = require('../core/error.response');
const {
    findAllDraftsForShop,
    publishProductByShop,
    findAllPublishedForShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
} = require('../models/repositories/product.repository');

//define Factory class create product
class ProductFactory {
    static productRegistry = {};

    static registerProductType(type, classRef) {
        this.productRegistry[type] = classRef;
    }

    static async createProduct(type, payload) {
        const productClass = this.productRegistry[type];
        if (!productClass)
            throw new BadRequestError(`Invalid product type ${type}`);

        return new productClass(payload).createProduct();
    }

    // POST //
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id });
    }
    static async unPublishProductByShop({ product_shop, product_id }) {
        return await unPublishProductByShop({ product_shop, product_id });
    }
    // END POST //

    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true };
        return await findAllDraftsForShop({ query, limit, skip });
    }

    static async findAllPublishedForShop({
        product_shop,
        limit = 50,
        skip = 0,
    }) {
        const query = { product_shop, isPublished: true };
        return await findAllPublishedForShop({ query, limit, skip });
    }

    static async getListSearchProduct({ keySearch }) {
        return await searchProductByUser({ keySearch });
    }

    static async getAllProducts({
        limit = 50,
        sort = 'ctime',
        page = 1,
        filter = { isPublished: true },
    }) {
        return await findAllProducts({
            limit,
            sort,
            filter,
            page,
            select: ['product_name', 'product_price', 'product_thumb'],
        });
    }
    static async getProduct({ product_id }) {
        return await findProduct({ product_id, unSelect: ['__v'] });
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
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newClothing)
            throw new BadRequestError('Create new Clothing error');

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
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newFurniture)
            throw new BadRequestError('Create new Furniture error');

        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct) throw new BadRequestError('Create new Product error');

        return newProduct;
    }
}

ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Electronic', Electronic);
ProductFactory.registerProductType('Furniture', Furniture);

module.exports = ProductFactory;
