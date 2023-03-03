const IdentifierIssuerService = artifacts.require("./IdentifierIssuerService.sol");
const Vendor = artifacts.require("./Vendor.sol");
const truffleAssert = require('truffle-assertions');
const BN = require("bn.js");

contract("Vendor", async (accounts) => {
    let iis, vendor;

    beforeEach(async () => {
        iis = await IdentifierIssuerService.new({from: accounts[0]});
        vendor = await Vendor.new({from: accounts[0]});
    });

    it("should retrieve a vendorId", async () => {
        await vendor.setIdentifierIssuerServiceAddress(iis.address, {from: accounts[0]});
        await vendor.getVendorId({from: accounts[0]});

        const expected = new BN("1", 10);
        const actual = await vendor.vendorId.call({from: accounts[0]});

        assert.equal(actual.eq(expected), true, "value of requested vendorId is unexpected");
    });

    it("should retrieve a vulnerabilityId", async () => {
        await vendor.setIdentifierIssuerServiceAddress(iis.address, {from: accounts[0]});
        await vendor.getVendorId({from: accounts[0]});

        const expected = "SNTL-1-1";
        const actual = await vendor.getVulnerabilityId.call({from: accounts[0]});

        assert.equal(actual, expected, "value of requested vulnerabilityId is unexpected");
    });
});