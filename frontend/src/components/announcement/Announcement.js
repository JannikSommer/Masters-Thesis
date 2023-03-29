import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/Col'

import NewAdvisoryForm from './NewAdvisoryForm';
import UpdateAdvisoryForm from './UpdateAdvisoryForm';

import React, { useEffect, useRef, useState } from 'react';
import { LS_KEY_ACC } from '../../config';


function Announcement() {
    const [show, setShow] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const isLoaded = useRef(false); 

    async function loadAccounts() {
        let savedAccounts = localStorage.getItem(LS_KEY_ACC); 
        if (savedAccounts !== null)
            setAccounts(JSON.parse(savedAccounts));
    }

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
            <h1>Announcement</h1>
            Here you can make new announcements regarding new security advisories or updates to existing advisories. 
            <br />
            <hr />
            <Container>
                <Row>
                    <Col lg="5">
                        <NewAdvisoryForm accounts={accounts} />
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
                        <UpdateAdvisoryForm accounts={accounts}/>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
export default Announcement;