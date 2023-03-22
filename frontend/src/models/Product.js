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
        if(product["category"] !== "product_name") throw Error("'product' is not a CSAF 'product_name' type.");
        if(!product["name"]) throw Error("'name' property is not included in 'product'.");
        if(!product["branches"]) throw Error("'product' does not contain branches.");

        this.name = product["name"];
        product["branches"].forEach(productVersion => {
            this.versions.push(new Version(productVersion));
        });
    }
}

module.exports = Product;