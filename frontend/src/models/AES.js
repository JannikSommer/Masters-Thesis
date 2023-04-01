class AES {
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
     * Converts string to bytes.
     * @private
     * @param {String} data The data to convert.
     * @returns {Uint8Array} The data as a byte array.
     */
    encode(data) {
        const encoder = new TextEncoder();
        return encoder.encode(data);
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
        const encoded = this.encode(data);
        const iv = this.generateIv();
        const ciphertext = await window.crypto.subtle.encrypt({
            name: this.aesOptions.name,
            length: this.aesOptions.length,
            iv: iv
        }, key, encoded);
        
        return {ciphertext, iv, }
    }
    
    /**
     * Converts bytes to string.
     * @private
     * @param {Buffer} byteStream The byte stream to convert.
     * @returns {String} The byte stream in string format.
     */
    decode(byteStream) {
        const decoder = new TextDecoder();
        return decoder.decode(byteStream);
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
        return this.decode(encoded);
    }
}

module.exports = AES;