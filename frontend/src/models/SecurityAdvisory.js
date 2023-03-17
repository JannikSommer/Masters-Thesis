import Product from "./Status"; 

class SecurityAdvisory {
    title;
    description;
    date;
    cvss;
    vendor;
    products = [];
    path; // path to file

    constructor(json) {
        // parse the json here
    }
}