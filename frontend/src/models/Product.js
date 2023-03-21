var Version = require("../models/Version");

/**
 * Represents a specific product line.
 */
class Product { //? Should this be called "ProductLine"?
    /**
     * The name of the product line.
     * @type {String}
     */
    name; 

    /**
     * The affected versions of the this product line.
     * @type {Version[]}
     */
    versions = [];


    /**
     * Instantiates a Product object.
     * @param {Object} productObject A parsed CSAF product line.
     */
    constructor(productObject) {
        this.extractProduct(productObject);
    }

    /**
     * Extracts a product line from a CSAF.
     * @param {Object} product A parsed CSAF product line.
     */
    extractProduct(product) {
        this.name = product["name"];
        product["branches"].forEach(productVersion => {
            if (productVersion["branches"]) { // Multiple products of this version
                productVersion["branches"].forEach(product => {
                    this.versions.push(new Version(product, this.name));
                });
            } else { // Single product of this version
                this.versions.push(new Version(productVersion["product"], this.name));
            }
        });
    }
}

module.exports = Product;