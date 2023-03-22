import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/esm/Button';

import React, { useEffect, useRef, useState } from 'react';
import { LS_KEY_DEP, LS_KEY_WL } from '../config';

function Settings() {
    const [dependencies, setDependecies] = useState("");
    const [whitelist, setWhitelist] = useState("");
    let isLoaded = useRef(false);

    /** Saves the dedencies textfield in localstorage. */
    async function saveDependencies() {
        localStorage.setItem(LS_KEY_DEP, dependencies);
    }

    /** Saves the whitelist textfield in localstorage. */
    async function saveWhitelist() {
        localStorage.setItem(LS_KEY_WL, whitelist);
    }

    /** Reads localstorage values to the dependecies and whitelist hooks. */
    async function readLocalStorage() {
        let deps = localStorage.getItem(LS_KEY_DEP); 
        if (deps !== null) 
            setDependecies(deps);
        
        let wlist = localStorage.getItem(LS_KEY_WL);
        if (wlist !== null) {
            setWhitelist(wlist);
        }
    }

    useEffect(() => {
        if (!isLoaded.current) {
            readLocalStorage();
            isLoaded.current = true;
        }

    }, [dependencies, whitelist])

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
                                            placeholder="{ ['cpe:/a...']  }"
                                            value={dependencies}
                                            onChange={e => {setDependecies(e.target.value)}}
                                            >
                                </Form.Control>
                                <Form.Text className='text-muted'>Specify as JSON object</Form.Text>
                            </Form.Group>
                            <Button variant='primary' onClick={saveDependencies}>Save dependencies</Button>
                        </Form>
                    </Col>
                    <Col lg="6">
                        <Form>
                            <Form.Group className='mb-3' controlId='whitelistGroup'>
                                <Form.Label className='h3'>Vendor whitelist</Form.Label>
                                <Form.Control style={{fontFamily:"monospace"}}  
                                              as="textarea" rows={10} 
                                              placeholder="{ [] }"
                                              value={whitelist}
                                              onChange={e => {setWhitelist(e.target.value)}}
                                              >
                                </Form.Control>
                                <Form.Text className='text-muted'>Specify as JSON object</Form.Text>
                            </Form.Group>
                            <Button variant='primary' onClick={saveWhitelist}>Save whitelist</Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
export default Settings;