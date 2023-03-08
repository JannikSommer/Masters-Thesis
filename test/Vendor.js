const IdentifierIssuerService = artifacts.require("./IdentifierIssuerService.sol");
const Vendor = artifacts.require("./Vendor.sol");
const AnnouncementService = artifacts.require("./AnnouncementService.sol");
const BN = require("bn.js");

contract("Vendor", async (accounts) => {
    let iis, vendor, as;

    beforeEach(async () => {
        iis = await IdentifierIssuerService.new({from: accounts[0]});
        as = await AnnouncementService.new({from: accounts[0]});
        vendor = await Vendor.new("Test Vendor", as.address, iis.address, {from: accounts[0]});
    });

    it("should have a vendor name", async () => {
        assert.equal(await vendor.vendorName.call({from: accounts[0]}), "Test Vendor");
    });

    it("should retrieve a vendorId automatically", async () => {
        const expected = new BN("1", 10);
        const actual = await vendor.vendorId.call({from: accounts[0]});

        assert.equal(actual.eq(expected), true, "value of requested vendorId is unexpected");
    });

    it("should retrieve a vulnerabilityId", async () => {
        const expected = "SNTL-1-1";
        const actual = await vendor.getVulnerabilityId.call({from: accounts[0]});

        assert.equal(actual, expected, "value of requested vulnerabilityId is unexpected");
    });
});