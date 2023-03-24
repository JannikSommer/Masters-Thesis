// localstorage keys
export const LS_KEY_DEP = "SENTINEL-seetings-dependencies";
export const LS_KEY_WL = "SENTINEL-seetings-whitelist";

export const CONTACT_ADDRESS = "0xc5E576D2a662D773491D2825205De48561f09Ff4";
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