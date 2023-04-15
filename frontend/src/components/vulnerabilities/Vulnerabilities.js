import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';

import { PasswordContext } from '../../contexts/PasswordContext';
import { useEffect, useRef, useState, useContext } from 'react';
import { LS_KEY_DEP, LS_KEY_WL } from '../../config.js';
import Contracts from '../../localStorage/Contracts.js';

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

    const [loading, setLoading] = useState(true);

    // Used to control the modal for refresh confirmation
    const [showModal, setShowModal] = useState(false);
    const modalClose = () => setShowModal(false);
    const modalShow = () => setShowModal(true);

    // Vulnerability data hook
    var [vulnerabilities, setVulnerabilities] = useState([]);

    /**
     * Update the vulnerabilities hook that displays the vulnerabilities.
     * The function is called in callback functions for the different events.
     * @param {*} event New event from the web3 gateway to be added to the vulnerabilities list.
     */
    const updateVulnerabilities = (event) => {
        let temp = vulnerabilities;
        if (event.type === "new" || event.type === "private") {
            temp.push([event]);
        }
        else if (event.type === "update") {
            for (let entry of vulnerabilities) {
                let hexedIdentifier = web3Gateway.web3.utils.soliditySha3(entry[0].event.returnValues.advisoryIdentifier);
                if (hexedIdentifier === event.event.returnValues.advisoryIdentifier) {
                    entry.push(event);
                    break;
                }
            }
        }
        setVulnerabilities([...temp.sort((a, b) => a[0].block.timestamp - b[0].block.timestamp)].reverse());
   }

   /**
    * Set up subscriptions for the different events to display vulnerabilities.
    */
    async function subscribe() {
        await web3Gateway.subscribeNewSecurityAdvisories(newCallback);
        for await (const contract of privateWhitelist.current) {
            await web3Gateway.subscribeToPrivateSecurityAdvisories(privateCallback, contract.address);
        }
    }

    /**
     * Sets up the vulnerabilities list to be displayed on the page.
     * Data is fetched from the Web3 gateway and then filtered.
     * @returns {[]} Sorted and filtered list of vulnerabilities.
     */
    async function setUpVulnerabilities() {
        let result = [];
        for await (const event of web3Gateway.newSecurityAdvisoryEvents) {
            let intermediate = [event];
            for await (const update of web3Gateway.updatedSecurityAdvisoryEvents) {
                if (update.event.returnValues.advisoryIdentifier === event.event.returnValues.advisoryIdentifier) {
                    intermediate.push(update);
                }
            }
            result.push(intermediate);
        }
        for (const event of web3Gateway.privateSecurityAdvisoryEvents) {
            result.push([event]);
        }
        let filtered = await filterVulnerabilities(result);
        return filtered.sort((a, b) => a[0].block.timestamp - b[0].block.timestamp);
    }

    /**
     * Callback function for new security advisory events.
     * @param {Object} error Error object from Web3.js.
     * @param {Object} event Event object from Web3.js.
     */
    async function newCallback(error, event) {
        if (error)
            throw error;
        const newEvent = {
            type: "new",
            event: event,
            cid: event.returnValues.documentLocation,
            tx: await web3Gateway.web3.eth.getTransaction(event.transactionHash),
            block: await web3Gateway.web3.eth.getBlock(event.blockNumber),
            advisory: {} // will be set later
        };
        let productIdentifiers = newEvent.event.returnValues.productIdentifiers.split(",");
        if (productIdentifiers.some(element => {return dependencies.current.includes(element)})) {
            if (whitelist.current.some(obj => {return newEvent.tx.to === obj.address})){
                web3Gateway.newSecurityAdvisoryEvents.push(newEvent);
                updateVulnerabilities(newEvent);
                web3Gateway.subscribeToSecurityAdvisoryUpdates(updateCallback, event.returnValues.advisoryIdentifier);            
            }
        }
    }

    /**
     * Callback function for update security advisory events.
     * @param {Object} error Error object from Web3.js.
     * @param {Object} event Event object from Web3.js.
     */
    async function updateCallback(error, event) {
        if (error)
            throw error;
        let updateEvent = {
            type: "update",
            event: event,
            cid: event.returnValues.documentLocation,
            tx: await web3Gateway.web3.eth.getTransaction(event.transactionHash),
            block: await web3Gateway.web3.eth.getBlock(event.blockNumber),
            advisory: {} // will be set later
        };
        web3Gateway.updatedSecurityAdvisoryEvents.push(updateEvent);
        updateVulnerabilities(updateEvent);
    }

    /**
     * Callback function for private security advisory events.
     * @param {Object} error Error object from Web3.js.
     * @param {Object} event Event object from Web3.js.
     */
    async function privateCallback(error, event) {
        if (error)
            throw error;
        let privateEvent = {
            type: "private",
            event: event,
            cid: event.returnValues.location,
            tx: await web3Gateway.web3.eth.getTransaction(event.transactionHash),
            block: await web3Gateway.web3.eth.getBlock(event.blockNumber),
            advisory: {} // will be set later
        };
        web3Gateway.privateSecurityAdvisoryEvents.push(privateEvent);
        updateVulnerabilities(privateEvent);
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
        setLoading(true);
        vulnerabilities.splice(0, vulnerabilities.length);
        web3Gateway.clearSubscriptions();
        await subscribe();
        modalClose();
        setLoading(false);
    }

    /**
     * Checks if all dependencies, whitelist and private whitelist are loaded and decides 
     * whether to subscribe to events or to load already existing events.
     */
    async function checkPreloadStatus() {
        if (dependencies.current.length > 0 && whitelist.current.length > 0 && privateWhitelist.current.length > 0) {
            if (web3Gateway.subscriptions.length === 0) {
                subscribe();
            }
            else {
                setUpVulnerabilities().then((result) => {
                    setVulnerabilities(result.reverse());
                });
            }
            setLoading(false);
        }
    }

    /**
     * Loading dependencies, whitelist and private whitelist from localstorage.
     */
    useEffect(() => {
        const lsDep = localStorage.getItem(LS_KEY_DEP);
        if (lsDep === null)
            throw new Error("No dependencies found in local storage.");
        for (const dep of JSON.parse(lsDep)) {
            dependencies.current.push(dep.identifier);
        }

        whitelist.current = JSON.parse(localStorage.getItem(LS_KEY_WL));
        checkPreloadStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ipfs]);

    /**
     * Loading private whitelist from localstorage after key is loaded.
     */
    useEffect(() => {
        if (aesKey !== null) {
            Contracts.load(aesKey).then((con) => {
                privateWhitelist.current = con;
                checkPreloadStatus();
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
            {loading
            ? <Spinner animation="border" role="status" style={{ width: "8rem", height: "8rem", position: "absolute", top: "40%", left: "47%" }}>
                <span className="visually-hidden">Loading...</span>
            </Spinner>
            : vulnerabilities.length > 0
                ? <VulnerabilityAccordion
                    vulnerabilities={vulnerabilities}
                    whitelist={whitelist.current}
                    dependencies={dependencies.current}
                    privateWhitelist={privateWhitelist.current}
                    ipfs={ipfs} />
                : <h4>No matching vulnerabilities found.</h4>
            }
        </>
    );
}
export default Vulnerabilities;
