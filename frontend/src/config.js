export const CONTACT_ADDRESS = "0x3C32bD77d376D59660BA1C926c4F2392Ee141B0A";

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
    "name": "NewSecuriytAdvisory",
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