import { LS_KEY_ACC, LS_KEY_PWD } from "../config";
import Utilities from "../models/cryptography/Utilities";

export class Accounts {

    /**
     * Loads accounts from local storage.
     * @param {CryptoKey} aesKey A valid AES crryptokey.
     * @returns {Promise<any[]> | Promise<null>} An array of accounts. Returns null if none are found.
     */
    static async load(aesKey) {
        const accountsB64 = localStorage.getItem(LS_KEY_ACC); 
        if (accountsB64 === null) return null;

        const accountsBytes = Utilities.base64ToArrayBuffer(accountsB64);
        const accountsDecrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                length: 256,
                iv: Utilities.base64ToArrayBuffer(JSON.parse(localStorage.getItem(LS_KEY_PWD)).iv),
            },
            aesKey,
            accountsBytes
        );

        const accountsDecoded = Utilities.decode(accountsDecrypted)
        return JSON.parse(accountsDecoded);
    }

    /**
     * Saves accounts to local storage.
     * @param {any[]} accounts An array of accounts.
     * @param {CryptoKey} aesKey A valid AES cryptokey.
     */
    static async Save(accounts, aesKey) {
        const accountsJSON = JSON.stringify(accounts);
        const accountsEncoded = Utilities.encode(accountsJSON);
        const accountsEncrypted = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                length: 256,
                iv: Utilities.base64ToArrayBuffer(JSON.parse(localStorage.getItem(LS_KEY_PWD)).iv),
            },
            aesKey,
            accountsEncoded
        )
        
        const accountsB64 = Utilities.arrayBufferToBase64(accountsEncrypted);
        localStorage.setItem(LS_KEY_ACC, accountsB64);
    }
}