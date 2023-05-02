import { LS_KEY_ACC } from "../config";
import AES from "../cryptography/AES";
import Utilities from '../cryptography/Utilities';


export class Accounts {

    /**
     * Loads accounts from local storage.
     * @param {CryptoKey} aesKey A valid AES crryptokey.
     * @returns {Promise<Array<{name: string, wallet: string, key: string}>> | Promise<null>} An array of accounts. Returns null if none are found.
     */
    static async load(aesKey) {
        const aes = new AES(256);
        const accountsString = localStorage.getItem(LS_KEY_ACC); 
        if (accountsString === null) return null;

        const accountsJson = JSON.parse(accountsString);

        const accountsBytes = Utilities.base64ToArrayBuffer(accountsJson.data);
        const ivBytes = Utilities.base64ToArrayBuffer(accountsJson.iv);
        const accountsDecrypted = await aes.decrypt(accountsBytes, aesKey, ivBytes);
        return JSON.parse(accountsDecrypted);
    }

    /**
     * Saves accounts to local storage.
     * @param {Array<{name: string, wallet: string, key: string}>} accounts An array of accounts.
     * @param {CryptoKey} aesKey A valid AES cryptokey.
     */
    static async Save(accounts, aesKey) {
        const aes = new AES(256);
        const accountsJSON = JSON.stringify(accounts);
        const { ciphertext, iv } = await aes.encrypt(accountsJSON, aesKey)
        const accountsString = JSON.stringify(
            {
                data: Utilities.arrayBufferToBase64(ciphertext),
                iv: Utilities.arrayBufferToBase64(iv),
            }
        );
        localStorage.setItem(
            LS_KEY_ACC, 
            accountsString
        );
    }
}