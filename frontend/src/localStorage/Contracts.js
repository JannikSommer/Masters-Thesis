import { LS_KEY_CON } from "../config";
import AES from "../cryptography/AES";
import Utilities from "../cryptography/Utilities";


class Contracts {
    /**
     * Loads the contracts from local storage.
     * @param {CryptoKey} aesKey A valid AES cryptokey.
     * @returns {Promise<Array<{address: string, privateKey: string, vendorName?: string}>> | Promise<null>} A list of contracts. Returns null if nothing is found.
     */
    static async load(aesKey) {
        const aes = new AES(256);
        const contractsString = localStorage.getItem(LS_KEY_CON);
        if(contractsString === null) return null;

        const contractsJson = JSON.parse(contractsString);
        const contractsBytes = Utilities.base64ToArrayBuffer(contractsJson.data);
        const ivBytes = Utilities.base64ToArrayBuffer(contractsJson.iv);
        const contractsDecrypted = await aes.decrypt(contractsBytes, aesKey, ivBytes);

        return JSON.parse(contractsDecrypted);
    }
    
    /**
     * Saves the contracts to local storage.
     * @param {Array<{address: string, privateKey: string, vendorName?: string}>} contracts An array of contracts.
     * @param {CryptoKey} aesKey A valid AES cryptokey.
     */
    static async save(contracts, aesKey) {
        const aes = new AES(256);
        const contractsJson = JSON.stringify(contracts);
        const { ciphertext, iv } = await aes.encrypt(contractsJson, aesKey);
        const contractsString = JSON.stringify(
            {
                data: Utilities.arrayBufferToBase64(ciphertext),
                iv: Utilities.arrayBufferToBase64(iv),
            }
        );
        localStorage.setItem(
            LS_KEY_CON,
            contractsString
        );
    }
    
    /**
     * Adds a new contract to the list.
     * @param {Array<{address: string, privateKey: string, vendorName?: string}>} contracts An array of contracts.
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
     * @param {Array<{address: string, privateKey: string, vendorName?: string}>} contracts A list of contracts.
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