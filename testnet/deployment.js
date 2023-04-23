import Web3 from "web3";
import fs from "fs";
import { exit } from "process";

const AS_BYTECODE = JSON.parse(fs.readFileSync("../build/contracts/AnnouncementService.json")).bytecode;
const AS_ABI = JSON.parse(fs.readFileSync("../build/contracts/AnnouncementService.json")).abi;

const IIS_BYTECODE = JSON.parse(fs.readFileSync("../build/contracts/IdentifierIssuerService.json")).bytecode;
const IIS_ABI = JSON.parse(fs.readFileSync("../build/contracts/IdentifierIssuerService.json")).abi;

const VENDOR_BYTECODE = JSON.parse(fs.readFileSync("../build/contracts/Vendor.json")).bytecode;
const VENDOR_CONTRACT_ABI = JSON.parse(fs.readFileSync("../build/contracts/Vendor.json")).abi;

const PRIVATE_BYTECODE = JSON.parse(fs.readFileSync("../build/contracts/Private.json")).bytecode;
const PRIVATE_CONTRACT_ABI = JSON.parse(fs.readFileSync("../build/contracts/Private.json")).abi;

const web3 = new Web3("https://rpc.sepolia.org/");
const account = web3.eth.accounts.privateKeyToAccount(process.argv[2]);
web3.eth.accounts.wallet.add(account);

//console.log("Deploying Announcement Service...");
//let as = await new web3.eth.Contract(AS_ABI).deploy({data: AS_BYTECODE}).send({from: account.address, gas: 3000000});

//console.log("Deploying Identifier Issuer Service...");
//let iis = await new web3.eth.Contract(IIS_ABI).deploy({data: IIS_BYTECODE}).send({from: account.address, gas: 3000000});

console.log("Deploying Vendor Contract...");
let vendor = await new web3.eth.Contract(VENDOR_CONTRACT_ABI).deploy({
    data: VENDOR_BYTECODE, 
    arguments: [
        "SommerSoftware Inc.",
        process.argv[3],
        process.argv[4]
    ]
}).send({from: account.address, gas: 3000000});
console.log(vendor);

exit(0);