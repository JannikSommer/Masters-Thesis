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
                advisory: {}
            }]; 
            //setAllVulnerabilities(filterVulnerabilities(newVulnerability.concat(allVulnerabilities)));
            vulnerabilities.current.push(newVulnerability);
            updateAllVulnerabilities(vulnerabilities.current);
            await subscribeToUpdates(event.returnValues.advisoryIdentifier);
        });
    }

    async function subscribeToUpdates(advisoryIdentifier) {
        let contract = new web3.current.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
        return contract.events.UpdatedSecurityAdvisory({
            // eslint-disable-next-line
            topics: [, web3.current.utils.soliditySha3({type: 'string', value: advisoryIdentifier})],
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
                        advisory: {}
                    });
                }
            }
            updateAllVulnerabilities(vulnerabilities.current);
        });
    }

    /** Collects information about events, transactions, blocks, and advisories from 
     * connected Ethereum network and IPFS with the ipfs param. */
    async function initialize() {
        let web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
        let vulnerabilities = [];
        let announcements = (await loadEvents(web3, "NewSecurityAdvisory")).reverse();
        for await (const announcement of announcements) {
            vulnerabilities.push(await announcementUpdates(web3, announcement));
        }
        setAllVulnerabilities(await filterVulnerabilities(vulnerabilities));
    }
    /** Retrieves all advisory updates for a given advisory announcement.
     * @param {Web3} web3 Web3 instance used to connect to blockchain network. 
     * @param {Event} announcement Event object of the original announcement. 
     * @returns List of announcement and updates objects. */
    async function announcementUpdates(web3, announcement) {
        let events = [{
            type: "new",
            event: announcement, 
            tx: await web3.eth.getTransaction(announcement.transactionHash), 
            block: await web3.eth.getBlock(announcement.blockNumber), 
            advisory: await loadIpfsContent(ipfs, announcement.returnValues.documentLocation)
        }];

        let updates = await loadEvents(web3, "UpdatedSecurityAdvisory", 
            web3.utils.soliditySha3({type: 'string', value: announcement.returnValues.advisoryIdentifier})
        );
        for await (const update of updates) {
            events.push({
                type: "update",
                event: update,
                tx: await web3.eth.getTransaction(update.transactionHash), 
                block: await web3.eth.getBlock(update.blockNumber), 
                advisory: await loadIpfsContent(ipfs, update.returnValues.documentLocation)
            });
        }
        return events;
    }

        /** Load specified events from a Ethereum network. 
     * @param {Web3} web3 Web3 instance used to connect to blockchain network. 
     * @param {String} eventName Name of the event to get search for. 
     * @returns List of events. */
    async function loadEvents(web3, eventName, filter = null) {
        let contract = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
        return await contract.getPastEvents(
            eventName, {
                // eslint-disable-next-line 
                topics: filter === null ? null : [ , filter],
                fromBlock: lastBlockRead.current + 1, 
                toBlock: 'latest' 
            },
            function (error, events) {
                if (error) 
                    throw error;
                return events;
            }
        );
    }

    async function loadIpfsContent(ipfs, cid) {
        let content = [];
        for await (const chunk of await ipfs.cat(cid)) {
            content = [...content, ...chunk];
        }
        return new SecurityAdvisory(Buffer.from(content).toString('utf8'));
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

    /** Deletes and retrieves all data. */
    async function refreshVulnerabilities() {
        lastBlockRead.current = 0;
        subscriptions.current = subscriptions.current.push(await subscribeToNewAdvisories());
        initialize();
        modalClose();
    }

    useEffect(() => {
        dependencies.current = JSON.parse(localStorage.getItem(LS_KEY_DEP));
        whitelist.current = JSON.parse(localStorage.getItem(LS_KEY_WL));
        web3.current = new Web3(Web3.givenProvider || 'ws://localhost:7545');
        subscriptions.current.push(subscribeToNewAdvisories());
        //initialize();
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
