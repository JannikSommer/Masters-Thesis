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
            if (productVersionJSON["branches"] != undefined) { // Multiple product of this version
                productVersionJSON["branches"].forEach(productJSON => {
                    var product = new Version();
                    product.parseProductVersion(productJSON, this.name, statusLookup);
                    this.versions.push(product);
                });
            } else {                                           // Single product of this version
                var product = new Version();
                product.parseProductVersion(productVersionJSON["product"], this.name, statusLookup);
                this.versions.push(product);
            }
        });
    }
}

module.exports = Product;