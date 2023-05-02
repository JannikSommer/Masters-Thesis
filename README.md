# SENTINEL Project
The SENTINEL project is a Master's thesis project by [@JannikSommer](https://github.com/JannikSommer) and [@mlund98](https://github.com/mlund98). The purpose of the project is to automate the dissemination and discovery of security advisories in a decentralized manner with Web3 technologies. There will be a link to the report, **only if** it will become publicly available. 

## Table of Contents
1. [Repository Structure](#repository-structure)
2. [Quickstart](#quickstart)
    - [Docker](#docker)
    - [Local Environment](#local-environment)
    - [Testnet](#testnet)
3. [Truffle](#truffle)

## Repository Structure
The project is divided into different folders. For more information about the different parts of the repository, see the READMEs for the specific part. 

### Contracts
The smart contracts used as backend for the SENTINEL system can be found under the `/contracts` folder. The smart contracts are written in Solidity. The test for the smart contracts can be found in `/test` folder. 

### Frontend
The frontend code can be found in the `/frontend` folder. The frontend is created with React.js JavaScript framework extended with React Bootstrap as UI components. For more information about the frontend, see the README in `/frontend`. 


## Quickstart 
There are multiple ways that you can run and play with the system. Of course you are welcome to deploy the smart contracts to the Ethereum mainnet if you so desire, however, as the system is only experimental and is not in a finished state, we do not advise that. Instead, use one of the following setups. 

### Docker
You can run a complete setup of SENTINEL with the docker-compose file in this directory. The docker-compose file will spin up an IPFS node, both execution and validation clients for the Sepolia testnet, and the frontend. To get started run `docker-compose up -d` and wait for the Ethereum node to sync with the testnet. 

> A script to either use the Sepolia network or a Ganache instance is currently under consideration. 

The frontend is run from a locally build Docker image. You can find the Dockerfile in `./frontend/Dockerfile`. The execution client is [Geth (go-ethereum)](https://geth.ethereum.org) which will be used to look for transaction with from the frontend. The validation client (mandatory from The Merge) is [Lighthouse](https://github.com/sigp/lighthouse). The IPFS node is the official [Kubo](https://github.com/ipfs/kubo). 

> The testnet blockchain is potentially very long, meaning that you could store a lot of data after a full sync of the blockchain. Therefore, you should make sure that you have enough system resources to store it. 


### Local Environment
You can run SENTINEL locally with a local Ethereum blockchain and starting the frontend locally also. IPFS is free to use, so this guide will still make use of the real IPFS network. 

#### Local Ethereum network
Download the Ganache CLI or desktop app and start a new network. Make sure that the network software is available at http://localhost:8545 or ws://localhost:8546, or change the necessary files in the frontend such that it can connect to the simulated network. 

You can deploy the smart contracts to the network with `truffle migrate` if you are using Truffle. This will execute the script in `./migrations/2_deploy_migrations.js`. 

#### IPFS API 
The frontend makes use of the IPFS HTTP API which requires a local node of IPFS. You can download either the IPFS CLI or IPFS Desktop as both will make the required API available. However, you need to change the config of you IPFS node to allow API calls from localhost:3000. Make sure your node configuration  includes the following. 
```
"API": {
  "HTTPHeaders": {
    "Access-Control-Allow-Origin": [
      "http://127.0.0.1:3000", <---- (Change port to match frontend if necessary)
      "http://127.0.0.1:5001"
    ]
  }
},...
```
Once the configuration has been updated you can restart your node and it should now work with the frontend. 

> If you are running the frontend from any other port than 3000 make sure to change the configuration accordingly. 

#### Frontend
Find the address of the Announcement Service in Ganache and replace the current Announcement Service address in `./frontend/src/config.js`. 

Navigate to the frontend folder and run `npm install` to install the necessary dependencies and `npm start` to start the frontend code. 

You can optionally run `npm test` to run unit and integration tests to make sure the code works. If you choose to do so, stop your Ganache instance beforehand if it is running on port 7545 as it will conflict with a temporary instance created by the test script. 


### Testnet 
The SENTINEL is testable on the Ethereum testnet and the frontend is uploaded to IPFS to allow a _real-world_ test with no local development environment. 

#### Sepolia Testnet
The system is deployed on the [Sepolia](https://sepolia.dev) Ethereum testnet. You can find the services/contracts for SENTINEL, which can be called from any contract on the testnet. However, for the purpose of using SENTINEL for the intended purpose it is advised that you use a vendor smart contract. Furthermore, while vendor and private smart contracts have been deployed for the purpose of testing and demonstration, you should create/deploy your own contracts to interact with the system as these contracts are `ownable`. 

- Announcement Service: [`0xbdBc312f3dc75a6D47D7Eaa7E6a4BBFbb07f09fc`](https://sepolia.etherscan.io/address/0xbdbc312f3dc75a6d47d7eaa7e6a4bbfbb07f09fc)
- Identifier Issuer Service: [`0x577a791f4033F7905b822664ff0E1a74dbe5EF70`](https://sepolia.etherscan.io/address/0x577a791f4033f7905b822664ff0e1a74dbe5ef70)
- Vendor: [`0xF472cebcd32953E165eD35B51708a796EEA76A34`](https://sepolia.etherscan.io/address/0xF472cebcd32953E165eD35B51708a796EEA76A34)
- Private: [`0xFfb2234E55D1D238fE8b80Ef6e4f435AC89c375d`](https://sepolia.etherscan.io/address/0xFfb2234E55D1D238fE8b80Ef6e4f435AC89c375d)

Deployment scripts to help you deploy your own contracts can be found `./testnet` at a later point. 

#### Fronted on IPFS
The frontend is accessible on IPFS by opening the CID `QmR32KPPaM9sjTb3pUuPNApbjGoT8tkBWH9MqyMgcL48Rf` on any IPFS gateway. However, it is highly advised that you use a local gateway to cover security concerns. 

It is recommended that you use the same gateway all the time, as each website will (probably) require their own setup in localstorage. If you are concerned about the security of using another gateway, you can use the one that comes with IPFS Desktop or IPFS CLI. 


## Truffle
Truffle has been chosen for the development of this project. This repository contains several folders and files related to Truffle. The smart contract builds, migration scripts, node_modules, package.json and truffle-config are all found in the current folder. 

### Truffle config 
The config file `truffle-config.json` contains the configuration for Truffle related to this project. Two changes has been made from the standard Truffle configuration. 

1. A new network has been specified that allow tests to run connected to a Ganache instance. `truffle test` will execute with VM as default. 
2. The Solidity compiler has been set to the version of the smart contracts with `version: "pragma"` config. 

