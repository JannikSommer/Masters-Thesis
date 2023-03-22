const Vendor = require("./Vendor");
const Vulnerability = require("./Vulnerability");

/**
 * Represents a security advisory detailing a vulnerability.
 */
class SecurityAdvisory {
    /**
     * Title of the security advisory.
     * @type {String}
     */
    title = "";

    /**
     * A description of the vulnerability.
     * @type {String}
     */
    description = "";

    /**
     * The severity of the vulnerability.
     * @type {String}
     */
    severity = "";

    /**
     * List of vendors whose products are affected by the vulnerability.
     * @type {Vendor[]}
     */
    vendors;

    /**
     * The list of vulnerabilities covered by the security advisory.
     * @type {Vulnerability[]}
     */
    vulnerabilities;

    /**
     * The path to the Security Advisory
     * @type {String}
     */
    path; //? Is this the IPFS cid or something else?


    /**
     * Instantiates a new security advisory object from a CSAF document.
     * @param {String} csaf The CSAF document in JSON-string format.
     */
    constructor(csaf) {
        this.extractCSAF(JSON.parse(csaf));
    }

    /**
     * Extracts the product three of a CSAF document
     * @private
     * @param {Object} productTree The product_tree object in a CSAF document.
     * @returns {Vendor[]} An array of vendors extracted from the product tree.
     */
    extractProductTree(productTree) {
        if (!productTree || !productTree["branches"]) { // No product-tree/vendors provided.
            return [];
        }

        var vendors = [];
        productTree["branches"].forEach(vendor => {
            vendors.push(new Vendor(vendor));
        });
        return vendors;
    }

    
    /**
     * Extracts a summary of the security advisory from a CSAF document.
     * @private
     * @param {Object[]} notesArray An array of notes from a CSAF document.
     * @returns {String} A summary of the security advisory.
     */
    extractDescription(notesArray) {
        var desc = "";

        if(!notesArray) { // If no notes are found in the document.
            return desc;
        }

        notesArray.forEach(note => {
            if (note["category"] === "summary") {
                desc = note["text"];
            }
        })

        return desc;
    }

    /**
     * Extract relevant information about vulnerabilities from an array of CSAF vulnerabilities.
     * @private
     * @param {Object[]} vulnerabilitiesArray An array of CSAF vulnerabilities.
     * @returns {Vulnerability[]} An array of Vulnerabilities.
     */
    extractVulnerabilities(vulnerabilitiesArray) {
        if(!vulnerabilitiesArray) return [];

        var vulnerabilities = [];

        vulnerabilitiesArray.forEach(vulnerability => {
            vulnerabilities.push(new Vulnerability(vulnerability));
        });

        return vulnerabilities;
    }

    /**
     * Extracts a CSAF document in JavaScript object format.
     * @private
     * @param {Object} csaf A CSAF document parsed to a JavaScript object.
     */
    extractCSAF(csaf) {
        this.title = csaf["document"]["title"]
        this.severity = csaf["document"]["aggregate_severity"]["text"];
        this.description = this.extractDescription(csaf["document"]["notes"]);
        this.vendors = this.extractProductTree(csaf["product_tree"]);
        this.vulnerabilities = this.extractVulnerabilities(csaf["vulnerabilities"]);
    }
}

module.exports = SecurityAdvisory;