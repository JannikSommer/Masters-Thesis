import Web3 from 'web3';
import { ALCHEMY_API_KEY } from "../../secrets.js";

const { CONTACT_ABI, CONTACT_ADDRESS, VENDOR_CONTRACT_ABI, PRIVATE_CONTRACT_ABI } = require("../../config.js");

export default class Web3Gateway {
    /**
     * Web3 instance for the application.
     * @type {Web3} 
     */
    web3;

    /**
     * Contract object of the Announcement Service.
     * @type {Web3.eth.Contract}  
     */
    announcementService;

    /**
     * Array of event subscriptions.
     * @type {event[]} Web3 event objects.
     */
    subscriptions = [];

    /**
     * Array of new security advisory events.
     * @type {event[]} Web3 event objects.
     */
    newSecurityAdvisoryEvents = [];

    /**
     * Array of updated security advisory events.
     * @type {event[]} Web3 event objects.
     */
    updatedSecurityAdvisoryEvents = [];

    /**
     * Array of private security advisory events.
     * @type {event[]} Web3 event objects.
     */
    privateSecurityAdvisoryEvents = [];

    constructor(web3 = undefined) {
        if (web3) 
            this.web3 = web3;
        else 
            this.web3 = new Web3(Web3.givenProvider || 'wss://eth-sepolia.g.alchemy.com/v2/' + ALCHEMY_API_KEY);
        
        this.announcementService = new this.web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
    }
    
    /**
     * Clear all subscriptions made to announcement service and private contracts.
     */
    async clearSubscriptions() {
        this.web3.eth.clearSubscriptions();
        this.subscriptions = []; // perhaps need to be popped instead
        this.newSecurityAdvisoryEvents = [];
        this.updatedSecurityAdvisoryEvents = [];
        this.privateSecurityAdvisoryEvents = [];
    }

    /**
     * Subscribe to new security advisory events on the Announcement Service. 
     * @param {requestCallback} callback function for when events are found. 
     */ 
    async subscribeNewSecurityAdvisories(callback) {
        this.subscriptions.push(this.announcementService.events.NewSecurityAdvisory(
            {fromBlock: 0}, 
            callback)
        );
    }

    /**
     * Subscribe to updated security advisory events on the Announcement Service.
     * @param {requestCallback} callback function for when events are found.
     * @param {string} advisoryIdentifier Identifier from the NewSecurityAdvisory event to subscribe to updates for.
     */
    async subscribeToSecurityAdvisoryUpdates(callback, advisoryIdentifier) {
        this.subscriptions.push(this.announcementService.events.UpdatedSecurityAdvisory({
            // eslint-disable-next-line
            topics: [ , this.web3.utils.soliditySha3({type: 'string', value: advisoryIdentifier})],
            fromBlock: 0},
            callback)
        );
    }

    /** 
     * Subscribe to private security advisory events on a private contract.
     * @param {requestCallback} callback function for when events are found.
     * @param {string} address Address of the private contract to subscribe to.
     */
    async subscribeToPrivateSecurityAdvisories(callback, address) {
        let contract = new this.web3.eth.Contract(PRIVATE_CONTRACT_ABI, address);
        this.subscriptions.push(contract.events.Announcement({
            fromBlock: 0
        }, callback));
    }

    /**
     * Make a transaction to a vendor smart contract to announce a new security advisory.
     * @param {Object} sender Sender object of the transaction.
     * @param {string} sender.address Address of the sender.
     * @param {string} sender.key Private key of the sender.
     * @param {Object} recipient Recipient object of the transaction.
     * @param {string} recipient.address Address of the recipient.
     * @param {Object} payload Data to be sent in the transaction.
     * @param {number} payload.vulnerabilityCount Number of vulnerabilities in the advisory.
     * @param {string} payload.productIds String of product IDs affected by the advisory.
     * @param {string} payload.fileLocation Location of the advisory file.
     * @param {number} [gas=6721975] Gas limit for the transaction (default: 6721975).
     */
    async announcePublicSecurityAdvisory(sender, recipient, payload, gas = 6721975) {
        const contract = new this.web3.eth.Contract(VENDOR_CONTRACT_ABI, recipient.address);
        const config = {
            from: sender.address,
            to: recipient.address,
            gas: gas,
            data: contract.methods.announceNewAdvisory(
                    payload.vulnerabilityCount,
                    payload.productIds,
                    payload.fileLocation)
                .encodeABI()
        }
        const signedTx = await this.web3.eth.accounts.signTransaction(config, sender.key);
        try {
            const tx = await this.web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
            return tx;
        }
        catch (error) {
            throw error;
        }
    }

    /**
     * Make a transaction to a vendor smart contract to announce an update to a security advisory.
     * @param {Object} sender Sender object of the transaction.
     * @param {string} sender.address Address of the sender.
     * @param {string} sender.key Private key of the sender.
     * @param {Object} recipient Recipient object of the transaction.
     * @param {string} recipient.address Address of the recipient.
     * @param {Object} payload Data to be sent in the transaction.
     * @param {string} payload.advisoryId Identifier of the advisory to be updated.
     * @param {string} payload.vulnerabilityIds String of vulnerability IDs to be updated.
     * @param {string} payload.productIds String of product IDs to be updated.
     * @param {string} payload.fileLocation Location of the advisory file.
     * @param {number} [gas=6721975] Gas limit for the transaction (default: 6721975).
     */
    async announcePublicSecurityAdvisoryUpdate(sender, recipient, payload, gas = 6721975) { 
        const contract = new this.web3.eth.Contract(VENDOR_CONTRACT_ABI, recipient.address);
        const config = {   
            from: sender.address,
            to: recipient.address,
            gas: gas,
            data: contract.methods.announceUpdatedAdvisory(
                    payload.advisoryId, 
                    payload.vulnerabilityIds, 
                    payload.productIds,  
                    payload.fileLocation)
                .encodeABI()
        }
        const signedTx = await this.web3.eth.accounts.signTransaction(config, sender.key);
        try {
            const tx = await this.web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
            return tx;
        }
        catch (error) {
            throw error;
        }
    }

    /**
     * Make a transaction to a "private" contract to announce a confidential security advisory.
     * All Web3 related functions are handled in this function by the static web3 instance.
     * @param {Object} sender Sender object of the transaction.
     * @param {string} sender.address Address of the sender.
     * @param {string} sender.key Private key of the sender.
     * @param {Object} recipient Recipient object of the transaction.
     * @param {string} recipient.address Address of the recipient.
     * @param {Object} payload Data to be sent in the transaction.
     * @param {string} payload.fileLocation Location of the advisory file.
     * @param {Uint8Array} payload.fileHash Hash of the advisory file.
     * @param {Uint8Array} payload.wrappedKey Wrapped key for the advisory file.
     * @param {Uint8Array} payload.iv Initialization vector for the advisory file.
     * @param {number} [gas=6721975] Gas limit for the transaction (default: 6721975).
     * @returns {Promise} Promise object representing the transaction.
     */
    async announcePrivateSecurityAdvisory(sender, recipient, payload, gas = 6721975) {
        const contract = new this.web3.eth.Contract(PRIVATE_CONTRACT_ABI, recipient.address);
        const config = {
            from: sender.address,
            to: recipient.address,
            gas: gas,   
            data: contract.methods.announce(
                    payload.fileLocation,
                    this.web3.utils.bytesToHex(new Uint8Array(payload.fileHash)),
                    this.web3.utils.bytesToHex(new Uint8Array(payload.wrappedKey)),
                    this.web3.utils.bytesToHex(payload.iv))
                .encodeABI()
        }
        const signedTx = await this.web3.eth.accounts.signTransaction(config, sender.key);
        try {
            const tx = await this.web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
            return tx;
        }
        catch (error) {
            throw error;
        }
    }

    /**
     * Adds a vendor to the whitelist of a private contract.
     * @param {Object} sender Sender object of the transaction.
     * @param {string} sender.address Address of the sender.
     * @param {string} sender.key Private key of the sender.
     * @param {Object} recipient Recipient object of the transaction.
     * @param {string} recipient.address Address of the recipient.
     * @param {string} toWhitelistAddress Address to be whitelisted.
     * @param {number} [gas=6721975] Gas limit for the transaction (default: 6721975).
     */
    async whitelistVendor(sender, recipient, toWhitelistAddress, gas = 6721975) {
        const contract = new this.web3.eth.Contract(PRIVATE_CONTRACT_ABI, recipient.address);
        let config = {
            from: sender.address,
            to: recipient.address,
            gas: gas,
            data: contract.methods.addVendor(toWhitelistAddress).encodeABI()
        }
        const signedTx = await this.web3.eth.accounts.signTransaction(config, sender.key);
        try {
            const tx = await this.web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
            return tx;
        }
        catch (error) {
            throw error;
        }
    }

    /**
     * Removed a vendor from the whitelist of a private contract.
     * @param {Object} sender Sender object of the transaction.
     * @param {string} sender.address Address of the sender.
     * @param {string} sender.key Private key of the sender.
     * @param {Object} recipient Recipient object of the transaction.
     * @param {string} recipient.address Address of the recipient.
     * @param {string} toRemoveAddress Address to be removed from the whitelist.
     * @param {number} [gas=6721975] Gas limit for the transaction (default: 6721975).
     */
    async removeVendorFromWhitelist(sender, recipient, toRemoveAddress, gas = 6721975) {
        const contract = new this.web3.eth.Contract(PRIVATE_CONTRACT_ABI, recipient.address);
        let config = {
            from: sender.address,
            to: recipient.address,
            gas: gas,
            data: contract.methods.removeVendor(toRemoveAddress).encodeABI()
        }
        const signedTx = await this.web3.eth.accounts.signTransaction(config, sender.key);
        try {
            const tx = await this.web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
            return tx;
        }
        catch (error) {
            throw error;
        }
    }
}