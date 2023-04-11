// bootstrap
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

// libraries
import { useEffect, useRef, useState } from 'react';
import { CONTACT_ABI, CONTACT_ADDRESS, LS_KEY_DEP, LS_KEY_WL } from '../../config.js';

// components
import RefreshConfirmation from './RefreshConfirmation.js';
import VulnerabilityAccordion from './VulnerabilityAccordion.js';

/** 
 * Component of the /vulnerabilities page.
 * @param {IPFS} ipfs Prop of a running IPFS node. Must be fully initialized before passing. 
 * @returns The content of the vulnerabilities page.  
 * */
function Vulnerabilities({ ipfs, vulnerabilitiesRef, updateVulnerabilitiesRef, web3Ref, clearSubscriptions }) {
    const dependencies = useRef([]);
    const whitelist = useRef([]);

    // Used to force a rerender of the component after the dependencies and whitelist have been loaded.
    const [rerender, setRerender] = useState(false);

    // Used to control the modal for refresh confirmation
    const [showModal, setShowModal] = useState(false);
    const modalClose = () => setShowModal(false);
    const modalShow = () => setShowModal(true);

    // Vulnerability data hook
    const [vulnerabilities, setVulnerabilities] = useState(vulnerabilitiesRef);
    const updateVulnerabilities = (newVulnerabilities) => {
        setVulnerabilities([...newVulnerabilities].reverse());
        updateVulnerabilitiesRef(newVulnerabilities);
    }

    /**
     * Subscribe to the NewSecurityAdvisory and related UpdatedSecurityAdvisory events.
     * @returns {Promise} Promise that resolves to the subscription object.
     */
    async function subscribeToNewAdvisories() {
        let contract = new web3Ref.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
        return contract.events.NewSecurityAdvisory({
            fromBlock: 0
        }, async function (error, event) {
            if (error) 
                throw error; 
            let newVulnerability = [{
                type: "new",
                event: event, 
                cid: event.returnValues.documentLocation,
                tx: await web3Ref.eth.getTransaction(event.transactionHash), 
                block: await web3Ref.eth.getBlock(event.blockNumber),
                advisory: {} // will be set later
            }]; 
            let temp = vulnerabilities;
            temp.push(newVulnerability);
            updateVulnerabilities(await filterVulnerabilities(temp));
            await subscribeToUpdates(event.returnValues.advisoryIdentifier);
        });
    }

    /**
     * Subscribe to the UpdatedSecurityAdvisory event with a given advisory identifier.
     * @param {string} advisoryIdentifier from the NewSecurityAdvisory event.
     * @returns {Promise} Promise that resolves to the subscription object.
     */
    async function subscribeToUpdates(advisoryIdentifier) {
        let contract = new web3Ref.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
        return contract.events.UpdatedSecurityAdvisory({
            // eslint-disable-next-line
            topics: [ , web3Ref.utils.soliditySha3({type: 'string', value: advisoryIdentifier})],
            fromBlock: 0
        }, async function (error, event) {
            if (error) 
                throw error;
            for (const vulnerability of vulnerabilities) {
                if (advisoryIdentifier === vulnerability[0].event.returnValues.advisoryIdentifier) {
                    vulnerability.push({
                        type: "update",
                        event: event,
                        cid: event.returnValues.documentLocation,
                        tx: await web3Ref.eth.getTransaction(event.transactionHash), 
                        block: await web3Ref.eth.getBlock(event.blockNumber), 
                        advisory: {} // will be set later
                    });
                }
            }
            updateVulnerabilities(await filterVulnerabilities(vulnerabilities));
        });
    }

    /** 
     * Filters vulnerabilities to only show relevant vulnerabilities. 
     * @param {[]} vulnerabilities List of vulnerability objects.
     * @returns List of object with matching vulnerabilities that matches whitelist and dependencies. 
     * */
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

    /** 
     * Clear and re-assign subscriptions. 
     * */
    async function refreshVulnerabilities() {
        vulnerabilities.splice(0, vulnerabilities.length);
        updateVulnerabilities([])
        clearSubscriptions();
        await subscribeToNewAdvisories();
        modalClose();
    }

    useEffect(() => {
        async function loadFromLocalStorage() {
            const lsDep = localStorage.getItem(LS_KEY_DEP);
            if(lsDep === null) return;
            for await (const dep of JSON.parse(lsDep)) {
                dependencies.current.push(dep.identifier);
            }
            whitelist.current = await JSON.parse(localStorage.getItem(LS_KEY_WL));
            setRerender(!rerender); // force rerender to update dependencies and whitelist
        }
        if (vulnerabilities.length === 0) {
            clearSubscriptions();
            subscribeToNewAdvisories();
        }
        loadFromLocalStorage();
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
            {vulnerabilities.length > 0 
            ? <VulnerabilityAccordion 
                vulnerabilities={vulnerabilities} 
                whitelist={whitelist.current}
                dependencies={dependencies.current}
                ipfs={ipfs} /> 
            : <h4>No matching vulnerabilities found.</h4>}
        </>
    );
}
export default Vulnerabilities;
