import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/Col';

import UpdateKeyForm from './UpdateKeyForm';
import VendorManagementForm from './VendorManagementForm';

import RSA from '../../models/RSA';

import { PasswordContext } from '../../contexts/PasswordContext';

import React, { useEffect, useRef, useState, useContext } from 'react';
import { LS_KEY_ACC, LS_KEY_PWD } from '../../config';


function ConfidentialSettings({ ipfs }) {
    const [show, setShow] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const isLoaded = useRef(false); 
    const aesKey = useContext(PasswordContext);
    

    async function decryptAccounts(data) {
        const rsa = new RSA();
        const dataDecrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                length: 256,
                iv: rsa.base64ToArrayBuffer(JSON.parse(localStorage.getItem(LS_KEY_PWD)).iv),
            }, 
            aesKey,
            data
        );
        return new TextDecoder().decode(dataDecrypted);
    }

    async function loadAccounts() { 
        const rsa = new RSA();
        let acc = localStorage.getItem(LS_KEY_ACC); 
        if (acc !== null) {
            const decAccounts = await decryptAccounts(rsa.base64ToArrayBuffer(acc));
            setAccounts(JSON.parse(decAccounts));
        }
    };

    useEffect(() => {
        if (!isLoaded.current) {
            loadAccounts(); 
            isLoaded.current = true;
        }
    });

    return (
        <div>
            {show
            ? <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                <Alert.Heading>Careful! Announcements cost gas!</Alert.Heading>
                <p>Submitting the forms on this page will create a transaction to the Ethereum network from your connected wallet. <br/></p>
                You will be warned again when submitting the forms. 
              </Alert>
            : <></>}
            <h1>Confidential Announcement</h1>
            Here you can make new confidential announcements intended for specific asset owners. 
            <br />
            <hr />
            <Container>
            </Container>
            <Container>
                <Row>
                    <Col lg="5">
                        <VendorManagementForm accounts={accounts}/>
                    </Col>
                    <Col>
                        <div style={{height: '40%', 
                                    width: 1, 
                                    backgroundColor: '#FFFFFF', 
                                    position: 'absolute', 
                                    left: "50%"}}>
                        </div>
                    </Col>
                    <Col lg="5">
                        <UpdateKeyForm accounts={accounts}/>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
export default ConfidentialSettings;