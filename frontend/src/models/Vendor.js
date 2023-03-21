var Product = require("../models/Product");

/**
 * Represents a Vendor.
 */
class Vendor {
    /**
     * The name of the vendor
     * @type {String}
     */
    name;

    /**
     * The affected product lines from this vendor.
     * @type {Product[]}
     */
    products = [];


    /**
     * Instantiates a Vendor object.
     * @param {Object} vendorObject A parsed CSAF vendor.
     */
    constructor(vendorObject) {
        this.extractVendor(vendorObject);
    }

    /**
     * Parses a vendor from a CSAF.
     * @param {Object} vendor A parsed CSAF vendor.
     */
    extractVendor(vendor, productStatus) {
        this.name = vendor["name"];
        vendor["branches"].forEach(product => {
            this.products.push(new Product(product));
        });
    }
}

module.exports = Vendor;