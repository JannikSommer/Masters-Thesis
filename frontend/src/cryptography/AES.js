import Utilities from "./Utilities";

export default class AES {
    aesOptions = {
        name: 'AES-GCM',
        length: 128,
    };
    
    /**
     * Generates an AES key.
     * @returns {Promise<CryptoKey>} A CryptoKey object containing an AES 'privatekey'.
     */
    async generateKey() {
        return window.crypto.subtle.generateKey(
            this.aesOptions, 
            true, 
            ['encrypt', 'decrypt']
        );
    }
    
    /**
     * Generates a pseudo-random initialization vector for AES encryption.
     * @private
     * @returns {Uint8Array} A byte array containing an initialization vector.
     */
    generateIv() {
        return window.crypto.getRandomValues(new Uint8Array(12));
    }
    
    /**
     * Encrypts data using AES-128 encryption
     * @param {String} data The data to be encrypted.
     * @param {CryptoKey} key The AES key used for encryption.
     * @returns {Object} An object containing the 'ciphertext' and the 'iv'.
     */
    async encrypt(data, key) {
        const encoded = Utilities.encode(data);
        const iv = this.generateIv();
        const ciphertext = await window.crypto.subtle.encrypt({
            name: this.aesOptions.name,
            length: this.aesOptions.length,
            iv: iv
        }, key, encoded);
        
        return {ciphertext, iv, }
    }
    
    /**
     * Decrypts ciphertext encrypted with AES-128 encryption.
     * @param {Buffer} cipher The encrypted data.
     * @param {CryptoKey} key The AES secret key.
     * @param {Uint8Array} iv The initialization vector.
     * @returns {Promise<String>} The decrypted data.
     */
    async decrypt(cipher, key, iv) {
        const encoded = await window.crypto.subtle.decrypt({
            name: this.aesOptions.name,
            iv: iv,
        }, key, cipher);
        return Utilities.decode(encoded);
    }
}