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
import * as IPFS from 'ipfs-core';
import Web3 from "web3";

function App() {
    const [ipfs, setIpfs] = useState(); // IPFS node 

    const vulnerabilities = useRef([]); // set here to persist from page to page
    const updateVulnerabilities = (updatedVulnerabilities) => { vulnerabilities.current = [...updatedVulnerabilities].reverse(); }

    const web3 = useRef(new Web3(Web3.givenProvider || 'ws://localhost:7545')); // set here to persist from page to page
    const clearSubscriptions = () => { web3.current.eth.clearSubscriptions(); }

    async function loadIpfs() {
        const ws = new WebSockets({
            //       👇 allow all WebSocket connections 
            filter: all,
        })

        var node = await IPFS.create({ repo: '/var/ipfs/data' });
        setIpfs(node);
        let file = {
            path: '/test/bsi.txt',
            content: JSON.stringify({"title":"CVRF-CSAF-Converter: XML External Entities Vulnerability","severity":"Moderate","description":"No description provided.","vendors":[{"name":"CSAF Tools","products":[{"versions":[{"fullName":"CSAF Tools CVRF-CSAF-Converter 1.0.0-alpha","identifier":"CSAFPID-0001","version":"1.0.0-alpha"},{"fullName":"CSAF Tools CVRF-CSAF-Converter 1.0.0-dev1","identifier":"CSAFPID-0002","version":"1.0.0-dev1"},{"fullName":"CSAF Tools CVRF-CSAF-Converter 1.0.0-dev2","identifier":"CSAFPID-0003","version":"1.0.0-dev2"},{"fullName":"CSAF Tools CVRF-CSAF-Converter 1.0.0-dev3","identifier":"CSAFPID-0004","version":"1.0.0-dev3"},{"fullName":"CSAF Tools CVRF-CSAF-Converter 1.0.0-rc1","identifier":"CSAFPID-0005","version":"1.0.0-rc1"},{"fullName":"CSAF Tools CVRF-CSAF-Converter 1.0.0-rc2","identifier":"CSAFPID-0006","version":"1.0.0-rc2"}],"name":"CVRF-CSAF-Converter"}]}],"vulnerabilities":[{"cwe":"CWE-611","cvss":{},"productStatus":{},"description":["CSAF Tools CVRF-CSAF-Converter 1.0.0-rc1 resolves XML External Entities (XXE). This leads to the inclusion of arbitrary (local) file content into the generated output document. An attacker can exploit this to disclose information from the system running the converter."],"remediations":[{"details":"Update to the latest version of the product. At least version 1.0.0-rc2","url":"https://github.com/csaf-tools/CVRF-CSAF-Converter/releases/tag/1.0.0-rc2","productIds":{}}]}]})
        };
        let cid = await node.add(file); 
        console.log(cid.cid.toString());

        const pcid = await node.pin.add(cid.cid);
        console.log(pcid.toString());
        console.log(await node.bootstrap.reset());

        // ipfs.io/ipfs/QmcH8qSWZY81cyDVG9xpTT9Q3tjkXjYQVhMuMy3SBqLfYT/bsi.txt
        // dweb.link/ipfs/QmcH8qSWZY81cyDVG9xpTT9Q3tjkXjYQVhMuMy3SBqLfYT/bsi.txt
        // QmcH8qSWZY81cyDVG9xpTT9Q3tjkXjYQVhMuMy3SBqLfYT

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