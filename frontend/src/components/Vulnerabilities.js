// bootstrap
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

// libraries
import Web3 from 'web3';
import { Buffer } from 'buffer';
import { useEffect, useRef, useState } from 'react';
import { CONTACT_ABI, CONTACT_ADDRESS, LS_KEY_DEP, LS_KEY_WL } from '../config.js';

// components
import RefreshConfirmation from './RefreshConfirmation.js';
import VulnerabilityAcordion from './VulnerabilityAcordion.js';
import FilterSwtich from './FilterSwitch.js';

function Vulnerabilities({ ipfs }) {
    let [vulnerabilities, setVulnerabilities] = useState([]);

    let lastBlockRead = useRef(0);
    let dependecies = useRef([]);
    let whitelist = useRef([]);

    // Used to control the modal for refresh confirmation
    const [showModal, setShowModal] = useState(false);
    const modalClose = () => setShowModal(false);
    const modalShow = () => setShowModal(true);

    // Used to enable/disable filtering 
    const [filtering, setFiltering] = useState(true);

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
        if (filtering) {
            let userVulns = await filterVulnerabilities(events, txs, blocks, advisories); // run another place for optimization
            setVulnerabilities(userVulns);
        }
        else {
            let vulns = [];
            for (const [index, event] of events.entries()) {
                vulns.push({event: event, tx: txs[index], block: blocks[index], advisory: advisories[index]});
            }
            setVulnerabilities(vulns);
        }
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
        // Load event transactions, blocks that events were mined in, and IPFS content
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

    /** Filters vulnerabilities to only show relevant vulnerabilities. 
     * @param {[]} events List of events to filter. 
     * @param {[]} txs List of transactions to filter. 
     * @param {[]} blocks List of blocks to filter.
     * @param {[]} advisories List of advisories to filter. 
     * @returns List of object with matching events, transactions, blocks, and advisories. */
    async function filterVulnerabilities(events, txs, blocks, advisories) {
        let matches = []
        for (const [index, event] of events.entries()) {
            let pids = event.returnValues.productId.split(",");
            if (pids.some(element => {return dependecies.current.includes(element)})) {
                if (whitelist.current.some(obj => {return txs[index].to === Object.keys(obj)[0]})){
                    matches.push({event: event, tx: txs[index], block: blocks[index], advisory: advisories[index]});
                    //setVulnerabilities(vulnerabilities.push({event: event, tx: txs[index], block: blocks[index], advisory: advisories[index]}))
                    //vulnerabilities.push({event: event, tx: txs[index], block: blocks[index], advisory: advisories[index]})
                }
            }
        }
        return matches;
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
        dependecies.current = JSON.parse(localStorage.getItem(LS_KEY_DEP)).dependencies;
        whitelist.current = JSON.parse(localStorage.getItem(LS_KEY_WL)).whitelist;
        initialize(ipfs);
        lastBlockRead.current = 0;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ipfs, filtering])

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
                    <Col xs lg="8"><h1>Your vulnerabilities</h1></Col>
                    <Col xs lg="2">
                        <Form>
                            <Form.Check type='switch' id="filterswitch" label="Enable filtering" defaultChecked="true" onChange={(e) => setFiltering(e.target.checked)}></Form.Check>
                        </Form>
                    </Col>
                    <Col sm md="2">
                        {showUpdateButton
                            ? <Button variant="primary" size='md' onClick={() => getNewEvents(ipfs)}>Update</Button>
                            : <Button active="false" variant="secondary" size='md'>Update</Button>}
                        <Button variant="danger" className="float-end" size='md' onClick={modalShow}>Refresh</Button>
                    </Col>
                </Row>
            </Container>
            {vulnerabilities.length > 0
            ?<VulnerabilityAcordion vulnerabilities={vulnerabilities} />
            :<h4>No vulnerabilities... For now!</h4>}
            
        </>
    );
}
export default Vulnerabilities;