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
     * @param {Object} productObject A parsed CSAF product.
     * @param {String} productVersion The product version.
     */
    constructor (productObject, productVersion) {
        this.extractProductVersion(productObject, productVersion);
    }

    /**
     * Parses a product version object from a CSAF.
     * @private
     * @param {Object} product A parsed CSAF product.
     * @param {String} version The product version.
     */
    extractProductVersion(product, version) {
        this.fullName = product["name"];
        this.identifier = product["product_id"];
        this.version = version;
    }

}

module.exports = Version;