import Web3 from "web3";
import { exit } from "process";

const web3 = new Web3("https://rpc.sepolia.org/");
let account = web3.eth.accounts.create();
console.log(account);
exit(0);