var assert = require("assert");
var { describe } = require("mocha");

var Status = require("../models/Status");
var Version = require("../models/Version");
var Product = require("../models/Product");
var Vendor = require("../models/Vendor");



//                 const productVersionObject = JSON.parse("{\"category\":\"product_version\",\"name\":\"1.0.0-alpha\",\"product\":{\"name\":\"CSAF Tools CVRF-CSAF-Converter 1.0.0-alpha\",\"product_id\":\"CSAFPID-0001\"}}");

describe("CSAF Parser", function () {
    describe("Version", function () {
        describe("parseProductVersion()", function () {
            it("should retrieve the correct information when parsing", function () {
                const productObject = JSON.parse("{\"name\":\"CSAF Tools CVRF-CSAF-Converter 1.0.0-alpha\",\"product_id\":\"CSAFPID-0001\"}");
                const productVersion = "1.0.0-alpha";
                const lookup = {"CSAFPID-0001": Status.Fixed, "CSAFPID-0002": Status.KnownAffected, "CSAFPID-0002": Status.KnonwNotAffected }
                
                var actual = new Version();
                actual.parseProductVersion(productObject, productVersion, lookup);

                assert.equal(actual.fullName, "CSAF Tools CVRF-CSAF-Converter 1.0.0-alpha", "'Version.fullName' was not equal to expected value");
                assert.equal(actual.identifier, "CSAFPID-0001", "'Version.identifier' was not equal to expected value");
                assert.equal(actual.version, productVersion, "'Version.version' was not equal to expected value");
                assert.equal(actual.status, Status.Fixed, "'Version.status' was not equal to expected value");
            })
        })
    });

    describe("Product", function () {
        describe("parseProduct()", function () {
            it("should retrieve the correct information when parsing", function () {
                const productObject = JSON.parse("{\"name\":\"IOS\",\"category\":\"product_name\",\"branches\":[{\"name\":\"12.2SE\",\"category\":\"product_version\",\"branches\":[{\"name\":\"12.2(55)SE\",\"category\":\"service_pack\",\"product\":{\"product_id\":\"CVRFPID-103763\",\"name\":\"Cisco IOS 12.2SE 12.2(55)SE\"}},{\"name\":\"12.2(55)SE3\",\"category\":\"service_pack\",\"product\":{\"product_id\":\"CVRFPID-105394\",\"name\":\"Cisco IOS 12.2SE 12.2(55)SE3\"}}]}]}");
                const lookup = {"CVRFPID-103763": Status.Fixed, "CVRFPID-105394": Status.KnonwNotAffected};

                var actual = new Product();
                actual.parseProduct(productObject, lookup);

                assert.equal(actual.name, "IOS", "'Product.name' was not equal to expected value");
                assert.equal(actual.versions.length, 2);
            });
        });
    });

    describe("Vendor", function () {
        describe("parseVendor()", function () {
            it("should retrieve the correct information when parsing", function () {
                const vendorObject = JSON.parse("{\"name\":\"Cisco\",\"category\":\"vendor\",\"branches\":[{\"name\":\"IOS\",\"category\":\"product_name\",\"branches\":[{\"name\":\"12.2SE\",\"category\":\"product_version\",\"branches\":[{\"name\":\"12.2(55)SE\",\"category\":\"service_pack\",\"product\":{\"product_id\":\"CVRFPID-103763\",\"name\":\"Cisco IOS 12.2SE 12.2(55)SE\"}}]}]},{\"name\":\"Cisco IOS XE Software\",\"category\":\"product_name\",\"branches\":[{\"name\":\"3.2SE\",\"category\":\"product_version\",\"branches\":[{\"name\":\"3.2.0SE\",\"category\":\"service_pack\",\"product\":{\"product_id\":\"CVRFPID-196216\",\"name\":\"Cisco IOS XE Software 3.2SE 3.2.0SE\"}}]}]}]}");
                const lookup = {"CVRFPID-103763": Status.Fixed, "CVRFPID-196216": Status.KnonwNotAffected};

                var actual = new Vendor();
                actual.parseVendor(vendorObject, lookup);

                assert.equal(actual.name, "Cisco");
                assert.equal(actual.products.length, 2);
            });
        });
    });
});