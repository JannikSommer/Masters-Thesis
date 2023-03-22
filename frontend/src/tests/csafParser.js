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
            });

            it("should only accept CSAF 'product_version' types", function () {
                const wrongProductVersion = csafObject["product_tree"]["branches"][0]; // category = "vendor"
                const actual = function () {new Version(wrongProductVersion)};
                assert.throws(actual, Error("'productVersion' is not a CSAF 'product_version' type."));
            });

            it("should not accept objects with branches", function () {
                const wrongProductVersion = JSON.parse('{"category": "product_version", "name": "1.0.0-alpha", "branches":[{},{}]}');
                const actual = function () {new Version(wrongProductVersion)};
                assert.throws(actual, Error("Branching in 'product_version' objects is not currently supported."));
            });

            it("should not accept objects without a product name", function () {
                const wrongProductVersion = JSON.parse('{"category": "product_version", "name": "1.0.0-alpha", "product": {"product_id": "product id"}}');
                const actual = function () {new Version(wrongProductVersion)};
                assert.throws(actual, Error("'name' property is not included in 'product' object."));
            });
            it("should not accept objects without a product id", function () {
                const wrongProductVersion = JSON.parse('{"category": "product_version", "name": "1.0.0-alpha", "product": {"name": "product name"}}');
                const actual = function () {new Version(wrongProductVersion)};
                assert.throws(actual, Error("'product_id' property is not included in 'product' object"));
            });
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

            it("should only accept CSAF 'product_name' types", function () {
                const wrongProduct = csafObject["product_tree"]["branches"][0]; // category = "vendor"
                const actual = function () {new Product(wrongProduct)};
                assert.throws(actual, Error("'product' is not a CSAF 'product_name' type."));
            });

            it("should not accept objects without 'name' property", function () {
                const wrongProduct = JSON.parse('{ "category": "product_name", "branches":[ {}, {} ] }');
                const actual = function () {new Product(wrongProduct)};
                assert.throws(actual, Error("'name' property is not included in 'product'."));
            });

            it("should not accept objects without branches", function () {
                const wrongProduct = JSON.parse('{ "category": "product_name", "name": "product name", "product": {} }');
                const actual = function () {new Product(wrongProduct)};
                assert.throws(actual, Error("'product' does not contain branches."));
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

            it("should only accept CSAF 'vendor' types", function () {
                const wrongProduct = csafObject["product_tree"]["branches"][0]["branches"][0]; // category = "vendor"
                const actual = function () {new Vendor(wrongProduct)};
                assert.throws(actual, Error("'vendor' is not a CSAF 'vendor' type."));
            });

            it("should not accept objects without 'name' property", function () {
                const wrongProduct = JSON.parse('{ "category": "vendor", "branches":[ {}, {} ] }');
                const actual = function () {new Vendor(wrongProduct)};
                assert.throws(actual, Error("'name' property is not included in 'vendor'."));
            });

            it("should not accept objects without branches", function () {
                const wrongProduct = JSON.parse('{ "category": "vendor", "name": "vendor name", "product": {} }');
                const actual = function () {new Vendor(wrongProduct)};
                assert.throws(actual, Error("'vendor' does not contain branches."));
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