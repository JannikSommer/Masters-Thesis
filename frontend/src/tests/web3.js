const assert = require("assert");
const { describe, beforeEach } = require("mocha");
const fs = require('fs');

const Web3 = require('web3');

let Web3Gateway = require('../models/web3/web3Gateway');

const ACCOUNT_PKEY = "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63";
const AS_BYTECODE = JSON.parse(fs.readFileSync("../build/contracts/AnnouncementService.json")).bytecode;
const AS_ABI = JSON.parse(fs.readFileSync("../build/contracts/AnnouncementService.json")).abi;

const IIS_BYTECODE = JSON.parse(fs.readFileSync("../build/contracts/IdentifierIssuerService.json")).bytecode;
const IIS_ABI = JSON.parse(fs.readFileSync("../build/contracts/IdentifierIssuerService.json")).abi;

const VENDOR_BYTECODE = JSON.parse(fs.readFileSync("../build/contracts/Vendor.json")).bytecode;
const VENDOR_CONTRACT_ABI = JSON.parse(fs.readFileSync("../build/contracts/Vendor.json")).abi;

const PRIVATE_BYTECODE = JSON.parse(fs.readFileSync("../build/contracts/Private.json")).bytecode;
const PRIVATE_CONTRACT_ABI = JSON.parse(fs.readFileSync("../build/contracts/Private.json")).abi;

const delay = ms => new Promise(
    resolve => setTimeout(resolve, ms)
);

describe("Web3 Gateway test", function() {
    let web3 = new Web3(Web3.givenProvider || 'ws://127.0.0.1:7545');
    const account = web3.eth.accounts.privateKeyToAccount(ACCOUNT_PKEY);
    let announcementService = new web3.eth.Contract(AS_ABI);
    let identifierIssuerService = new web3.eth.Contract(IIS_ABI);

    let web3Gateway;

    beforeEach( async () => {
        web3Gateway = new Web3Gateway(web3);
        await web3Gateway.clearSubscriptions();

        await announcementService.deploy({data: AS_BYTECODE})
        .send({from: account.address, gas: 6721975, gasPrice: '20000000000'})
            .then((newContractInstance) => { announcementService = newContractInstance;});

        await identifierIssuerService.deploy({data: IIS_BYTECODE})
            .send({from: account.address, gas: 6721975, gasPrice: '20000000000'})
                .then((newContractInstance) => { identifierIssuerService = newContractInstance;});
    });

    describe("Test event subscription from gateway", function() {
        it("Should subscribe to new security advisory announcement events", async () => {
            await web3Gateway.subscribeNewSecurityAdvisories(() => {});
            assert.notStrictEqual(web3Gateway.subscriptions.length, 0);
        });

        it("Should subscribe to updated security advisory announcement events", async () => {
            await web3Gateway.subscribeToSecurityAdvisoryUpdates(() => {}, "SNTL-A-1-1");
            assert.notStrictEqual(web3Gateway.subscriptions.length, 0);
        });

        it("Should subscribe to private security advisory announcement events", async () => {
            let private = new web3.eth.Contract(PRIVATE_CONTRACT_ABI);
            await private.deploy({data: PRIVATE_BYTECODE})
                .send({from: account.address, gas: 6721975, gasPrice: '20000000000'})
                    .then((newContractInstance) => { private = newContractInstance;});

            await web3Gateway.subscribeToPrivateSecurityAdvisories(() => {}, private.options.address);
            assert.notStrictEqual(web3Gateway.subscriptions.length, 0);
        });
    });

    describe("Test announcement transactions from gateway", function() {
        it("Should create a transaction for New Security Advisory event", async () => {
            let vendor = await new web3.eth.Contract(VENDOR_CONTRACT_ABI);
            await vendor.deploy({
                data: VENDOR_BYTECODE, 
                arguments: [
                    "Vendor1", 
                    announcementService.options.address, 
                    identifierIssuerService.options.address
                ]})
                .send({from: account.address, gas: 6721975, gasPrice: '20000000000'})
                    .then((newContractInstance) => { vendor = newContractInstance });

            const sender = {address: account.address, key: ACCOUNT_PKEY};
            const recipient = {address: vendor.options.address}; 
            const payload = {vulnerabilityCount: 1, productIds: "PID1,PID2", fileLocation: "ipfs/QmX1"};

            await web3Gateway.announcePublicSecurityAdvisory(sender, recipient, payload);
            
            await delay(1000); // wait of network to process transaction

            let events = await announcementService.getPastEvents('NewSecurityAdvisory', {fromBlock: 0, toBlock: 'latest'});
            assert.notStrictEqual(events, null);
            assert.notStrictEqual(events, undefined);
            assert.notStrictEqual(events, []);
        })

        it("Should create a transaction for a Updated Security Advisory event", async () => {
            let vendor = await new web3.eth.Contract(VENDOR_CONTRACT_ABI);
            await vendor.deploy({
                data: VENDOR_BYTECODE, 
                arguments: [
                    "Vendor1", 
                    announcementService.options.address, 
                    identifierIssuerService.options.address
                ]
            }).send({from: account.address, gas: 6721975, gasPrice: '20000000000'})
                    .then((newContractInstance) => { vendor = newContractInstance;});
            const sender = {address: account.address, key: ACCOUNT_PKEY};
            const recipient = {address: vendor.options.address}; 
            const payload = {
                advisoryId: "SNTL-A-1-1",
                vulnerabilityIds: "VID1,VID2",
                productIds: "PID1,PID2",
                fileLocation: "ipfs/QmX1",
            }
            await web3Gateway.announcePublicSecurityAdvisoryUpdate(sender, recipient, payload);

            await delay(1000); // wait of network to process transaction

            let events = await announcementService.getPastEvents('UpdatedSecurityAdvisory', {fromBlock: 0, toBlock: 'latest'});
            assert.notStrictEqual(events, null);
            assert.notStrictEqual(events, undefined);
            assert.notStrictEqual(events, []);
        })

        it("Should create a transaction for a Private Security Advisory event", async () => {
            let private = await new web3.eth.Contract(PRIVATE_CONTRACT_ABI);
            await private.deploy({data: PRIVATE_BYTECODE})
                .send({from: account.address, gas: 6721975, gasPrice: '20000000000'})
                    .then((newContractInstance) => { private = newContractInstance;});

            const sender = {address: account.address, key: ACCOUNT_PKEY};
            const recipient = {address: private.options.address}; 
            const payload = {
                fileLocation: "ipfs/QmX1",
                fileHash: "fileHash",
                wrappedKey: "wrappedKey",
                iv: new Uint8Array("ouasfgyuiaos"),
            }
            await web3Gateway.whitelistVendor(sender, recipient, account.address);

            await delay(1000); // wait of network to process transaction

            await web3Gateway.announcePrivateSecurityAdvisory(sender, recipient, payload);

            await delay(1000); // wait of network to process transaction

            let events = await private.getPastEvents('Announcement', {fromBlock: 0, toBlock: 'latest'});
            assert.notStrictEqual(events, null);
            assert.notStrictEqual(events, undefined);
            assert.notStrictEqual(events, []);
        })
    });

    describe("Test vendor whitelisting transactions from gateway", function() {
        it("Should whitelist a vendor", async () => {
            let private = await new web3.eth.Contract(PRIVATE_CONTRACT_ABI);
            await private.deploy({data: PRIVATE_BYTECODE})
                .send({from: account.address, gas: 6721975, gasPrice: '20000000000'})
                    .then((newContractInstance) => { private = newContractInstance;});
            const sender = {address: account.address, key: ACCOUNT_PKEY};
            const recipient = {address: private.options.address}; 

            await web3Gateway.whitelistVendor(sender, recipient, account.address);

            await delay(1000); // wait of network to process transaction

            // The vendor whitelist is private and cannot be viewed.
            // The completion of the transaction is the only way to know if it was successful.
            assert.equal(true, true);
        });

        it("Should remove a vendor from whitelist", async () => {
            let private = await new web3.eth.Contract(PRIVATE_CONTRACT_ABI);
            await private.deploy({data: PRIVATE_BYTECODE})
                .send({from: account.address, gas: 6721975, gasPrice: '20000000000'})
                    .then((newContractInstance) => { private = newContractInstance;});

            const sender = {address: account.address, key: ACCOUNT_PKEY};
            const recipient = {address: private.options.address}; 

            await web3Gateway.whitelistVendor(sender, recipient, account.address);

            await delay(1000); // wait of network to process transaction

            await web3Gateway.removeVendorFromWhitelist(sender, recipient, account.address);

            await delay(1000); // wait of network to process transaction

            // The vendor whitelist is private and cannot be viewed.
            // The completion of the transaction is the only way to know if it was successful.
            assert.equal(true, true);
        });
    });
});