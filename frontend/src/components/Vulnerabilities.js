// bootstrap
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

// libraries
import Web3 from 'web3';
import { Buffer } from 'buffer';
import { useEffect, useRef, useState } from 'react';
import { CONTACT_ABI, CONTACT_ADDRESS, LS_KEY_DEP, LS_KEY_WL } from '../config.js';
import SecurityAdvisory from "../models/SecurityAdvisory";

// components
import RefreshConfirmation from './RefreshConfirmation.js';
import VulnerabilityAccordion from './VulnerabilityAccordion.js';
import FilterSwitch from './FilterSwitch.js';

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

    // Used to enable/disable filtering 
    const [filtering, setFiltering] = useState(true);

    // Used to control update button
    const [showUpdateButton, setShowUpdateButton] = useState(true);
    const activateUpdateButton = () => setShowUpdateButton(true);
    const deactivateUpdateButton = () => setShowUpdateButton(false);

    // Vulnerability data hook
    const [allVulnerabilities, setAllVulnerabilities] = useState([]);
    const [userVulnerabilities, setUserVulnerabilities] = useState([]);


    /** Collects information about events, transactions, blocks, and advisories from 
     * connected Ethereum network and IPFS with the ipfs param. 
     * @param {IPFS} ipfs Running ipfs node passed as prop to component. Is used to collect file data with. */
    async function initialize(ipfs) {
        let web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
        let events = await loadEvents(web3);
        let data = await loadEventRelatedData(web3, events, ipfs);
        let txs = data[0], blocks = data[1], advisories = data[2];
        let allVulnerabilities = [];
        for (const [index, event] of events.entries()) {
            allVulnerabilities.push({event: event, tx: txs[index], block: blocks[index], advisory: advisories[index]});
        }
        setAllVulnerabilities(allVulnerabilities);
        setUserVulnerabilities(await filterVulnerabilities(events, txs, blocks, advisories));
        //console.log(allVulnerabilities[0].advisory.getProductInformation(dependencies.current[0]));
    }

    /** Load events of type NewSecurityAdvisory from a Ethereum network. 
     * @param {Web3} web3 Web3 instance used to connect to blockchain network. 
     * @param {Number} from The blocknumber to begin search from. Default 0. 
     * @param {Number} to The blocknumber to end search at. Default 'latest'. 
     * @returns List of events. */
    async function loadEvents(web3, from = 0, to = 'latest') {
        // Load events
        let contract = await new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
        let events = await contract.getPastEvents(
            "NewSecurityAdvisory", { fromBlock: from, toBlock: to },
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
            let advisory = new SecurityAdvisory(Buffer.from(content).toString('utf8'));
            advisories.push(advisory);
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
            if (pids.some(element => {return dependencies.current.includes(element)})) {
                if (whitelist.current.some(obj => {return txs[index].to === Object.keys(obj)[0]})){
                    matches.push({event: event, tx: txs[index], block: blocks[index], advisory: advisories[index]});
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
        let data = await loadEventRelatedData(web3, newEvents, ipfs);
        let newTxs = data[0], newBlocks = data[1], newAdvisories = data[2];
        let newVulnerabilities = [];
        for (const [index, event] of newEvents.entries()) {
            newVulnerabilities.push({event: event, tx: newTxs[index], block: newBlocks[index], advisory: newAdvisories[index]});
        }
        setAllVulnerabilities(newVulnerabilities.concat(allVulnerabilities));
        let newUserVulnerabilities = await filterVulnerabilities(newEvents, newTxs, newBlocks, newAdvisories)
        setUserVulnerabilities(newUserVulnerabilities.concat(userVulnerabilities));
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
            lastBlockRead.current = allVulnerabilities[0].event.blockNumber;
    }, [allVulnerabilities]);

    return (
        <>
            <br />
            <RefreshConfirmation ipfs={ipfs} state={showModal} close={modalClose} loadEvents={() => refreshVulnerabilities(ipfs)} />
            <Container>
                <Row>
                    <Col lg="8"><h1>Vulnerabilities</h1></Col>
                    <Col lg="2">
                        <FilterSwitch setFiltering={setFiltering} />
                    </Col>
                    <Col lg="2">
                        {showUpdateButton
                            ? <Button variant="primary" size='md' onClick={() => getNewEvents(ipfs)}>Update</Button>
                            : <Button active="false" variant="secondary" size='md'>Update</Button>}
                        <Button variant="danger" className="float-end" size='md' onClick={modalShow}>Refresh</Button>
                    </Col>
                </Row>
            </Container>
            {filtering
                ? userVulnerabilities.length > 0 ? <VulnerabilityAccordion vulnerabilities={userVulnerabilities} dependencies={dependencies.current} /> : <h4>No matching vulnerabilities found.</h4>
                : allVulnerabilities.length > 0  ? <VulnerabilityAccordion vulnerabilities={allVulnerabilities} dependencies={dependencies.current} />  : <h4>No vulnerabilities found.</h4>}
        </>
    );
}
export default Vulnerabilities;