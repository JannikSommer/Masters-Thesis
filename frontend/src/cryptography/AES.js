import Utilities from "./Utilities";

class AES {
    aesOptions = {
        name: 'AES-GCM',
        length: 256,
    };
    
    constructor(strength = 256) {
        if(strength !== 256 && strength !== 128) {
            throw Error("AES-GCM strength can only be '128' or '256'");
        }
        this.aesOptions.length = strength;
    }

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
     * Generates a pseudo-random initialization vector for AES-GCM encryption.
     * @returns {Uint8Array} A 12 byte long array containing a randomly generated initialization vector.
     */
    generateIv() {
        return window.crypto.getRandomValues(new Uint8Array(12));
    }
    
    /**
     * Encrypts data using AES-GCM encryption
     * @param {String} data The data to be encrypted.
     * @param {CryptoKey} key The AES key used for encryption.
     * @returns {{ciphertext: ArrayBuffer, iv: Uint8Array}} An object containing the 'ciphertext' and the 'iv'.
     */
    async encrypt(data, key) {
        const encoded = Utilities.encode(data);
        const iv = this.generateIv();
        const ciphertext = await window.crypto.subtle.encrypt({
            name: this.aesOptions.name,
            length: this.aesOptions.length,
            iv: iv
        }, key, encoded);
        
        return {ciphertext, iv}
    }
    
    /**
     * Decrypts ciphertext encrypted with AES-128 encryption.
     * @param {Buffer} ciphertext The encrypted data.
     * @param {CryptoKey} key The AES secret key.
     * @param {Uint8Array} iv The initialization vector.
     * @returns {Promise<String>} The decrypted data.
     */
    async decrypt(ciphertext, key, iv) {
        const encoded = await window.crypto.subtle.decrypt({
            name: this.aesOptions.name,
            iv: iv,
        }, key, ciphertext);
        return Utilities.decode(encoded);
    }
}

export default AES