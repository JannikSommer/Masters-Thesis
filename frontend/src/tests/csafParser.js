const assert = require("assert");
const { describe, beforeEach } = require("mocha");
const fs = require('fs');

const Status = require("../models/Status");
const Version = require("../models/Version");
const Product = require("../models/Product");
const Vendor = require("../models/Vendor");
const SecurityAdvisory = require("../models/SecurityAdvisory");
const { equal } = require("assert");
const RemediationStrategy = require("../models/RemediationStrategy");
const Vulnerability = require("../models/Vulnerability");





describe("CSAF Parser", function () {
    var csafObject = null;
    var csafString = null;

    before("Load CSAF File", function (done) {
        fs.readFile("../csaf/bsi.json", "utf8", function (err, data) {
            if (err) throw err;
            csafString = data;
            csafObject = JSON.parse(data);
            done();
        }); 
    });

    describe("Version", function () {
        describe("constructor()", function () {
            it("should initialize correctly", function () {
                const productObject = csafObject["product_tree"]["branches"][0]["branches"][0]["branches"][0];                

                const actual = new Version(productObject);

                assert.equal(actual.fullName, "CSAF Tools CVRF-CSAF-Converter 1.0.0-alpha");
                assert.equal(actual.identifier, "CSAFPID-0001", "'Version.identifier' was not equal to expected value");
                assert.equal(actual.version, "1.0.0-alpha", "'Version.version' was not equal to expected value");
            })
        })
    });

    describe("Product", function () {
        describe("constructor()", function () {
            it("should initialize correctly", function () {
                const productObject = csafObject["product_tree"]["branches"][0]["branches"][0];                

                const actual = new Product(productObject);

                assert.equal(actual.name, "CVRF-CSAF-Converter", "'Product.name' was not equal to expected value");
                assert.equal(actual.versions.length, 6);
            });
        });
    });

    describe("Vendor", function () {
        describe("constructor()", function () {
            it("should initialize correctly", function () {
                const vendorObject = csafObject["product_tree"]["branches"][0];
                
                const actual = new Vendor(vendorObject);

                assert.equal(actual.name, "CSAF Tools");
                assert.equal(actual.products.length, 1);
            });
        });
    });

    describe("RemediationStrategy", function () {
        describe("constructor()", function () {
            it("should initialize correctly", function () {
                const remediationObject = csafObject["vulnerabilities"][0]["remediations"][0];

                const actual = new RemediationStrategy(remediationObject);

                assert.equal(actual.details, "Update to the latest version of the product. At least version 1.0.0-rc2");
                assert.equal(actual.productIds.size, 5);
                assert,equal(actual.productIds.get("CSAFPID-0001"), true);
                assert,equal(actual.productIds.get("CSAFPID-0005"), true);
                assert,equal(actual.productIds.get("CSAFPID-0006"), undefined);
                assert.equal(actual.url, "https://github.com/csaf-tools/CVRF-CSAF-Converter/releases/tag/1.0.0-rc2");
            });
        });
    });

    describe("Vulnerability", function () {
        describe("constructor()", function () {
            it("should initialize correctly", function () {
                const vulnerabilityObject = csafObject["vulnerabilities"][0];

                const actual = new Vulnerability(vulnerabilityObject);

                assert.equal(actual.cvss.size, 5);
                assert.equal(actual.cvss.get("CSAFPID-0001"), 6.1);
                assert,equal(actual.cvss.get("CSAFPID-0006"), undefined);

                assert.equal(actual.cwe, "CWE-611");

                assert.equal(actual.description.length, 1);
                assert.equal(actual.description[0], "CSAF Tools CVRF-CSAF-Converter 1.0.0-rc1 resolves XML External Entities (XXE). This leads to the inclusion of arbitrary (local) file content into the generated output document. An attacker can exploit this to disclose information from the system running the converter.");
                
                assert.equal(actual.productStatus.size, 6);
                assert.equal(actual.productStatus.get("CSAFPID-0006"), Status.Fixed);
                assert.equal(actual.productStatus.get("CSAFPID-0001"), Status.KnownAffected);

                assert.equal(actual.remediations.length, 1);
                assert.equal(actual.remediations[0].details, "Update to the latest version of the product. At least version 1.0.0-rc2");
            });
        });
    });


    describe("SecurityAdvisory", function () {
        describe("constructor()", function () {
            it("should initialize correctly", function () {
                const actual = new SecurityAdvisory(csafString);

                assert.equal(actual.description, "");

                assert.equal(actual.severity, "Moderate");

                assert.equal(actual.title, "CVRF-CSAF-Converter: XML External Entities Vulnerability");

                assert.equal(actual.vendors.length, 1);
                assert.equal(actual.vendors[0].name, "CSAF Tools");     
                
                assert.equal(actual.vulnerabilities.length, 1);
            });
        });
    });
});