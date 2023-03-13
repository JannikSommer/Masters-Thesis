import Web3 from "web3";
import fs from "fs";
import { exit } from "process";

// set up provider
var web3 = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:7545'));

let address = "0xa0971Ad4AB095DBed70f673b7b3d1d102B22Eb6d";

// contract metadata and setup
let file = fs.readFileSync('../build/contracts/Asdfg.json');
let contract_data = JSON.parse(file);
let contract = new web3.eth.Contract(contract_data.abi, address);

var events = await contract.getPastEvents("Announcement", {
                fromBlock: 0,
                toBlock: 'latest'
                }, 
                function(error, events){ 
                    if (error) throw error;
                    return events;
                });

console.log(events);

exit(0);