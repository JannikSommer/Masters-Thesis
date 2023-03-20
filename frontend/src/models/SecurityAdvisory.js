const Vendor = require("./Vendor");

class SecurityAdvisory {
    title;
    description;
    date;
    cvss;
    vendors = [];
    path; // path to file


    constructor() {}

    parseProductTree(productTreeObject, statusLookup) {
        productTreeObject["branches"].forEach(vendorJSON => {
            var vendor = new Vendor();
            vendor.parseVendor(vendorJSON, statusLookup);
            this.vendors.push(vendor);
        });
    }

}

module.exports = SecurityAdvisory;