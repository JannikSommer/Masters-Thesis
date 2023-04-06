class Utilities {

    /**
     * 
     * @param {ArrayBuffer} buffer 
     * @returns 
     */
    static ArrayBufferToString(buffer) {
        return String.fromCharCode.apply(null, new Uint8Array(buffer));
    }

    /**
     * Converts an ArrayBuffer to a Base64 string.
     * @param {ArrayBuffer} buffer
     * @returns {String}
     */
    static arrayBufferToBase64(buffer) {
        // From: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/exportKey#pkcs_8_export
        const str = this.ArrayBufferToString(buffer);
        return window.btoa(str);
    }

    /**
     * Converts a string to an ArrayBuffer
     * @param {String} str 
     * @returns {ArrayBuffer}
     */
    static stringToArrayBuffer(str) {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
          bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    /**
     * Converts a Base64 string to an array buffer.
     * @param {String} b64string
     * @returns {ArrayBuffer}
     */
    static base64ToArrayBuffer(b64String) {
        // From: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#pkcs_8_import
        const str = window.atob(b64String);
        return this.stringToArrayBuffer(str);
    }

    /**
     * Converts bytes to string.
     * @private
     * @param {Buffer} byteStream The byte stream to convert.
     * @returns {String} The byte stream in string format.
     */
    static decode(byteStream) {
        const decoder = new TextDecoder();
        return decoder.decode(byteStream);
    }
    
    /**
     * Converts string to bytes.
     * @private
     * @param {String} data The data to convert.
     * @returns {Uint8Array} The data as a byte array.
     */
    static encode(data) {
        const encoder = new TextEncoder();
        return encoder.encode(data);
    }
    

}
export default Utilities;