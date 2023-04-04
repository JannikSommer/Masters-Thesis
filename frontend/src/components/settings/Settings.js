import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert';
import WhiteListList from './WhitelistList';

import React, { useEffect, useRef, useState } from 'react';
import { LS_KEY_DEP, LS_KEY_WL } from '../../config';
import NewVendorWhitelistForm from './NewVendorWhitelistForm';
import UploadDependenciesForm from './UploadDependenciesForm';
import DependenciesList from './DependenciesList';

function Settings() {
    const [dependencies, setDependencies] = useState([]);
    const [whitelist, setWhitelist] = useState([]);
    let isLoaded = useRef(false);

    /** Saves the dependencies textfield in localstorage. */
    async function saveDependencies(newDependencies) {
        setDependencies([...newDependencies]);
        localStorage.setItem(LS_KEY_DEP, JSON.stringify(newDependencies));
    }

    /** Saves the whitelist textfield in localstorage. */
    async function saveWhitelist(newWhiteList) {
        setWhitelist([...newWhiteList]);
        localStorage.setItem(LS_KEY_WL, JSON.stringify(newWhiteList));
    }

    async function removeWhitelistVendor(index) {
        whitelist.splice(index, 1); 
        saveWhitelist(whitelist);
    }

    /** Reads localstorage values to the dependencies and whitelist hooks. */
    async function readLocalStorage() {
        let dependencies = localStorage.getItem(LS_KEY_DEP); 
        if (dependencies !== null) 
            setDependencies(JSON.parse(dependencies));
        
        let whitelist = localStorage.getItem(LS_KEY_WL);
        if (whitelist !== null)
            setWhitelist(JSON.parse(whitelist));
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
            <Container>
                <Row>
                    <h2>Dependencies</h2>
                    <Col lg="9">
                        Dependency information is extracted from the uploaded CycloneDX v1.4 SBOM. 
                    </Col>
                    <Col lg="3">
                        <UploadDependenciesForm save={saveDependencies}/>      
                    </Col>
                    <DependenciesList dependencies={dependencies}/>
                </Row>
                <br />
                <Row>
                    <h2>Whitelisted vendors</h2>
                    <Col>
                        The name of the vendor is collected from the smart contract address.
                    </Col>
                    <WhiteListList whitelist={whitelist} remove={removeWhitelistVendor} />
                    <Col>
                        <br />
                        <h2>Whitelist vendors</h2>
                        Add new vendors to the whitelist from their vendor smart contract addresses.
                    </Col>
                    <NewVendorWhitelistForm whitelist={whitelist} saveWhitelist={saveWhitelist} />
                </Row>
            </Container>
        </>
    );
}
export default Settings;