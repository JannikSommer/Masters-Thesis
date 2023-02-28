import { ethers } from "ethers";
import fs from "fs";

let provider = new ethers.WebSocketProvider('ws://127.0.0.1:7545');

let v_address = "0x33887C1C0d1A59386a8e45611bE8253bEF447cc5";
let as_address = "0x2c47360f9C67ccA40EC00f2cC7ce9b199212A408";

let file = fs.readFileSync('../build/contracts/AnnouncementService.json');
let contract_data = JSON.parse(file);

const contract = new ethers.Contract(as_address, contract_data.abi, provider);
let eventFilter = await contract.queryFilter(contract.getEvent("Announcement"));
console.log(eventFilter);