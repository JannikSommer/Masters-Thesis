// localstorage keys
export const LS_KEY_DEP = "SENTINEL-settings-dependencies";
export const LS_KEY_WL = "SENTINEL-settings-whitelist";
export const LS_KEY_ACC = "SENTINEL-settings-accounts";
export const LS_KEY_PWD = "SENTINEL-password-data";
export const LS_KEY_CON = "SENTINEL-settings-contracts";

export const CONTACT_ADDRESS = "0xdb3c81C5cEFfed3aFfaAaE99d4dC19e88507B1b5";
export const CONTACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "advisoryIdentifier",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "vulnerabilityIdentifiers",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "productIdentifiers",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "documentLocation",
        "type": "string"
      }
    ],
    "name": "NewSecurityAdvisory",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "advisoryIdentifier",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "vulnerabilityIdentifiers",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "productIdentifiers",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "documentLocation",
        "type": "string"
      }
    ],
    "name": "UpdatedSecurityAdvisory",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "advisoryIdentifier",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "vulnerabilityIdentifiers",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "productIdentifiers",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "documentLocation",
        "type": "string"
      }
    ],
    "name": "announceNewAdvisory",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "advisoryIdentifier",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "vulnerabilityIdentifiers",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "productIdentifiers",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "documentLocation",
        "type": "string"
      }
    ],
    "name": "announceUpdatedAdvisory",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
export const VENDOR_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "announcementServiceAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "identifierIssuerServiceAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "vendorId",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "vendorName",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "count",
        "type": "uint16"
      }
    ],
    "name": "getVulnerabilityIds",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAdvisoryId",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "count",
        "type": "uint16"
      },
      {
        "internalType": "string",
        "name": "productIds",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "location",
        "type": "string"
      }
    ],
    "name": "announceNewAdvisory",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "advisoryId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "vulnerabilityIds",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "productId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "location",
        "type": "string"
      }
    ],
    "name": "announceUpdatedAdvisory",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
export const PRIVATE_CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "hash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "decryptionKey",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "bytes12",
        "name": "iv",
        "type": "bytes12"
      }
    ],
    "name": "Announcement",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "publicKey",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "pKey",
        "type": "bytes"
      }
    ],
    "name": "setPublicKey",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "vendor",
        "type": "address"
      }
    ],
    "name": "addVendor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "vendor",
        "type": "address"
      }
    ],
    "name": "removeVendor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "hash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "dKey",
        "type": "bytes"
      },
      {
        "internalType": "bytes12",
        "name": "iv",
        "type": "bytes12"
      }
    ],
    "name": "announce",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]