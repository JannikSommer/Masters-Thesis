import Web3 from "web3";
import fs from "fs";
import { exit } from "process";

if (process.argv[2] == "--help" || process.argv[2] == "-h") {
    console.log("The script will deploy SENTINEL smart contracts to the Sepolia Ethereum Testnet.");
    console.log("Usage: node deployment.js [1|2|3|4] [account private key] [alchemy api key] [announcement service address] [identifier issuer service address]");
    console.log("1: Deploy Announcement Service");
    console.log("2: Deploy Identifier Issuer Service");
    console.log("3: Deploy Vendor Contract");
    console.log("4: Deploy Private Contract");
    console.log("The account private key and the Alchemy API key are required for all deployments.");
    console.log("The announcement service address and the identifier issuer service address are required for the deployment of the vendor contract.");
    exit(0);
}

if (process.argv.length < 3) {
    console.log("Please specify either '1', '2', '3' or '4' as the first argument.");
    console.log("Use 'node deployment.js --help' for more information.");
    exit(1);
}

if (process.argv.length < 5) {
    console.log("Please specify a private key for a valid address and an Alchemy API key for the testnet.");
    console.log("Use 'node deployment.js --help' for more information.");
    exit(1);
}

if (process.argv[2] != "1" && process.argv[2] != "2" && process.argv[2] != "3" && process.argv[2] != "4") {
    console.log("Please specify either '1', '2', '3' or '4' as the first argument.");
    console.log("Use 'node deployment.js --help' for more information.");
    exit(1);
}

if (process.argv[2] == "3" && process.argv.length < 6) {
    console.log("Please specify the address of the Announcement Service contract as the fifth argument and the address of the Identifier Issuer Service as the sixth argument.");
    console.log("Use 'node deployment.js --help' for more information.");
    exit(1);
}

const toDeploy = process.argv[2];

const ALCHEMY_API_KEY = process.argv[4];
const PRIVATE_KEY = process.argv[3];

const AS_BYTECODE = JSON.parse(fs.readFileSync("../build/contracts/AnnouncementService.json")).bytecode;
const AS_ABI = JSON.parse(fs.readFileSync("../build/contracts/AnnouncementService.json")).abi;

const IIS_BYTECODE = JSON.parse(fs.readFileSync("../build/contracts/IdentifierIssuerService.json")).bytecode;
const IIS_ABI = JSON.parse(fs.readFileSync("../build/contracts/IdentifierIssuerService.json")).abi;

const VENDOR_BYTECODE = JSON.parse(fs.readFileSync("../build/contracts/Vendor.json")).bytecode;
const VENDOR_CONTRACT_ABI = JSON.parse(fs.readFileSync("../build/contracts/Vendor.json")).abi;

const PRIVATE_BYTECODE = JSON.parse(fs.readFileSync("../build/contracts/Private.json")).bytecode;
const PRIVATE_CONTRACT_ABI = JSON.parse(fs.readFileSync("../build/contracts/Private.json")).abi;

const web3 = new Web3('wss://eth-sepolia.g.alchemy.com/v2/' + ALCHEMY_API_KEY);
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

if (toDeploy == "1") {
    console.log("Deploying Announcement Service...");
    const as = await new web3.eth.Contract(AS_ABI).deploy({data: AS_BYTECODE}).send({from: account.address, gas: 3000000});
    console.log(as);
}

if (toDeploy == "2") {
    console.log("Deploying Identifier Issuer Service...");
    let iis = await new web3.eth.Contract(IIS_ABI).deploy({data: IIS_BYTECODE}).send({from: account.address, gas: 3000000});
    console.log(iis);
}

if (toDeploy == "3") {
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
}

if (toDeploy == "4") {
    console.log("Deploying Private Contract...");
    let priv = await new web3.eth.Contract(PRIVATE_CONTRACT_ABI).deploy({data: PRIVATE_BYTECODE}).send({from: account.address, gas: 3000000});
    console.log(priv);
}

exit(0);