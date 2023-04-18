import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/Col';

import ConfidentialAdvisoryForm from './ConfidentialAdvisoryForm';

import { PasswordContext } from '../../contexts/PasswordContext';
import { Accounts } from '../../localStorage/Accounts';

import React, { useEffect, useState, useContext } from 'react';


function ConfidentialAnnouncements({ ipfs }) {
    const [show, setShow] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const aesKey = useContext(PasswordContext);

    const loadAccounts = async () => { 
        const acc = await Accounts.load(aesKey);
        if (acc !== null) setAccounts(acc);
    };

    useEffect(() => {
        if(aesKey !== null) loadAccounts(); 
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
            <Container>
            </Container>
            <Container>
                <Row>
                    <Col lg="5">
                        <ConfidentialAdvisoryForm accounts={accounts} ipfs={ipfs}/>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
export default ConfidentialAnnouncements;