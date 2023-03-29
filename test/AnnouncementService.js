const AnnouncementService = artifacts.require("./AnnouncementService.sol");
const IdentifierIssuerService = artifacts.require("./IdentifierIssuerService.sol");
const Vendor = artifacts.require("./Vendor.sol");

const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

contract("Announcement Service", async (accounts) => {
    let as; 

    beforeEach(async () => {
        as = await AnnouncementService.new({from: accounts[0]});
    });

    it("should not allow non-smart contracts wallets to announce new security advisory", async () => {
        await truffleAssert.fails(
            as.announceNewAdvisory("advisory ID", "product ID", "document location", {from: accounts[0]}),
            truffleAssert.ErrorType.REVERT,
            "Call only accessible from smart contract"
        );
    });

    it("should not allow non-smart contracts wallets to announce updated security advisory", async () => {
        await truffleAssert.fails(
            as.announceUpdatedAdvisory("SNTL-A-123-456789", "SNTL-V-123-456789", "product ID", "document location", {from: accounts[0]}),
            truffleAssert.ErrorType.REVERT,
            "Call only accessible from smart contract"
        );
    });

    it("should emit event when announcing new security advisory", async () => {
        const iis = await IdentifierIssuerService.new({from: accounts[0]});
        const vendor = await Vendor.new("Test Vendor", as.address, iis.address, {from: accounts[0]});

        await vendor.announceNewAdvisory(1, "product ID", "document location");
        let events = await as.getPastEvents("NewSecurityAdvisory", { fromBlock: 0, toBlock: 'latest' });

        assert.equal(events.length, 1, "Event was not emitted");
    });

    it("should emit event when announcing updated security advisory", async () => {
        const iis = await IdentifierIssuerService.new({from: accounts[0]});
        const vendor = await Vendor.new("Test Vendor", as.address, iis.address, {from: accounts[0]});

        await vendor.announceUpdatedAdvisory("SNTL-A-123-456789", "SNTL-1-456789", "product ID", "document location");
        let events = await as.getPastEvents("UpdatedSecurityAdvisory", { fromBlock: 0, toBlock: 'latest' });

        assert.equal(events.length, 1, "Event was not emitted");
    });

    it("should emit 5 events when announcing 5 new security advisory", async () => {
        const iis = await IdentifierIssuerService.new({from: accounts[0]});
        const vendor = await Vendor.new("Test Vendor", as.address, iis.address, {from: accounts[0]});

        await vendor.announceNewAdvisory(1, "product ID", "document location");
        await vendor.announceNewAdvisory(1, "product ID", "document location");
        await vendor.announceNewAdvisory(1, "product ID", "document location");
        await vendor.announceNewAdvisory(1, "product ID", "document location");
        await vendor.announceNewAdvisory(1, "product ID", "document location");

        let events = await as.getPastEvents("NewSecurityAdvisory", { fromBlock: 0, toBlock: 'latest' });

        assert.equal(events.length, 5, "Actual amount of events not matching expected.");
    });

    it("should emit 5 events when announcing 5 updated security advisory", async () => {
        const iis = await IdentifierIssuerService.new({from: accounts[0]});
        const vendor = await Vendor.new("Test Vendor", as.address, iis.address, {from: accounts[0]});

        await vendor.announceUpdatedAdvisory("SNTL-A-123-456789", "SNTL-1-456789", "product ID", "document location");
        await vendor.announceUpdatedAdvisory("SNTL-A-123-456789", "SNTL-2-456789", "product ID", "document location");
        await vendor.announceUpdatedAdvisory("SNTL-A-123-456789", "SNTL-3-456789", "product ID", "document location");
        await vendor.announceUpdatedAdvisory("SNTL-A-123-456789", "SNTL-4-456789", "product ID", "document location");
        await vendor.announceUpdatedAdvisory("SNTL-A-123-456789", "SNTL-5-456789", "product ID", "document location");

        let events = await as.getPastEvents("UpdatedSecurityAdvisory", { fromBlock: 0, toBlock: 'latest' });

        assert.equal(events.length, 5, "Actual amount of events not matching expected.");
    });

    it("should emit input data in event when announcing new security advisory", async () => {
        const iis = await IdentifierIssuerService.new({from: accounts[0]});
        const vendor = await Vendor.new("Test Vendor", as.address, iis.address, {from: accounts[0]});

        await vendor.announceNewAdvisory(1, "product ID", "document location");
        let events = await as.getPastEvents("NewSecurityAdvisory", { fromBlock: 0, toBlock: 'latest' });

        assert.equal(events[0].returnValues.advisoryIdentifier, "SNTL-A-1-1", "Advisory ID does not match input");
        assert.equal(events[0].returnValues.vulnerabilityIdentifiers, "SNTL-V-1-1", "Vulnerability ID does not match input");
        assert.equal(events[0].returnValues.productIdentifiers, "product ID", "Product ID does not match input");
        assert.equal(events[0].returnValues.documentLocation, "document location", "Document location does not match input");
    });

    it("should emit input data in event when announcing updated security advisory", async () => {
        const iis = await IdentifierIssuerService.new({from: accounts[0]});
        const vendor = await Vendor.new("Test Vendor", as.address, iis.address, {from: accounts[0]});

        await vendor.announceUpdatedAdvisory("SNTL-A-123-456789", "SNTL-V-123-456789", "product ID", "document location");
        let events = await as.getPastEvents("UpdatedSecurityAdvisory", { fromBlock: 0, toBlock: 'latest' });

        // Hash the data because the event data is indexed
        const advisoryIdHash = web3.utils.soliditySha3({type: 'string', value: "SNTL-A-123-456789"});

        assert.equal(events[0].returnValues.advisoryIdentifier, advisoryIdHash, "Advisory ID does not match input");
        assert.equal(events[0].returnValues.vulnerabilityIdentifiers, "SNTL-V-123-456789", "Vulnerability ID does not match input");
        assert.equal(events[0].returnValues.productIdentifiers, "product ID", "Product ID does not match input");
        assert.equal(events[0].returnValues.documentLocation, "document location", "Document location does not match input");
    });

});