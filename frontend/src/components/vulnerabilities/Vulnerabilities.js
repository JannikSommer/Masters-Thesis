// bootstrap
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

// libraries
import { PasswordContext } from '../../contexts/PasswordContext';
import { useEffect, useRef, useState, useContext } from 'react';
import { LS_KEY_DEP, LS_KEY_WL } from '../../config.js';
import Contracts from '../../localStorage/Contracts.js';

// components
import RefreshConfirmation from './RefreshConfirmation.js';
import VulnerabilityAccordion from './VulnerabilityAccordion.js';

/** 
 * Component of the /vulnerabilities page.
 * @param {IPFS} ipfs Prop of a running IPFS node. Must be fully initialized before passing. 
 * @returns The content of the vulnerabilities page.  
 * */
function Vulnerabilities({ ipfs, web3Gateway }) {
    const dependencies = useRef([]);
    const whitelist = useRef([]);
    const privateWhitelist = useRef([]);

    const aesKey = useContext(PasswordContext);

    // Used to force a rerender of the component after the dependencies and whitelist have been loaded.
    const [rerender, setRerender] = useState(false);

    // Used to control the modal for refresh confirmation
    const [showModal, setShowModal] = useState(false);
    const modalClose = () => setShowModal(false);
    const modalShow = () => setShowModal(true);

    // Vulnerability data hook
    const [vulnerabilities, setVulnerabilities] = useState([]);
    const updateVulnerabilities = async (newVulnerabilities) => {
        setVulnerabilities([...newVulnerabilities].reverse());
   }
    const addPrivateVulnerability = (vulnerability) => { 
        let temp = vulnerabilities;
        temp.push(vulnerability);
        updateVulnerabilities(temp);
    }

    async function subscribe() {
        await web3Gateway.subscribeNewSecurityAdvisories(newCallback);
        for await (const contract of privateWhitelist.current) {
            await web3Gateway.subscribeToPrivateSecurityAdvisories(privateCallback, contract.address);
        }
    }

    async function newCallback(error, event) {
        if (error)
            throw error;
        const newEvent = [{
            type: "new",
            event: event, 
            cid: event.returnValues.documentLocation,
            tx: await web3Gateway.web3.eth.getTransaction(event.transactionHash), 
            block: await web3Gateway.web3.eth.getBlock(event.blockNumber),
            advisory: {} // will be set later
        }];
        let temp = vulnerabilities;
        temp.push(newEvent);
        await updateVulnerabilities(await filterVulnerabilities(temp));
        await web3Gateway.subscribeToSecurityAdvisoryUpdates(updateCallback, event.returnValues.advisoryIdentifier);
    }

    async function updateCallback(error, event) {
        if (error) 
            throw error;
        for (const vulnerability of vulnerabilities) {
            if (vulnerability.type === "new") {
                const hex = await web3Gateway.web3.utils.soliditySha3({
                    type: 'string',
                    value: vulnerability[0].event.returnValues.advisoryIdentifier
                });
                if (event.returnValues.advisoryIdentifier === hex) {
                    vulnerability.push({
                        type: "update",
                        event: event,
                        cid: event.returnValues.documentLocation,
                        tx: await web3Gateway.web3.eth.getTransaction(event.transactionHash), 
                        block: await web3Gateway.web3.eth.getBlock(event.blockNumber), 
                        advisory: {} // will be set later
                    });
                }
            }
        }
        updateVulnerabilities(await filterVulnerabilities(vulnerabilities));
    }

    async function privateCallback(error, event) {
        if (error)
            throw error;
        let vulnerability = [{
            type: "private",
            event: event,
            cid: event.returnValues.location,
            tx: await web3Gateway.web3.eth.getTransaction(event.transactionHash), 
            block: await web3Gateway.web3.eth.getBlock(event.blockNumber), 
            advisory: {} // will be set later
        }];
        addPrivateVulnerability(vulnerability);
    }

    /** 
     * Filters vulnerabilities to only show relevant vulnerabilities. 
     * @param {[]} vulnerabilities List of vulnerability objects.
     * @returns List of object with matching vulnerabilities that matches whitelist and dependencies. 
     * */
    async function filterVulnerabilities(vulnerabilities) {
        let matches = [];
        for (const vulnerability of vulnerabilities) {
            if (vulnerability[0].type === "private") {
                matches.push(vulnerability);
                continue;
            }
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
        web3Gateway.clearSubscriptions();
        await subscribe();
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
            web3Gateway.clearSubscriptions();
        }
        loadFromLocalStorage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ipfs]);

    useEffect(() => {
        if (aesKey !== null) {
            Contracts.load(aesKey).then((con) => {
                privateWhitelist.current = con;
                subscribe();
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aesKey]);


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
                privateWhitelist={privateWhitelist.current}
                ipfs={ipfs} /> 
            : <h4>No matching vulnerabilities found.</h4>}
        </>
    );
}
export default Vulnerabilities;
