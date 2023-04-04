const Private = artifacts.require("./Private.sol");
const truffleAssert = require('truffle-assertions');

contract("Private", async (accounts) => {
    let priv;

    beforeEach(async () => {
        priv = await Private.new({from: accounts[0]});
    });

    it("should not allow non-owner addresses add vendors to the whitelist", async () => {
        await truffleAssert.fails(
            priv.addVendor(accounts[1], {from: accounts[2]}),
            truffleAssert.ErrorType.REVERT,
            "Ownable: caller is not the owner"
        );
    });
    
    it("should not allow whitelisting of address 0", async () => {
        await truffleAssert.fails(
            priv.addVendor("0x0000000000000000000000000000000000000000", {from: accounts[0]}),
            truffleAssert.ErrorType.REVERT,
            "Address 0 is not whitelistable"
        );
    });

    it("should not allow whitelisted vendors to be added the whitelist again", async () => {
        await priv.addVendor(accounts[1], {from: accounts[0]});
        await truffleAssert.fails(
            priv.addVendor(accounts[1], {from: accounts[0]}),
            truffleAssert.ErrorType.REVERT,
            "Address is already whitelisted"
        );
    });

    it("should allow the owner to add vendors to the whitelist", async () => {
        await truffleAssert.passes(
            priv.addVendor(accounts[1], {from: accounts[0]})
        );
    });


    it("should not allow non-owner addresses remove vendors to the whitelist", async () => {
        await priv.addVendor(accounts[1], {from: accounts[0]});
        await truffleAssert.fails(
            priv.removeVendor(accounts[1], {from: accounts[2]}),
            truffleAssert.ErrorType.REVERT,
            "Ownable: caller is not the owner"
        );
    });

    it("should not allow removal of address 0 from whitelist", async () => {
        await truffleAssert.fails(
            priv.removeVendor("0x0000000000000000000000000000000000000000", {from: accounts[0]}),
            truffleAssert.ErrorType.REVERT,
            "Address 0 is not whitelistable"
        );
    });
    
    it("should not allow removal of vendors which are not on the whitelist", async () => {
        await truffleAssert.fails(
            priv.removeVendor(accounts[1], {from: accounts[0]}),
            truffleAssert.ErrorType.REVERT,
            "Address is not whitelisted"
        );
    });

    it("should allow the owner to remove vendors to the whitelist", async () => {
        await priv.addVendor(accounts[1], {from: accounts[0]});
        await truffleAssert.passes(
            priv.removeVendor(accounts[1], {from: accounts[0]})
        );
    });

    it("should not allow non-whitelisted addresses to announce security advisories", async () => {
        await truffleAssert.fails(
            priv.announce("download location", "0xe2201f05ee574ee7a07a673c8b55ff50ffb7ee778d9d9abe1e9864b0fb3ae779", "0x68656c6c6f20776f726c64", "0x000000000000000000000000"), 
            truffleAssert.ErrorType.REVERT, 
            "Caller is not whitelisted"
        );
    });

    it("should emit event with location, file hash, decryption key and iv", async () => {
        await priv.addVendor(accounts[1], {from: accounts[0]});
        await priv.announce("download location", "0xe2201f05ee574ee7a07a673c8b55ff50ffb7ee778d9d9abe1e9864b0fb3ae779", "0x68656c6c6f20776f726c64", "0x000000000000000000000000", {from: accounts[1]});

        const events = await priv.getPastEvents("Announcement", { fromBlock: 0, toBlock: 'latest' });
        assert.equal(events.length, 1);
        assert.equal(events[0].returnValues.location, "download location", "location does not match expected value");
        assert.equal(events[0].returnValues.hash, "0xe2201f05ee574ee7a07a673c8b55ff50ffb7ee778d9d9abe1e9864b0fb3ae779", "hash does not match expected value");
        assert.equal(events[0].returnValues.decryptionKey, "0x68656c6c6f20776f726c64", "decryptionKey does not match expected value");
        assert.equal(events[0].returnValues.iv, "0x000000000000000000000000", "iv does not match expected value");


    });

    it("should not allow non-owner addresses to set 'publicKey' state variable", async () => {
        const key = "0x68656c6c6f20776f726c64";
        await truffleAssert.fails(
            priv.setPublicKey(key, {from: accounts[1]}),
            truffleAssert.ErrorType.REVERT,
            "Ownable: caller is not the owner"
        ) 
    });

    it("should allow owner to set 'publicKey' state variable", async () => {
        const key = "0x68656c6c6f20776f726c64";
        await truffleAssert.passes(priv.setPublicKey(key, {from: accounts[0]}));

        const actual = await priv.publicKey();
        assert.equal(actual, key, "'publicKey' does not match expected value")
    });

});