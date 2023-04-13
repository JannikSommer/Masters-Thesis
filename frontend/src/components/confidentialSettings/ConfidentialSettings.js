import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/Col';

import UpdateKeyForm from './UpdateKeyForm';
import VendorManagementForm from './VendorManagementForm';

import Utilities from '../../models/cryptography/Utilities';

import { PasswordContext } from '../../contexts/PasswordContext';

import React, { useEffect, useState, useContext } from 'react';
import { LS_KEY_ACC, LS_KEY_PWD } from '../../config';
import ContractManagement from './ContractManagement';
import Contracts from '../../localStorage/Contracts';


function ConfidentialSettings() {
    const [show, setShow] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const [contracts, setContracts] = useState([]);
    
    const aesKey = useContext(PasswordContext);
    

    const addContract = (address, name) => {
        const newContracts = Contracts.addContract(contracts, address, name);
        Contracts.save(newContracts);
        setContracts(newContracts);
    }

    const removeContract = (address) => {
        const newContracts = Contracts.removeContract(contracts, address)
        Contracts.save(newContracts);
        setContracts(newContracts);
    }

    const updatePrivateKey = (address, key) => {
        const newContracts = Contracts.updateKey(contracts, address, key);
        Contracts.save(newContracts);
        setContracts(newContracts);
    }

    async function decryptAccounts(data) {
        const dataDecrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                length: 256,
                iv: Utilities.base64ToArrayBuffer(JSON.parse(localStorage.getItem(LS_KEY_PWD)).iv),
            }, 
            aesKey,
            data
        );
        return new TextDecoder().decode(dataDecrypted);
    }

    async function loadAccounts() { 
        let acc = localStorage.getItem(LS_KEY_ACC); 
        if (acc !== null) {
            const decAccounts = await decryptAccounts(Utilities.base64ToArrayBuffer(acc));
            setAccounts(JSON.parse(decAccounts));
        }
    };

    useEffect(() => {
        if(aesKey !== null) loadAccounts(); 
        setContracts(Contracts.load());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aesKey]);

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
            <ContractManagement contracts={contracts} addContract={addContract} removeContract={removeContract}/>
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
                        <UpdateKeyForm accounts={accounts} updateContractKey={updatePrivateKey}/>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
export default ConfidentialSettings;