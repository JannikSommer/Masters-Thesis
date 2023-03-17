# Master's Thesis Code Repository
The code for the Master's Thesis regarding dissemination and discovery of security advisories. Notes regarding the work and research can be found in another (private) [repository](https://github.com/mlund98/SBOM-Master-Thesis).


## Structure of The Repository 
The project is divided into different folders. The structure is described as following. 

### Contracts
The smart contracts used as backend for the SENTINEL system can be found under the `/contracts` folder. The smart contracts are written in Solidity. The test for the smart contracts can be found in `/test` folder. 

### Frontend
The frontend code can be found in the `/frontend` folder. The frontend is created with React.js JavaScript framework extended with React Bootstrap as UI components. For more information about the frontend, see the README in `/frontend`. 

### Experiments 
For the purpose of the project, several experiments have been conducted. Scripts for the purpose of these experiemtns can be found in the `/src` folder. 

## Truffle
Truffle has been chosen for the development of this project. This repository contains several folders and files realted to Truffle. The smart contract builds, migration scripts, node_modules, package.json and truffle-config are all found in the current folder. 

### Truffle config 
The config file `truffle-config.json` contains the configuration for Truffle related to this project. Two changes has been made from the standard Truffle configuration. 

1. A new network has been specified that allow tests to run connected to a Ganache instance. `truffle test` will execute with VM as default. 
2. The Solidity compiler has been set to the version of the smart contracts with `version: "pragma"` config. 

