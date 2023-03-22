// bootstrap
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

// libraries
import Web3 from 'web3';
import { Buffer } from 'buffer';
import { useEffect, useRef, useState } from 'react';
import { CONTACT_ABI, CONTACT_ADDRESS } from '../config.js';

// components
import RefreshConfirmation from './RefreshConfirmation.js';
import VulnerabilityAcordion from './VulnerabilityAcordion.js';

function Vulnerabilities({ ipfs }) {
    let lastBlockRead = useRef(0);

    // Used to control the modal for refresh confirmation
    const [showModal, setShowModal] = useState(false);
    const modalClose = () => setShowModal(false);
    const modalShow = () => setShowModal(true);

    // Used to control update button
    const [showUpdateButton, setShowUpdateButton] = useState(true);
    const activateUpdateButton = () => setShowUpdateButton(true);
    const deactivateUpdateButton = () => setShowUpdateButton(false);

    // Vulnerability data hooks
    const [events, setEvents] = useState([]);
    const [txs, setEventTxs] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [advisories, setAdvisories] = useState([]);

    /** Collects information about events, transactions, blocks, and advisories from 
     * connected Ethereum network and IPFS with the ipfs param. 
     * @param {IPFS} ipfs Running ipfs node to collect files with. */
    async function initialize(ipfs) {
        let web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
        let events = await loadEvents(web3);
        let data = await loadEventRelatedData(web3, events, ipfs);
        let txs = data[0], blocks = data[1], advisories = data[2];

        // Set values only after everything has been loaded
        setEvents(events);
        setEventTxs(txs);
        setBlocks(blocks);
        setAdvisories(advisories);
    }

    /** Load events of type NewSecurityAdvisory from a Ethereum network. 
     * @param {Web3} web3 Web3 instance used to connect to blockchain network. 
     * @param {Number} from The blocknumber to begin search from. Default 0. 
     * @param {Number} to The blocknumer to end search at. Default 'latest'. 
     * @returns List of events. */
    async function loadEvents(web3, from = 0, to = 'latest') {
        // Load events
        let contract = await new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
        let events = await contract.getPastEvents(
            "NewSecuriytAdvisory", { fromBlock: from, toBlock: to },
            function (error, events) {
                if (error) throw error;
                return events;
            });
        events.reverse(); // newest first
        return events;
    }

    /** Loads data about transactions, blocks, and advisories related to events. 
     * @param {Web3} web3 Web3 instance used to connect to blockchain network. 
     * @param {[]} events List of events to get data from.
     * @param {IPFS} ipfs Running ipfs node to collect files with.
     * @returns  List of [transactions], [blocks] and [advisories]*/
    async function loadEventRelatedData(web3, events, ipfs) {
        // Load event transactions
        // blocks that events were mined in
        // and IPFS content
        let txs = [], blocks = [], advisories = [], content = [];
        for (const event of events) {
            txs.push(await web3.eth.getTransaction(event.transactionHash));
            blocks.push(await web3.eth.getBlock(event.blockNumber));
            for await (const chunk of await ipfs.cat(event.returnValues.documentLocation)) {
                content = [...content, ...chunk];
            }
            advisories.push(Buffer.from(content).toString('utf8'));
        }
        return [txs, blocks, advisories];
    }

    /** Retrieves new events of type NewSecurityAdvisory from connected Ethereum network. 
     * @param {IPFS} ipfs Running ipfs node to collect files with. 
     * @param {Number} to Blocknumber to end event search at. Default "latest" */
    async function getNewEvents(ipfs, to = 'latest') {
        deactivateUpdateButton(); // deactivate
        // load new events since last scan
        let web3 = await new Web3(Web3.givenProvider || 'http://localhost:7545');
        let contract = await new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
        let newEvents = await contract.getPastEvents(
            "NewSecuriytAdvisory", { fromBlock: lastBlockRead.current + 1, toBlock: to },
            function (error, events) {
                if (error) throw error;
                return events;
            });
        newEvents.reverse();
        let data = await loadEventRelatedData(web3, events, ipfs);
        let newTxs = data[0], newBlocks = data[1], newAdvisories = data[2];
        setEvents(newEvents.concat(events));
        setEventTxs(newTxs.concat(txs));
        setBlocks(newBlocks.concat(blocks));
        setAdvisories(newAdvisories.concat(advisories));
        activateUpdateButton(); //re-activate
    }

    /** Deletes and retrives all data. 
     * @param {IPFS} ipfs Running ipfs node to collect files with. */
    async function refreshVulnerabilities(ipfs) {
        // Reset all values
        setEvents([]);
        setEventTxs([]);
        setBlocks([]);
        setAdvisories([]);
        lastBlockRead.current = 0;
        // Retrieve data
        initialize(ipfs);
        // Remove modal
        modalClose();
    }

    useEffect(() => {
        initialize(ipfs);
        lastBlockRead.current = 0;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ipfs])

    useEffect(() => {
        if (events.length > 0)
            // Since the list is reversed, we should get the first block which is the last
            lastBlockRead.current = events[0].blockNumber;
    }, [events]);

    return (
        <>
            <br />
            <RefreshConfirmation ipfs={ipfs} state={showModal} close={modalClose} loadEvents={() => refreshVulnerabilities(ipfs)} />
            <Container>
                <Row>
                    <Col xs lg="10"><h1>Your vulnerabilities</h1></Col>
                    <Col sm md="2">
                        {showUpdateButton
                            ? <Button variant="primary" size='md' onClick={() => getNewEvents(ipfs)}>Update</Button>
                            : <Button active="false" variant="secondary" size='md'>Update</Button>}
                        <Button variant="danger" className="float-end" size='md' onClick={modalShow}>Refresh</Button>
                    </Col>
                </Row>
            </Container>
            <VulnerabilityAcordion announcements={events} blocks={blocks} txs={txs} advisories={advisories} />
        </>
    );
}
export default Vulnerabilities;