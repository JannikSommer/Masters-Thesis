/**
 * Represents a remediation strategy from a CSAF security advisory.
 */
class RemediationStrategy {
    /**
     * Details the remediation strategy.
     * @type {String}
     */
    details = "";

    /**
     * The product ids affected by the remediation strategy.
     * @type {Map<String, Boolean}
     */
    productIds;

    /**
     * A url where the remediation can be obtained.
     * @type {String}
     */
    url = "";

    /**
     * Instantiates a RemediationStrategy object.
     * @param {Object} remediationObject A remediation object from a CSAF document.
     */
    constructor(remediationObject) {
        this.extractRemediationStrategy(remediationObject);
    }

    /**
     * Extracts relevant information from a remediation object from a CSAF document.
     * @param {Object} remediation A remediation object from a CSAF document.
     */
    extractRemediationStrategy(remediation) {
        if(remediation["details"]) this.details = remediation["details"];
        if(remediation["url"]) this.url = remediation["url"];
        
        this.productIds = new Map();
        if(remediation["product_ids"]) {
            remediation["product_ids"].forEach(id => {
                this.productIds.set(id, true);
            });
        }
    }

    toString() {
        return this.details + (this.url !== "" ? "\nURL: " + this.url : "");
    }
}

module.exports = RemediationStrategy;