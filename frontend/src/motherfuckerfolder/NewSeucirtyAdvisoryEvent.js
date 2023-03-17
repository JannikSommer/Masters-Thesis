
class NewSecuriytAdvisoryEvent {
    vulnerabilityIdentifier;
    productIdentifiers = []; 
    vendor;
    document;

    constructor(vid, pids, vendor, doc) {
        this.vulnerabilityIdentifier = vid; 
        this.productIdentifiers = this.extractProductIdentifiers(pids);
        this.vendor = vendor; 
        this.document = doc;
    }

    extractProductIdentifiers(pids) {
        return pids.split(",");
    }
}