import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

import { useState, useEffect } from 'react';
import { LS_KEY_PWD } from '../config';

import Utilities from '../models/cryptography/Utilities';


function PasswordModal({state, dismiss, done, setPasswordContext}) {

    const [password, setPassword] = useState("");
    const [passwordData, setPasswordData] = useState(null);
    const [showIncorrectPW, setShowIncorrectPW] = useState(false);


    useEffect(() => {
        getPasswordData();
      }, []);

    /**
     * Retrieves password data from local storage.
     */
    function getPasswordData() {
        const lsData = localStorage.getItem(LS_KEY_PWD);
        if(lsData === null) return;

        setPasswordData(JSON.parse(lsData));
    }

    /**
     * Creates a CryptoKey from the specified password input.
     * @returns {Promise<CryptoKey>}
     */
    async function computeKeyMaterial() {
        const enc = new TextEncoder();
        return window.crypto.subtle.importKey(
          "raw",
          enc.encode(password),
          "PBKDF2",
          false,
          ["deriveBits", "deriveKey"]
        );
    }

    /**
     * Derives an AES-256 key from the provided key material and salt.
     * @param {Uint8Array} salt 
     * @returns {Promise<CryptoKey>}
     */
    async function deriveAesKey(salt) {
        const keyMaterial = await computeKeyMaterial();
        const derivationParams = {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        };
        const aesParams = {
            name: "AES-GCM", 
            length: 256
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
     * Computes the SHA-256 hash of the provided cryptokey.
     * @param {CryptoKey} key 
     * @returns {Promise<ArrayBuffer>}
     */
    async function getKeyHash(key) {
        const rawKey = await window.crypto.subtle.exportKey("raw", key);
        return window.crypto.subtle.digest("SHA-256", rawKey);
    }

    /**
     * Generates a new cryptokey and saves its hash, salt and iv to local storage.
     */
    async function newPassword() {
        const salt = window.crypto.getRandomValues(new Uint8Array(16))
        const aesKey = await deriveAesKey(salt);
        const keyHash = await getKeyHash(aesKey);
        const iv = window.crypto.getRandomValues(new Uint8Array(16));

        const result = {
            hash: Utilities.arrayBufferToBase64(keyHash),
            salt: Utilities.arrayBufferToBase64(salt.buffer),
            iv: Utilities.arrayBufferToBase64(iv.buffer),
        };
        localStorage.setItem(LS_KEY_PWD, JSON.stringify(result));
        setPasswordData(result);
        setPasswordContext(aesKey);
    }

    /**
     * Verifies the provided password.
     */
    async function confirm() {
        if(passwordData === null) {
            await newPassword();
            done();
        };

        const salt = Utilities.base64ToArrayBuffer(passwordData.salt)
        const aesKey = await deriveAesKey(salt);
        const keyHash = Utilities.arrayBufferToBase64(await getKeyHash(aesKey));

        if(passwordData.hash !== keyHash) {
            setShowIncorrectPW(true);
            return;
        }

        setPasswordContext(aesKey);
        done();
    }

    /**
     * Will close modal if enter is pressed with same functionality as clicking confirm.
     * @param {*} event 
     */
    const handleKeyPress = (event) => { 
        if(event.key === 'Enter') {
            confirm();
        }
    }

    return (
        <Modal show={state} onHide={() => dismiss()}>
            <Modal.Header closeButton><Modal.Title>Enter Password</Modal.Title></Modal.Header>
            <Modal.Body>
                <Container>
                    <Row>
                        {showIncorrectPW ?
                        <Alert variant="danger" onClose={() => setShowIncorrectPW(false)}>
                            Incorrect Password!
                        </Alert>
                        : <></>
                        }
                        Please enter your Password
                    </Row>
                    <Row>
                        <Form.Control autoFocus type="password" value={password} onKeyDown={(e) => handleKeyPress(e)} onChange={(e) => setPassword(e.target.value)} />
                    </Row>
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => dismiss()}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={() => confirm()}>
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default PasswordModal;