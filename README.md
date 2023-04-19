# SENTINEL Project
The SENTINEL project is a Master's thesis project by [@JannikSommer](https://github.com/JannikSommer) and [@mlund98](https://github.com/mlund98). The purpose of the project is to automate the dissemmination and discovery of security advisories in a decentralized manner with Web3 technologies. There will be a link to the report, **only if** it will become publically available. 

## Table of Contents
1. [Repository Structure](#repository-structure)
2. [Quickstart](#quickstart)
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

### Local Environment
You can run SENTINEL locally with a local Etherum blockchain and starting the frontend locally also. IPFS is free to use, so this guide will still make use of the real IPFS network. 

#### Local Ethereum network
Download the Ganache CLI or desktop app and start a new network. Make sure that the network software is available at http://localhost:7454 or change the necessary files in the frontend such that it can connect to the simulated network. 

You can deploy the smart contracts to the network with `truffle migrate` if you are using Truffle. This will execute the script in `./migrations/2_deplpy_migrations.js`. 

#### IPFS API 
The frontend makes use of the IPFS HTTP API which requires a local node of IPFS. You can download either the IPFS CLI or IPFS Desktop as both will make the required API availalbe. However, you need to change the config of you IPFS node to allow API calls from localhost:3000. Make sure your node configuration  includes the following. 
```
"API": {
  "HTTPHeaders": {
    "Access-Control-Allow-Origin": [
      "http://127.0.0.1:3000", <----
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

You can optionally run `npm test` to run unit and integration tests to make sure the code works. If you choose to do so, stop your Ganache instance beforehand if it is running on port 7454 as it will conflict with a temporary instance created by the test script. 


### Testnet 
_comming soon..._


## Truffle
Truffle has been chosen for the development of this project. This repository contains several folders and files realted to Truffle. The smart contract builds, migration scripts, node_modules, package.json and truffle-config are all found in the current folder. 

### Truffle config 
The config file `truffle-config.json` contains the configuration for Truffle related to this project. Two changes has been made from the standard Truffle configuration. 

1. A new network has been specified that allow tests to run connected to a Ganache instance. `truffle test` will execute with VM as default. 
2. The Solidity compiler has been set to the version of the smart contracts with `version: "pragma"` config. 

