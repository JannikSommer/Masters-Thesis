import Web3 from "web3";
import fs from "fs";
import { exit } from "process";

if (process.argv[2] == "--help" || process.argv[2] == "-h") {
    console.log("Usage: node deployments.js [local|testnet] [private key] [alchemy api key]");
    exit(0);
}

if (process.argv.length < 3) {
    console.log("Please specify either 'local' or 'testnet' as the first argument.");
    exit(1);
}

if (process.argv[2] == "testnet" && process.argv.length < 5) {
    console.log("Please specify a private key for a valid address and an Alchemy API key for the testnet.");
    exit(1);
}

const AS_BYTECODE = JSON.parse(fs.readFileSync("../../build/contracts/AnnouncementService.json")).bytecode;
const AS_ABI = JSON.parse(fs.readFileSync("../../build/contracts/AnnouncementService.json")).abi;

const IIS_BYTECODE = JSON.parse(fs.readFileSync("../../build/contracts/IdentifierIssuerService.json")).bytecode;
const IIS_ABI = JSON.parse(fs.readFileSync("../../build/contracts/IdentifierIssuerService.json")).abi;

const VENDOR_BYTECODE = JSON.parse(fs.readFileSync("../../build/contracts/Vendor.json")).bytecode;
const VENDOR_CONTRACT_ABI = JSON.parse(fs.readFileSync("../../build/contracts/Vendor.json")).abi;

const PRIVATE_BYTECODE = JSON.parse(fs.readFileSync("../../build/contracts/Private.json")).bytecode;
const PRIVATE_CONTRACT_ABI = JSON.parse(fs.readFileSync("../../build/contracts/Private.json")).abi;

let web3;
let account;
try {
    if (process.argv[2] == "local") {
        console.log("Using local blockchain (Ganache)...");
        web3 = new Web3("ws://127.0.0.1:7545");
        account = web3.eth.accounts.privateKeyToAccount(process.argv[3]);
        web3.eth.accounts.wallet.add(account);
    } else if (process.argv[2] == "testnet") {
        console.log("Using testnet (Sopelia)...");
        web3 = new Web3('wss://eth-sepolia.g.alchemy.com/v2/' + process.argv[4]);
        account = web3.eth.accounts.privateKeyToAccount(process.argv[3]);
        web3.eth.accounts.wallet.add(account);
    }
} catch (e) {
    console.log("Error: " + e);
    exit(1);
}

let results = [];

results.push({
    contract: "AS", 
    estimate: await new web3.eth.Contract(AS_ABI).deploy({data: AS_BYTECODE}).estimateGas({from: account.address})
});

results.push({
    contract: "IIS", 
    estimate: await new web3.eth.Contract(IIS_ABI).deploy({data: IIS_BYTECODE}).estimateGas({from: account.address})
});

let args = ["AB", "0x3150Aaa345BDe1D1c7DB3E68E0E19114A75332F0", "0xB7595522b49D7BfA2F4D085952164C9bf681E422"];

results.push({
    contract: "VENDOR",
    estimate: await new web3.eth.Contract(VENDOR_CONTRACT_ABI).deploy({data: VENDOR_BYTECODE, arguments: args}).estimateGas({from: account.address})
});

results.push({
    contract: "PRIVATE",
    estimate: await new web3.eth.Contract(PRIVATE_CONTRACT_ABI).deploy({data: PRIVATE_BYTECODE}).estimateGas({from: account.address})
});

console.log(results);

exit(0);