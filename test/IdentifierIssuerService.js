const IdentifierIssuerService = artifacts.require("./IdentifierIssuerService.sol");
const Vendor = artifacts.require("./Vendor.sol");
const AnnouncementService = artifacts.require("./AnnouncementService.sol");
const truffleAssert = require('truffle-assertions');
const BN = require("bn.js");

contract("Identifier Issuer Service", async (accounts) => {
    let iis;

    beforeEach(async () => {
        iis = await IdentifierIssuerService.new({from: accounts[0]});
    });

    it("should not allow non-smart contract wallets to register as a vendor", async () => {
        await truffleAssert.fails(
            iis.registerVendor({from: accounts[0]}),
            truffleAssert.ErrorType.REVERT,
            "Call only accessible from smart contract"
        );
    });

    it("should not allow non-smart contract wallets to request identifiers", async () => {
        await truffleAssert.fails(
            iis.requestVulnerabilityIdentifier({from: accounts[0]}), 
            truffleAssert.ErrorType.REVERT,
            "Call only accessible from smart contract"
        );
    });

    it("should return a vendorId of 0 for unregistered addresses", async () => {
        const expected = new BN("0", 10);
        const actual = await iis.getVendorId.call(iis.address, {from: accounts[0]});
        assert.equal(actual.eq(expected), true);
    });

    it("should return the vendorId of registered addresses", async () => {
        const as = await AnnouncementService.new({from: accounts[0]});
        const vendor = await Vendor.new("Test Vendor", as.address, iis.address, {from: accounts[0]});

        const expected = new BN("1", 10);
        const iisActual = await vendor.vendorId.call({from: accounts[0]});
        const vendorActual = await iis.getVendorId.call(vendor.address, {from: accounts[0]})


        assert.equal(iisActual.gt(new BN("0", 10)), true, "no vendorId was assigned");       // 0 is default value. If its greater than zero an id was assigned
        assert.equal(vendorActual.eq(expected), true, "value of vendorId on vendor contract unexpected");
        assert.equal(iisActual.eq(expected), true, "value of vendorId on vendor contract unexpected");
    });

    it("should return an empty array of vulnerability ids for a new vendor", async () => {
        const expected = [];
        const actual = await iis.getVulnerabilities.call(1, {from: accounts[0]});
        assert.equal(JSON.stringify(expected), JSON.stringify(actual));
    });

    it("should return an array of vulnerability ids for a vendor", async () => {
        const as = await AnnouncementService.new({from: accounts[0]});
        const vendor = await Vendor.new("Test Vendor", as.address, iis.address, {from: accounts[0]});
        
        await vendor.getVulnerabilityId(); 
        await vendor.getVulnerabilityId();
        await vendor.getVulnerabilityId();

        const expected = ["SNTL-1-1", "SNTL-1-2", "SNTL-1-3"];
        const actual = await iis.getVulnerabilities.call(1, {from: accounts[0]});
        assert.equal(JSON.stringify(expected), JSON.stringify(actual));
    });
});