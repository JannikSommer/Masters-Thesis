/**
 * Represents a specific version of a product line.
 */
class Version {
    /**
     * The full name of the product. Often includes vendor, architecture, version.
     * @type {string}
     */
    fullName; 

    /**
     * The product version.
     * @type {string}
     */
    version; 

    /**
     * The status of the vulnerability impact on the product.
     * @type {string}
     */
    status; 

    /**
     * The product identifier. 
     * @type {string}
     */
    identifier;

    /**
     * Parses a 'product' object from a CSAF.
     * @param {object} productObject An instance of a 'product'.
     * @param {string} productVersion The product version.
     * @param {object} statusLookup The dictionary used to look up product status.
     */
    parseProductVersion(productObject, productVersion, statusLookup) {
        this.fullName = productObject["name"];
        this.identifier = productObject["product_id"];
        this.version = productVersion;
        this.status = statusLookup[this.identifier];
    }

}

module.exports = Version;