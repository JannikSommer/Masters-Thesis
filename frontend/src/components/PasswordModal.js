import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

import { useState, useEffect } from 'react';

import Utilities from '../cryptography/Utilities';
import {PasswordData  as PasswordDataLS } from '../localStorage/PasswordData';
import PasswordEncryption from '../cryptography/PasswordEncryption';


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
    const getPasswordData = async () => {
        const pwData = await PasswordDataLS.load();
        if(pwData === null) return;
        setPasswordData(pwData);
    }

    /**
     * Verifies the provided password.
     */
    const confirm = async () => {
        if(passwordData === null) {
            const { aesKey, keyData } = await PasswordEncryption.createNewPassword(password);
            PasswordDataLS.save(keyData);
            setPasswordData(keyData);
            setPasswordContext(aesKey);
            done();
        };
        
        const salt = Utilities.base64ToArrayBuffer(passwordData["salt"])
        const aesKey = await PasswordEncryption.deriveAesKey(password, salt);
        const keyHash = Utilities.arrayBufferToBase64(await PasswordEncryption.getKeyHash(aesKey));

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