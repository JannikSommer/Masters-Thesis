import Vendor from "./Vendor";
import Vulnerability from "./Vulnerability";

/**
 * Represents a security advisory detailing a vulnerability.
 */
export default class SecurityAdvisory {
    /**
     * Title of the security advisory.
     * @type {String}
     */
    title = "";

    /**
     * A description of the vulnerability.
     * @type {String}
     */
    description;

    /**
     * The severity of the vulnerability.
     * @type {String}
     */
    severity = "No aggregate severity.";

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
     * An IPFS content-id (cid) specifying the location of this security advisory.
     * @type {String}
     */
    cid; 


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
        var desc = "No description provided.";

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
        if(!csaf["document"]) throw Error("CSAF documents MUST include a 'document' property.");
        if(!csaf["document"]["title"]) throw Error("CSAF documents MUST include a document title.");
        if(csaf["document"]["aggregate_severity"] && csaf["document"]["aggregate_severity"]["text"]) this.severity = csaf["document"]["aggregate_severity"]["text"];

        this.title = csaf["document"]["title"];
        this.description = this.extractDescription(csaf["document"]["notes"]);
        this.vendors = this.extractProductTree(csaf["product_tree"]);
        this.vulnerabilities = this.extractVulnerabilities(csaf["vulnerabilities"]);
    }

    /**
     * Retrieves all information related to a single product id.
     * @param {string} productId A valid product id.A
     * @returns {Object[] | undefined} Returns an array of objects containing all available information about a product.
     */
    getProductInformation(productId) {
        let result = [];
        
        this.vendors.forEach(vendor => {
            vendor.products.forEach(product => {
                product.versions.forEach(version => {
                    if(version.identifier !== productId) return;
                    this.vulnerabilities.forEach(vulnerability => {
                        let vulnInfo = vulnerability.getProductInformation(productId);
                        if(!vulnInfo) return;
                        
                        result.push({
                            fullName: version.fullName,
                            version: version.version,
                            identifier: version.identifier,
                            status: vulnInfo.status,
                            cvss: vulnInfo.cvss,
                            remediations: vulnInfo.remediations
                        });
                    });
                });
            });
        });

        return result;
    }

    getAllProductInformation() {
        let result = [];

        this.vendors.forEach(vendor => {
            vendor.products.forEach(product => {
                product.versions.forEach(version => {
                    this.vulnerabilities.forEach(vulnerability => {
                        let vulnInfo = vulnerability.getProductInformation(version.identifier);
                        if(!vulnInfo) return;

                        result.push({
                            fullName: version.fullName,
                            version: version.version,
                            identifier: version.identifier,
                            status: vulnInfo.status,
                            cvss: vulnInfo.cvss,
                            remediations: vulnInfo.remediations
                        });
                    });
                });
            });
        });

        return result;
    }

}