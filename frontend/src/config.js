export const CONTACT_ADDRESS = "0xFfC929701619D94bB77F3bb4420137497721BAfa";

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