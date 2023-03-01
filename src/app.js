import Web3 from "web3";
import fs from "fs";
import { exit } from "process";

// set up provider
var web3 = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:7545'));

// addresses
let v_address = "0x33887C1C0d1A59386a8e45611bE8253bEF447cc5";
let as_address = "0x2c47360f9C67ccA40EC00f2cC7ce9b199212A408";

// contract metadata and setup
let file = fs.readFileSync('../build/contracts/AnnouncementService.json');
let contract_data = JSON.parse(file);
let contract = new web3.eth.Contract(contract_data.abi, as_address);

var announcements = await getAllEvents(contract, "Announcement");
var transactions = await getTransactionDataFromEvents(announcements);

for (var i = 0; i < transactions.length; i++) {
    var info = {
        vendor: transactions[i].to, 
        product: announcements[i].returnValues.productId, 
        advisory: announcements[i].returnValues.documentLocation
    }
    console.log(info);
}

async function getAllEvents(contract, eventName) {
    var data = [];
    await contract.getPastEvents(eventName, {
        fromBlock: 0,
        toBlock: 'latest'
        }, 
        function(error, events){ 
            if (error) throw error;
            data = events;
        }
    )
    return data;
}

async function getEvents(contract, eventName, from, to) {
    var data = [];
    await contract.getPastEvents(eventName, {
        fromBlock: from, // e.g. 0
        toBlock: to      // e.g. 'latest'
        }, 
        function(error, events){ 
            if (error) throw error;
            data = events;
        }
    )
    return data;
}

async function getTransactionDataFromEvents(events) {
    var txs = [];
    for (const event of events) {
        var tx = await web3.eth.getTransaction(event.transactionHash).then()
        txs.push(tx);
    }
    return txs;
}

exit(0);