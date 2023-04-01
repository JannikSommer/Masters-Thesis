// bootstrap
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

// libraries
import Web3 from 'web3';
import { Buffer } from 'buffer';
import { useEffect, useRef, useState } from 'react';
import { CONTACT_ABI, CONTACT_ADDRESS, LS_KEY_DEP, LS_KEY_WL } from '../../config.js';
import SecurityAdvisory from "../../models/SecurityAdvisory";

// components
import RefreshConfirmation from './RefreshConfirmation.js';
import VulnerabilityAccordion from './VulnerabilityAccordion.js';

/** Component of the /vulnerabilities page.
 * @param {IPFS} ipfs Prop of a running IPFS node. Must be fully initialized before passing. 
 * @returns The content of the vulnerabilities page.  */
function Vulnerabilities({ ipfs }) {
    let lastBlockRead = useRef(0);
    let dependencies = useRef([]);
    let whitelist = useRef([]);

    // Used to control the modal for refresh confirmation
    const [showModal, setShowModal] = useState(false);
    const modalClose = () => setShowModal(false);
    const modalShow = () => setShowModal(true);

    // Used to control update button
    const [showUpdateButton, setShowUpdateButton] = useState(true);
    const activateUpdateButton = () => setShowUpdateButton(true);
    const deactivateUpdateButton = () => setShowUpdateButton(false);

    // Vulnerability data hook
    const [allVulnerabilities, setAllVulnerabilities] = useState([]);

    /** Collects information about events, transactions, blocks, and advisories from 
     * connected Ethereum network and IPFS with the ipfs param. 
     * @param {IPFS} ipfs Running ipfs node passed as prop to component. Is used to collect file data with. */
    async function initialize(ipfs) {
        let web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
        let vulnerabilities = [];
        let announcements = await loadEvents(web3);
        for await (const announcement of announcements) {
            let events = [{
                type: "new",
                event: announcement, 
                tx: await web3.eth.getTransaction(announcement.transactionHash), 
                block: await web3.eth.getBlock(announcement.blockNumber), 
                advisory: await loadIpfsContent(ipfs, announcement.returnValues.documentLocation)
            }];

            let updates = await loadUpdatedEvents(web3, announcement.returnValues.advisoryIdentifier);
            for await (const update of updates) {
                events.push({
                    type: "update",
                    event: update,
                    tx: await web3.eth.getTransaction(update.transactionHash), 
                    block: await web3.eth.getBlock(update.blockNumber), 
                    advisory: await loadIpfsContent(ipfs, update.returnValues.documentLocation)
                });
            }
            vulnerabilities.push(events);
        }
        setAllVulnerabilities(await filterVulnerabilities(vulnerabilities));
    }

    async function loadIpfsContent(ipfs, cid) {
        let content = [];
        for await (const chunk of await ipfs.cat(cid)) {
            content = [...content, ...chunk];
        }
        return new SecurityAdvisory(Buffer.from(content).toString('utf8'));
    }

    /** Load events of type NewSecurityAdvisory from a Ethereum network. 
     * @param {Web3} web3 Web3 instance used to connect to blockchain network. 
     * @param {Number} from The blocknumber to begin search from. Default 0. 
     * @param {Number} to The blocknumber to end search at. Default 'latest'. 
     * @returns List of events. */
    async function loadEvents(web3, from = 0, to = 'latest') {
        // Load events
        let contract = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
        let events = await contract.getPastEvents(
            "NewSecurityAdvisory", { 
                fromBlock: from, 
                toBlock: to 
            },
            function (error, events) {
                if (error) 
                    throw error;
                return events;
            }
        );
        events.reverse(); // newest first
        return events;
    }

    async function loadUpdatedEvents(web3, advisoryIdentifier, from = 0, to = 'latest') {
        let contract = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
        return await contract.getPastEvents(
            "UpdatedSecurityAdvisory", {
                // eslint-disable-next-line 
                topics: [ ,web3.utils.soliditySha3( // first element in list is the signature
                    {type: 'string', value: advisoryIdentifier}
                )],
                fromBlock: from,
                toBlock: to
            },
            function (error, events) {
                if (error) 
                    throw error;
                return events;
            }
        );
    }

    /** Filters vulnerabilities to only show relevant vulnerabilities. 
     * @param {[]} vulnerabilities List of vulnerability objects.
     * @returns List of object with matching vulnerabilities that matches whitelist and dependencies. */
    async function filterVulnerabilities(vulnerabilities) {
        let matches = [];
        for (const vulnerability of vulnerabilities) {
            let productIdentifiers = vulnerability[0].event.returnValues.productIdentifiers.split(",");
            if (productIdentifiers.some(element => {return dependencies.current.includes(element)})) {
                if (whitelist.current.some(obj => {return vulnerability[0].tx.to === Object.keys(obj)[0]})){
                    matches.push(vulnerability);
                }
            }
        }
        return matches;
    }

    /** Retrieves new events of type NewSecurityAdvisory from connected Ethereum network. 
     * @param {IPFS} ipfs Running ipfs node to collect files with. 
     * @param {Number} to Blocknumber to end event search at. Default "latest" */
    async function getNewEvents(ipfs) {
        deactivateUpdateButton(); // deactivate
        // load new events since last scan
        let web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
        let newEvents = await loadEvents(web3, lastBlockRead.current + 1);
        newEvents.reverse();

        let allAnnouncements = [];
        for await (const vulnerability of allVulnerabilities) {
            allAnnouncements.push(vulnerability[0].event);
        }
        let newVulnerabilities = [];
        for await (const announcement of allAnnouncements) {
            let events = [{
                type: "new",
                event: announcement, 
                tx: await web3.eth.getTransaction(announcement.transactionHash), 
                block: await web3.eth.getBlock(announcement.blockNumber), 
                advisory: await loadIpfsContent(ipfs, announcement.returnValues.documentLocation)
            }];
            let updates = await loadUpdatedEvents(web3, announcement.returnValues.advisoryIdentifier, lastBlockRead.current + 1);
            for await (const update of updates) {
                events.push({
                    type: "update",
                    event: update, 
                    tx: await web3.eth.getTransaction(update.transactionHash), 
                    block: await web3.eth.getBlock(update.blockNumber), 
                    advisory: await loadIpfsContent(ipfs, update.returnValues.documentLocation)
                });
            }
            newVulnerabilities.push(events);
        }
        let filtered = await filterVulnerabilities(newVulnerabilities);
        setAllVulnerabilities(filtered);
        activateUpdateButton(); //re-activate
    }

    /** Deletes and retrieves all data. 
     * @param {IPFS} ipfs Running ipfs node to collect files with. */
    async function refreshVulnerabilities(ipfs) {
        lastBlockRead.current = 0;
        initialize(ipfs);
        modalClose();
    }

    useEffect(() => {
        dependencies.current = JSON.parse(localStorage.getItem(LS_KEY_DEP));
        whitelist.current = JSON.parse(localStorage.getItem(LS_KEY_WL));
        initialize(ipfs);
        lastBlockRead.current = 0;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ipfs])

    useEffect(() => {
        if (allVulnerabilities.length > 0)
            // Since the list is reversed, we should get the first block which is the last
            lastBlockRead.current = allVulnerabilities[0][0].event.blockNumber;
    }, [allVulnerabilities]);

    return (
        <>
            <br />
            <RefreshConfirmation ipfs={ipfs} state={showModal} close={modalClose} loadEvents={() => refreshVulnerabilities(ipfs)} />
            <Container>
                <Row>
                    <Col lg="10"><h1>Vulnerabilities</h1></Col>
                    <Col lg="2">
                        {showUpdateButton
                            ? <Button variant="primary" size='md' onClick={() => getNewEvents(ipfs)}>Update</Button>
                            : <Button active="false" variant="secondary" size='md'>Update</Button>}
                        <Button variant="danger" className="float-end" size='md' onClick={modalShow}>Refresh</Button>
                    </Col>
                </Row>
            </Container>
            {allVulnerabilities.length > 0 
            ? <VulnerabilityAccordion 
                vulnerabilities={allVulnerabilities} 
                dependencies={dependencies.current} /> 
            : <h4>No matching vulnerabilities found.</h4>}
        </>
    );
}
export default Vulnerabilities;
