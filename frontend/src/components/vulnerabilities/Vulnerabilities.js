// bootstrap
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

// libraries
import Web3 from 'web3';
import { useEffect, useRef, useState } from 'react';
import { CONTACT_ABI, CONTACT_ADDRESS, LS_KEY_DEP, LS_KEY_WL } from '../../config.js';

// components
import RefreshConfirmation from './RefreshConfirmation.js';
import VulnerabilityAccordion from './VulnerabilityAccordion.js';

/** Component of the /vulnerabilities page.
 * @param {IPFS} ipfs Prop of a running IPFS node. Must be fully initialized before passing. 
 * @returns The content of the vulnerabilities page.  */
function Vulnerabilities({ ipfs }) {
    let dependencies = useRef([]);
    let whitelist = useRef([]);

    let web3 = useRef(null);
    let subscriptions = useRef([]);

    // Used to control the modal for refresh confirmation
    const [showModal, setShowModal] = useState(false);
    const modalClose = () => setShowModal(false);
    const modalShow = () => setShowModal(true);

    // Vulnerability data hook
    const vulnerabilities = useRef([]);
    const [allVulnerabilities, setAllVulnerabilities] = useState([]);
    const updateAllVulnerabilities = (vulnerabilities) => {
        setAllVulnerabilities([...vulnerabilities].reverse());
    }

    async function subscribeToNewAdvisories() {
        let contract = new web3.current.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
        return contract.events.NewSecurityAdvisory({
            fromBlock: 0
        }, async function (error, event) {
            if (error) 
                throw error; 
            let newVulnerability = [{
                type: "new",
                event: event, 
                cid: event.returnValues.documentLocation,
                tx: await web3.current.eth.getTransaction(event.transactionHash), 
                block: await web3.current.eth.getBlock(event.blockNumber),
                advisory: {} // will be set later
            }]; 
            vulnerabilities.current.push(newVulnerability);
            updateAllVulnerabilities(await filterVulnerabilities(vulnerabilities.current));
            await subscribeToUpdates(event.returnValues.advisoryIdentifier);
        });
    }

    async function subscribeToUpdates(advisoryIdentifier) {
        let contract = new web3.current.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
        return contract.events.UpdatedSecurityAdvisory({
            // eslint-disable-next-line
            topics: [ , web3.current.utils.soliditySha3({type: 'string', value: advisoryIdentifier})],
            fromBlock: 0
        }, async function (error, event) {
            if (error) 
                throw error; 
            for (const vulnerability of vulnerabilities.current) {
                if (advisoryIdentifier === vulnerability[0].event.returnValues.advisoryIdentifier) {
                    vulnerability.push({
                        type: "update",
                        event: event,
                        cid: event.returnValues.documentLocation,
                        tx: await web3.current.eth.getTransaction(event.transactionHash), 
                        block: await web3.current.eth.getBlock(event.blockNumber), 
                        advisory: {} // will be set later
                    });
                }
            }
            updateAllVulnerabilities(await filterVulnerabilities(vulnerabilities.current));
        });
    }

    /** Filters vulnerabilities to only show relevant vulnerabilities. 
     * @param {[]} vulnerabilities List of vulnerability objects.
     * @returns List of object with matching vulnerabilities that matches whitelist and dependencies. */
    async function filterVulnerabilities(vulnerabilities) {
        let matches = [];
        for (const vulnerability of vulnerabilities) {
            let productIdentifiers = vulnerability[0].event.returnValues.productIdentifiers.split(",");
            if (productIdentifiers.some(element => {return dependencies.current.includes(element)})) {
                if (whitelist.current.some(obj => {return vulnerability[0].tx.to === obj.address})){
                    matches.push(vulnerability);
                }
            }
        }
        return matches;
    }

    /** Deletes and retrieves all data. */
    async function refreshVulnerabilities() {
        subscriptions.current = subscriptions.current.push(await subscribeToNewAdvisories());
        modalClose();
    }

    useEffect(() => {
        const lsDep = localStorage.getItem(LS_KEY_DEP);
        if(lsDep === null) return;
        for (const dep of JSON.parse(lsDep)) {
            dependencies.current.push(dep.identifier);
        }
        
        whitelist.current = JSON.parse(localStorage.getItem(LS_KEY_WL));
        web3.current = new Web3(Web3.givenProvider || 'ws://localhost:7545');
        subscriptions.current.push(subscribeToNewAdvisories());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ipfs])

    return (
        <>
            <br />
            <RefreshConfirmation state={showModal} close={modalClose} loadEvents={() => refreshVulnerabilities()} />
            <Container>
                <Row>
                    <Col lg="10"><h1>Vulnerabilities</h1></Col>
                    <Col lg="2">
                        <Button variant="danger" className="float-end" size='md' onClick={modalShow}>Refresh</Button>
                    </Col>
                </Row>
            </Container>
            {allVulnerabilities.length > 0 
            ? <VulnerabilityAccordion 
                vulnerabilities={allVulnerabilities} 
                whitelist={whitelist.current}
                dependencies={dependencies.current}
                ipfs={ipfs} /> 
            : <h4>No matching vulnerabilities found.</h4>}
        </>
    );
}
export default Vulnerabilities;
