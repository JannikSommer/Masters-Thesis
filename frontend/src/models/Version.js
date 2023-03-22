/**
 * Represents a specific version of a product line.
 */
class Version {
    /**
     * The full name of the product. Often includes vendor, architecture, version.
     * @type {String}
     */
    fullName; 

    /**
     * The product version.
     * @type {String}
     */
    version; 

    /**
     * The product identifier. 
     * @type {String}
     */
    identifier;


    /**
     * Instantiates a Version object.
     * @param {Object} productVersionObject A parsed CSAF product.
     * @param {String} productVersion The product version.
     */
    constructor (productVersionObject) {
        this.extractProductVersion(productVersionObject);
    }

    /**
     * Parses a product version object from a CSAF.
     * @private
     * @param {Object} productVersion A parsed CSAF product.
     * @param {String} version The product version.
     */
    extractProductVersion(productVersion) {
        if(productVersion["category"] !== "product_version") throw Error("'productVersion' is not a CSAF 'product_version' type.");
        if(productVersion["branches"]) throw Error("Branching in 'product_version' objects is not currently supported.");

        if(!productVersion["product"]["name"]) throw Error("'name' property is not included in 'product' object.");
        if(!productVersion["product"]["product_id"]) throw Error("'product_id' property is not included in 'product' object");

        this.fullName = productVersion["product"]["name"];
        this.identifier = productVersion["product"]["product_id"];
        this.version = productVersion["name"];
    }
}

module.exports = Version;