const Web3 = require('web3');

const { CONTACT_ABI, CONTACT_ADDRESS, VENDOR_CONTRACT_ABI, PRIVATE_CONTRACT_ABI } = require("../../config.js");

class Web3Gateway {

    /**
     * @type {*} Static web3 instance for the application.
     */
    web3;

    /**
     * @type {*}  Contract object of the Announcement Service.
     */
    announcementService;

    /**
     * @type {[Object]} Array of event subscriptions.
     */
    subscriptions = [];

    /**
     * @type {[Object]} Array of new security advisory events.
     */
    newSecurityAdvisoryEvents = [];

    /**
     * @type {[Object]} Array of updated security advisory events.
     */
    updatedSecurityAdvisoryEvents = [];

    /**
     * @type {[Object]} Array of private security advisory events.
     */
    privateSecurityAdvisoryEvents = [];

    constructor(web3 = undefined) {
        if (web3) 
            this.web3 = web3;
        else 
            this.web3 = new Web3(Web3.givenProvider || 'ws://localhost:7545');
        
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
     * @param {function} Callback function for when events are found. 
     */ 
    async subscribeNewSecurityAdvisories(callback) {
        this.subscriptions.push(this.announcementService.events.NewSecurityAdvisory(
            {fromBlock: 0}, 
            callback)
        );
    }

    /**
     * Subscribe to updated security advisory events on the Announcement Service.
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
     * @param {Object} recipient Recipient object of the transaction (should be a vendor contract)
     * @param {Object} payload Data to be sent in the transaction.
     * @param {number} gas Gas limit for the transaction (default: 6721975).
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
        this.web3.eth.accounts.signTransaction(config, sender.key).then((signedTx) => {
            const tx = this.web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
            tx.on('receipt', (receipt) => {
                return receipt;
            });
            tx.on('error', (error) => {
                console.log(error);
                throw error;
            });
        });
    }

    /**
     * Make a transaction to a vendor smart contract to announce an update to a security advisory.
     * @param {Object} sender Sender object of the transaction.
     * @param {Object} recipient Recipient object of the transaction (should be a vendor contract)
     * @param {Object} payload Data to be sent in the transaction.
     * @param {number} gas Gas limit for the transaction (default: 6721975).
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
        this.web3.eth.accounts.signTransaction(config, sender.key).then((signedTx) => {
            const tx = this.web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
            tx.on('receipt', (receipt) => {
                return receipt;
            });
            tx.on('error', (error) => {
                console.log(error);
                throw error;
            });
        });
    }

    /**
     * Make a transaction to a "private" contract to announce a confidential security advisory.
     * All Web3 related functions are handled in this function by the static web3 instance.
     * @param {Object} sender Sender object of the transaction.
     * @param {Object} recipient Recipient object of the transaction (should be a vendor contract)
     * @param {Object} payload Data to be sent in the transaction.
     * @param {number} gas Gas limit for the transaction (default: 6721975).
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
        this.web3.eth.accounts.signTransaction(config, sender.key).then((signedTx) => {
            const tx = this.web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
            tx.on('receipt', (receipt) => {
                return receipt;
            });
            tx.on('error', (error) => {
                console.log(error);
                throw error;
            });
        });
    }

    /**
     * Adds a vendor to the whitelist of a private contract.
     * @param {Object} sender Sender object of the transaction.
     * @param {Object} recipient Recipient object of the transaction (should be a private contract)
     * @param {Object} toWhitelistAddress Address to be whitelisted.
     * @param {number} gas Gas limit for the transaction (default: 6721975).
     */
    async whitelistVendor(sender, recipient, toWhitelistAddress, gas = 6721975) {
        const contract = new this.web3.eth.Contract(PRIVATE_CONTRACT_ABI, recipient.address);
        let config = {
            from: sender.address,
            to: recipient.address,
            gas: gas,
            data: contract.methods.addVendor(toWhitelistAddress).encodeABI()
        }
        this.web3.eth.accounts.signTransaction(config, sender.key).then((signedTx) => {
            const sentTx = this.web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
            sentTx.on("receipt", receipt => {
                return receipt;
            });
            sentTx.on("error", error => {
                throw error;
            });
        });
    }

    /**
     * Removed a vendor from the whitelist of a private contract.
     * @param {Object} sender Sender object of the transaction.
     * @param {Object} recipient Recipient object of the transaction (should be a private contract)
     * @param {Object} toRemoveAddress Address to be removed from the whitelist.
     * @param {number} gas Gas limit for the transaction (default: 6721975).
     */
    async removeVendorFromWhitelist(sender, recipient, toRemoveAddress, gas = 6721975) {
        const contract = new this.web3.eth.Contract(PRIVATE_CONTRACT_ABI, recipient.address);
        let config = {
            from: sender.address,
            to: recipient.address,
            gas: gas,
            data: contract.methods.removeVendor(toRemoveAddress).encodeABI()
        }
        this.web3.eth.accounts.signTransaction(config, sender.key).then((signedTx) => {
            const sentTx = this.web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
            sentTx.on("receipt", receipt => {
                return receipt;
            });
            sentTx.on("error", error => {
                throw error;
            });
        });
    }
}
module.exports = Web3Gateway;
