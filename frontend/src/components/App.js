import { Route, Routes } from "react-router-dom"
import Container from 'react-bootstrap/Container';
import Vulnerabilities from './vulnerabilities/Vulnerabilities';
import Announcement from './announcement/Announcement';
import Settings from './settings/Settings';
import Accounts from './accounts/Accounts';
import Spinner from 'react-bootstrap/Spinner';
import ConfidentialAnnouncements from './confidentialAnnouncement/ConfidentialAnnouncements';
import ConfidentialSettings from "./confidentialSettings/ConfidentialSettings";

import { useEffect, useRef, useState } from "react";
import { create } from "ipfs-http-client";
import Web3 from "web3";

function App() {
    const [ipfs, setIpfs] = useState(); // IPFS node 

    const vulnerabilities = useRef([]); // set here to persist from page to page
    const updateVulnerabilities = (updatedVulnerabilities) => { vulnerabilities.current = [...updatedVulnerabilities].reverse(); }

    const web3 = useRef(new Web3(Web3.givenProvider || 'ws://localhost:7545')); // set here to persist from page to page
    const clearSubscriptions = () => { web3.current.eth.clearSubscriptions(); }

    async function loadIpfs() {
        var ipfsClient = create({ 
            host: "127.0.0.1",
            port: 5001,
            protocol: "http"});
        setIpfs(ipfsClient);
    }

    useEffect(() => {
        loadIpfs();
    }, []);

    return (
        <div>
            <Container>
                {ipfs === undefined
                    ? <Spinner animation="border" role="status" style={{ width: "4rem", height: "4rem", position: "absolute", top: "20%", left: "50%" }}>
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    :
                    <Routes>
                        <Route exact path='/' Component={() =>
                            <Vulnerabilities 
                                ipfs={ipfs} 
                                vulnerabilitiesRef={vulnerabilities.current}
                                updateVulnerabilitiesRef={updateVulnerabilities}
                                web3Ref={web3.current}
                                clearSubscriptions={clearSubscriptions}
                            />} 
                        />
                        <Route path='announcement' Component={Announcement} />
                        <Route path='settings' Component={Settings} />
                        <Route path='accounts' Component={Accounts} />
                        <Route path='confidentialAnnouncement' Component={() => <ConfidentialAnnouncements ipfs={ipfs} />} />
                        <Route path='confidentialSettings' Component={ConfidentialSettings} />
                    </Routes>
                }
            </Container>
        </div>
    )
}
export default App;