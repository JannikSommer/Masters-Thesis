import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/esm/Button';
import WhiteListList from './WhitelistList';
import Form from 'react-bootstrap/Form';

import React, { useEffect, useRef, useState } from 'react';
import { LS_KEY_DEP, LS_KEY_WL } from '../../config';
import NewVendorWhitelistForm from './NewVendorWhitelistForm';

function Settings() {
    const [dependencies, setDependencies] = useState("");
    const [whitelist, setWhitelist] = useState([]);
    let isLoaded = useRef(false);

    /** Saves the dependencies textfield in localstorage. */
    async function saveDependencies() {
        localStorage.setItem(LS_KEY_DEP, dependencies);
    }

    /** Saves the whitelist textfield in localstorage. */
    async function saveWhitelist(newWhiteList) {
        setWhitelist([...newWhiteList]);
        localStorage.setItem(LS_KEY_WL, JSON.stringify(whitelist));
    }

    async function removeWhitelistVendor(index) {
        whitelist.splice(index, 1); 
        saveWhitelist(whitelist);
    }

    /** Reads localstorage values to the dependencies and whitelist hooks. */
    async function readLocalStorage() {
        let deps = localStorage.getItem(LS_KEY_DEP); 
        if (deps !== null) 
            setDependencies(deps);
        
        let wlist = localStorage.getItem(LS_KEY_WL);
        if (wlist !== null)
            setWhitelist(JSON.parse(wlist));
    }

    useEffect(() => {
        if (!isLoaded.current) {
            readLocalStorage();
            isLoaded.current = true;
        }
    })

    return (
        <>
            <Alert variant="warning">
                <Alert.Heading>Information is stored locally</Alert.Heading>
                <p>Information provided here will be stored with browser localstorage which may be a security concern for your setup.</p>
            </Alert>
            <h1>Settings</h1>
            The settings will be used to filter the vulnerabilities shown to your specific dependencies and to only allow trusted vendor's announcements to be shown.
            <hr />
            <br />
            <Container>
                <Row>
                    <Col lg="6">
                        <Form >
                            <Form.Group className='mb-3' controlId='depGroup'>
                                <Form.Label className='h3'>Dependencies</Form.Label>
                                <Form.Control style={{fontFamily:"monospace"}} 
                                            as="textarea" rows={10} 
                                            placeholder="[]"
                                            value={dependencies}
                                            onChange={(e) => {setDependencies(e.target.value)}}
                                            >
                                </Form.Control>
                                <Form.Text className='text-muted'>Specify as JSON object</Form.Text>
                            </Form.Group>
                            <Button variant='primary' onClick={saveDependencies}>Save dependencies</Button>
                        </Form>
                    </Col>
                    <Col lg="6">
                        <h2>Whitelisted vendors</h2>
                        <WhiteListList whitelist={whitelist} remove={removeWhitelistVendor} />
                        <br />
                        <h2>Whitelist vendors</h2>
                        Add new vendors to the whitelist from their vendor smart contract addresses.
                        <NewVendorWhitelistForm whitelist={whitelist} saveWhitelist={saveWhitelist} />
                    </Col>
                </Row>
            </Container>
        </>
    );
}
export default Settings;