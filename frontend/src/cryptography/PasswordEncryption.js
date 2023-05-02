import Utilities from './Utilities';

export class PasswordEncryption {
    
    /**
     * Computes an AES-GCM key and associated data from a password string.
     * @param {String} password A password in string format.
     * @returns {Promise<{aesKey: CryptoKey, keyData: {salt: String}}>}
     */
        static async createNewPassword(password) {
            const salt = window.crypto.getRandomValues(new Uint8Array(16))
            const aesKey = await this.deriveAesKey(password, salt);
    
            const keyData = {
                "salt": Utilities.arrayBufferToBase64(salt.buffer)
            };
            return { aesKey, keyData };
        }
    
        /**
         * Generates an AES-GCM key using PBKDF2.
         * @param {String} password A password in string format.
         * @param {ArrayBuffer} salt A byte array containing 16 random bytes.
         * @returns {Promise<CryptoKey>} An AES-GCM cryptokey.
         */
        static async deriveAesKey(password, salt) {
            const keyMaterial = await this.computeKeyMaterial(password);
            const aesParams = {
                name: "AES-GCM", 
                length: 256
            }
    
            const derivationParams = {
                name: "PBKDF2",
                salt: salt,
                iterations: 600000,
                hash: "SHA-256"
            }
    
            return window.crypto.subtle.deriveKey(
                derivationParams,
                keyMaterial,
                aesParams,
                true,
                ["decrypt", "encrypt"]           
            );
        }
    
        /**
         * Computes a PBKDF2 cryptokey from a password string.
         * @param {String} password A password in string format.
         * @returns {Promise<CryptoKey>} A PBKDF2 cryptokey.
         */
        static async computeKeyMaterial(password) {
            return await window.crypto.subtle.importKey(
              "raw",
              Utilities.encode(password),
              "PBKDF2",
              false,
              ["deriveBits", "deriveKey"]
            );
        }
}