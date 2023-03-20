var Product = require("../models/Product");

/**
 * Represents a Vendor.
 */
class Vendor {
    /**
     * The name of the vendor
     * @type {string}
     */
    name;

    /**
     * The affected product lines from this vendor.
     * @type {Array<Product>}
     */
    products = [];

    constructor() {}

    /**
     * Parses a vendor from a CSAF.
     * @param {object} vendorObject 
     * @param {object} statusLookup The dictionary used to look up product status.
     */
    parseVendor(vendorObject, statusLookup) {
        this.name = vendorObject["name"];
        vendorObject["branches"].forEach(productJSON => {
            var product = new Product();
            product.parseProduct(productJSON, statusLookup);
            this.products.push(product);
        });
    }
}

module.exports = Vendor;