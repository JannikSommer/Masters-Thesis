import { LS_KEY_CON, LS_KEY_PWD } from "../config";
import Utilities from "../models/cryptography/Utilities";

class Contracts {
    /**
     * Loads the contracts from local storage.
     * @param {CryptoKey} aesKey A valid AES cryptokey.
     * @returns {[]} A list of contracts. Returns null if nothing is found.
     */
    static async load(aesKey) {
        const contractsBase64 = localStorage.getItem(LS_KEY_CON);
        if(contractsBase64 === null) return null;
        const contractsEncrypted = Utilities.base64ToArrayBuffer(contractsBase64);

        const contractsDecrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                length: 256,
                iv: Utilities.base64ToArrayBuffer(JSON.parse(localStorage.getItem(LS_KEY_PWD)).iv),
            }, 
            aesKey,
            contractsEncrypted
        );
        const decoded = Utilities.decode(contractsDecrypted)
        const parsed = JSON.parse(decoded);
        return parsed;
    }
    
    /**
     * Saves the contracts to local storage.
     * @param {[]} contracts An array of contracts.
     * @param {CryptoKey} aesKey A valid AES cryptokey.
     */
    static async save(contracts, aesKey) {
        const contractsEncoded = Utilities.encode(JSON.stringify(contracts));
        const contractsEncrypted = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                length: 256,
                iv: Utilities.base64ToArrayBuffer(JSON.parse(localStorage.getItem(LS_KEY_PWD)).iv),
            },
            aesKey,
            contractsEncoded
        );

        localStorage.setItem(
            LS_KEY_CON,
            Utilities.arrayBufferToBase64(contractsEncrypted)
        );
    }
    
    /**
     * Adds a new contract to the list.
     * @param {[]} contracts An array of contracts.
     * @param {String} address A valid Ethereum address.
     * @param {String} vendorName A name or note to identify the address.
     */
    static addContract(contracts, address, vendorName = undefined) {        
        const contract = {
            "address": address,
        };
        if(vendorName) contract["vendorName"] = vendorName;

        if(contracts.includes(contract)) return contracts;
        return contracts.concat([contract]);
    }

    /**
     * Removes a contract from the list.
     * @param {[]} contracts A list of contracts.
     * @param {String} address A valid Ethereum address.
     */
    static removeContract(contracts, address) {
        return contracts.filter((x) => {
            return x["address"] !== address;
        });
    }

    static updateKey(contracts, address, key) {
        const existing = contracts.findIndex((con)=> {
            return con["address"] === address;
        });
        const result = [...contracts];
        if(existing !== -1) {
            result[existing]["privateKey"] = key;
        } else {
            const contract = {
                "address": address,
                "privateKey": key,
            }
            result.push(contract);
        }
        return result;
    }
}

export default Contracts;