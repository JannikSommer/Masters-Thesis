var assert = require("assert");
var { describe } = require("mocha");

var Status = require("../models/Status");
var Version = require("../models/Version");




//                 const productVersionObject = JSON.parse("{\"category\":\"product_version\",\"name\":\"1.0.0-alpha\",\"product\":{\"name\":\"CSAF Tools CVRF-CSAF-Converter 1.0.0-alpha\",\"product_id\":\"CSAFPID-0001\"}}");

describe("CSAF Parser", function () {
    describe("Version", function () {
        describe("parseProductVersion", function () {
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
});