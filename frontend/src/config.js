// localstorage keys
export const LS_KEY_DEP = "SENTINEL-settings-dependencies";
export const LS_KEY_WL = "SENTINEL-settings-whitelist";
export const LS_KEY_ACC = "SENTINEL-settings-accounts";

export const CONTACT_ADDRESS = "0x0def8D3457378239E498501F0e40c3c0687058CD";
export const CONTACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "vulnerabilityId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "productId",
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
        "name": "vulnerabilityId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "productId",
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
        "name": "vulnerabilityId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "productId",
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
        "name": "vulnerabilityId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "productId",
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
    "inputs": [],
    "name": "getVulnerabilityId",
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
    "name": "announceNewAdvisory",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "vulnerabilityId",
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
]