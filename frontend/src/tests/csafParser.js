const assert = require("assert");
const { describe, beforeEach } = require("mocha");
const fs = require('fs');

const Status = require("../models/Status");
const Version = require("../models/Version");
const Product = require("../models/Product");
const Vendor = require("../models/Vendor");
const SecurityAdvisory = require("../models/SecurityAdvisory");





describe("CSAF Parser", function () {
    var csafJSON = null;

    before("Load CSAF File", function (done) {
        fs.readFile("../csaf/bsi.json", "utf8", function (err, data) {
            if (err) throw err;
            csafJSON = JSON.parse(data);
            done();
        }); 
    });

    describe("Version", function () {
        describe("parseProductVersion()", function () {
            it("should parse correctly", function () {
                const productObject = csafJSON["product_tree"]["branches"][0]["branches"][0]["branches"][0]["product"];                
                const lookup = {"CSAFPID-0001": Status.KnownAffected, "CSAFPID-0002": Status.KnownAffected};
                const productVersion = "1.0.0-alpha";

                var actual = new Version();
                actual.parseProductVersion(productObject, productVersion, lookup);

                assert.equal(actual.fullName, "CSAF Tools CVRF-CSAF-Converter 1.0.0-alpha", "'Version.fullName' was not equal to expected value");
                assert.equal(actual.identifier, "CSAFPID-0001", "'Version.identifier' was not equal to expected value");
                assert.equal(actual.version, productVersion, "'Version.version' was not equal to expected value");
                assert.equal(actual.status, Status.KnownAffected, "'Version.status' was not equal to expected value");
            })
        })
    });

    describe("Product", function () {
        describe("parseProduct()", function () {
            it("should parse correctly when versions have a single product", function () {
                const productObject = csafJSON["product_tree"]["branches"][0]["branches"][0];                

                var actual = new Product();
                actual.parseProduct(productObject, {});

                assert.equal(actual.name, "CVRF-CSAF-Converter", "'Product.name' was not equal to expected value");
                assert.equal(actual.versions.length, 6);
            });
        });
    });

    describe("Vendor", function () {
        describe("parseVendor()", function () {
            it("should retrieve the correct information when parsing", function () {
                const vendorObject = csafJSON["product_tree"]["branches"][0];
                
                var actual = new Vendor();
                actual.parseVendor(vendorObject, {});

                assert.equal(actual.name, "CSAF Tools");
                assert.equal(actual.products.length, 1);
            });
        });
    });

    describe("SecurityAdvisory", function () {
        describe("parseProductTree()", function () {
            it("should retrieve the correct information when parsing", function () {
                const productTreeObject = csafJSON["product_tree"];

                var actual = new SecurityAdvisory();
                actual.parseProductTree(productTreeObject, {});

                assert.equal(actual.vendors.length, 1);
                assert.equal(actual.vendors[0].name, "CSAF Tools");
            })
        });
    });
});