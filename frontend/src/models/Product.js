var Version = require("../models/Version");

/**
 * Represents a specific product line.
 */
class Product {
    /**
     * The name of the product line
     * @type {string}
     */
    name; 

    /**
     * The affected versions of the this product line.
     * @type {Array<Version>}
     */
    versions = [];

    constructor() {}

    /**
     * Parses a product line from a CSAF.
     * @param {object} productObject An instance of an instance of a CSAF product line.
     * @param {object} statusLookup The dictionary used to look up product status.
     */
    parseProduct(productObject, statusLookup) {
        this.name = productObject["name"];
        productObject["branches"].forEach(productVersionJSON => {
            productVersionJSON["branches"].forEach(productJSON => {
                var product = new Version();
                product.parseProductVersion(productJSON, productVersionJSON["name"], statusLookup);
                this.versions.push(product);
            });
        });
    }
}

module.exports = Product;