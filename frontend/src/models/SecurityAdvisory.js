
class SecurityAdvisory {
    title;
    description;
    date;
    cvss;
    vendor;
    products = [];
    path; // path to file

    /**
     * 
     * @param {string} jsonString A CSAF document as a string
     */
    constructor(jsonString) {
        parseCsafObject(
            JSON.parse(jsonString)
        );
    }

    /**
     * Parses a CSAF object
     * 
     * @param {object} csaf The CSAF document as a JavaScript Object
     */
    function parseCsafObject(csaf) {
        
    }

}