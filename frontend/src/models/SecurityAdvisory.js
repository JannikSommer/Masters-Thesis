const Vendor = require("./Vendor");

/**
 * Represents a security advisory detailing a vulnerability.
 */
class SecurityAdvisory {
    /**
     * Title of the security advisory.
     * @type {String}
     */
    title;

    /**
     * A description of the vulnerability.
     * @type {String}
     */
    description;

    /**
     * The severity of the vulnerability.
     * @type {String}
     */
    severity;

    /**
     * List of vendors whose products are affected by the vulnerability.
     * @type {Vendor[]}
     */
    vendors;

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
        this.parseCSAF(JSON.parse(csaf));
    }

    /**
     * Extracts the product three of a CSAF document
     * @param {Object} productTree The product_tree object in a CSAF document.
     * @returns {Vendor[]} An array of vendors extracted from the product tree.
     */
    extractProductTree(productTree) {
        if (!productTree) { // No product tree provided.
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
     * @param {Object[]} notesArray An array of notes from a CSAF document.
     * @returns {String} A summary of the security advisory.
     */
    parseDescription(notesArray) {
        if(!notesArray) { // If no notes are found in the document.
            return "";
        }
        
        var desc = "";

        notesArray.forEach(note => {
            if (note["category"] === "summary") {
                desc = note["text"];
            }
        })

        return desc;
    }

    /**
     * Extracts a CSAF document in JavaScript object format.
     * @param {Object} csaf A CSAF document parsed to a JavaScript object.
     */
    parseCSAF(csaf) {
        this.title = csaf["document"]["title"]
        this.severity = csaf["document"]["aggregate_severity"]["text"];
        this.description = this.parseDescription(csaf["document"]["notes"]);
        this.vendors = this.extractProductTree(csaf["product_tree"]);
    }


}

module.exports = SecurityAdvisory;