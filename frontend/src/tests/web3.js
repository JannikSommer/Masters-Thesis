const assert = require("assert");
const { describe, beforeEach } = require("mocha");
const fs = require('fs');

const Web3 = require('web3');

let Web3Gateway = require('../models/web3/web3Gateway');

const { CONTACT_ABI, CONTACT_ADDRESS, VENDOR_CONTRACT_ABI, PRIVATE_CONTRACT_ABI } = require("../config.js");

const ACCOUNT_PKEY = "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63";
const AS_BYTECODE = JSON.parse(fs.readFileSync("../build/contracts/AnnouncementService.json")).bytecode;
const VENDOR_BYTECODE = JSON.parse(fs.readFileSync("../build/contracts/Vendor.json")).bytecode;
const PRIVATE_BYTECODE = JSON.parse(fs.readFileSync("../build/contracts/Private.json")).bytecode;


describe("Web3 Gateway test", async function() {
    let web3 = new Web3(Web3.givenProvider || 'ws://127.0.0.1:7545');
    const account = await web3.eth.accounts.privateKeyToAccount("e056ef5fce1cb5a2aa2ea03635ebaa53b1710381c7975fc0ece4062cdeb6d878");
    let announcementService = await new web3.eth.Contract(CONTACT_ABI);
    let web3Gateway;

    beforeEach(async () => {
        web3Gateway = new Web3Gateway();
        await announcementService.deploy({data: AS_BYTECODE})
            .send({from: account.address, gas: 6721975, gasPrice: '6721975'})
            .then((newContractInstance) => { announcementService = newContractInstance;})
        });

    describe("Test event subscription", async function() {
        it("Should subscribe to event", async () => {
            assert.equal("res", 0);
        });
    
    });

    // describe("Test transaction creation", function() {
        
    // });
});