const IdentifierIssuerService = artifacts.require("./IdentifierIssuerService.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

contract("Identifier Issuer Service", async (accounts) => {
    let iis;

    beforeEach(async () => {
        iis = await IdentifierIssuerService.new({from: accounts[0]});
    });

    it("should not allow non-smart contract wallets to register as a vendor", async () => {
        //const iisInstance = await IdentifierIssuerService.deployed();
        truffleAssert.fails(
            iis.registerVendor.call({from: accounts[0]}),
            truffleAssert.ErrorType.REVERT
        );
    });

    it("should not allow non-smart contract wallets to request identifiers", async () => {
        //const iisInstance = await IdentifierIssuerService.deployed();
        truffleAssert.fails(
            iis.requestVulnerabilityIdentifier.call({from: accounts[0]}), 
            truffleAssert.ErrorType.REVERT
        );
    });


});