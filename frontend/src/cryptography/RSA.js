export default class RSA {
    rsaOptions = {
        name: "RSA-OAEP",
        modulusLength: 3072,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-256",
    };

    /**
     * Generates a pair of RSA-OAEP keys.
     * @returns {Promise<CryptoKeyPair>} Returns a CryptoKeyPair object containing a 'publicKey' and a 'privatekey'.
     */
    async generateKeyPair() {
        return window.crypto.subtle.generateKey(
            this.rsaOptions,
            true,
            ["encrypt", "decrypt"]
        );
    }
    
    /**
     * Exports a the private key from an RSA key-pair.
     * @param {CryptoKey} key A CryptoKey object containing a 'privatekey'.
     * @returns {Promise<ArrayBuffer>} An arraybuffer containing a private RSA key in PKCS#8 format.
     */
    async exportPrivateKey(key) { // NOTE: This could be PEM-encoded if we want to make it easier for humans to use.
        return window.crypto.subtle.exportKey(
            "pkcs8", 
            key
        );
    }
    
    
    /**
     * Exports a the private key from an RSA key-pair.
     * @param {CryptoKey} key A CryptoKey object containing a 'privatekey'.
     * @returns {Promise<ArrayBuffer>} An arraybuffer containing a public RSA key in SubjectPublicKeyInfo format.
     */
    async exportPublicKey(key) { // NOTE: This could be PEM-encoded if we want to make it easier for humans to use.
        return window.crypto.subtle.exportKey(
            "spki", 
            key
        );
    }
    
    /**
     * Imports an exported RSA private key.
     * @param {Buffer} keyData The data containing the key.
     * @returns {Promise<CryptoKey>} A CryptoKey object containing the private key.
     */
    async importPrivateKey(keyData) {
        return window.crypto.subtle.importKey(
            "pkcs8", 
            keyData, 
            this.rsaOptions, 
            true, 
            ["decrypt"]
        );
    }
    
    /**
     * Imports an exported RSA public key.
     * @param {Buffer} keyData The data containing the key.
     * @returns {Promise<CryptoKey>} A CryptoKey object containing the public key.
     */
    async importPublicKey(keyData) {
        return window.crypto.subtle.importKey(
            "spki", 
            keyData, 
            this.rsaOptions, 
            true, 
            ["encrypt"]
        );
    }
    
    /**
     * Exports an AES private key and encrypts it using RSA-OAEP
     * @param {CryptoKey} aesKey The AES key to wrap.
     * @param {CryptoKeyPair} rsaPublicKey The RSA key to encrypt the other key.
     * @returns {Promise<ArrayBuffer>} An arraybuffer containing the wrapped key.
     */
    async wrapKey(aesKey, rsaPublicKey) {
        const exportedAES = await window.crypto.subtle.exportKey("raw", aesKey);
        return window.crypto.subtle.encrypt(
            {
                name: this.rsaOptions.name,
            },
            rsaPublicKey,
            exportedAES
        );
    }
    
    /**
     * Imports an exported AES secret key.
     * @param {Buffer} keyData The containing the key.
     * @returns {Promise<CryptoKey>} A CryptoKey object containing the private key.
     */
    async unwrapKey(aesKeyData, rsaPrivateKey) {
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: this.rsaOptions.name,
            },
            rsaPrivateKey,
            aesKeyData
        );
        return window.crypto.subtle.importKey(
            "raw",
            decrypted,
            {
                name: "AES-GCM"
            },
            true,
            ["decrypt"]
        );
    }
}