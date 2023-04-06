import { Route, Routes } from "react-router-dom"
import Container from 'react-bootstrap/Container';
import Vulnerabilities from './vulnerabilities/Vulnerabilities';
import Announcement from './announcement/Announcement';
import Settings from './settings/Settings';
import Accounts from './accounts/Accounts';
import Spinner from 'react-bootstrap/Spinner';
import ConfidentialAnnouncements from './confidentialAnnouncement/ConfidentialAnnouncements';
import ConfidentialSettings from "./confidentialSettings/ConfidentialSettings";


import { useEffect, useState } from "react";
import * as IPFS from 'ipfs-core';
import { PasswordContext } from "../contexts/PasswordContext";
import PasswordModal from "./PasswordModal";

function App() {
  const [ipfs, setIpfs] = useState();
  const [cryptoKey, setCryptoKey] = useState(null);
  const [showPwModal, setShowPwModal] = useState(true);

  async function loadIpfs() {
    var node = await IPFS.create({ repo: '/var/ipfs/data' });
    setIpfs(node);
  }

  useEffect(() => {
    loadIpfs();
  }, []);

  return (
    <div>
      <Container>
        {ipfs === undefined
        ? <Spinner animation="border" role="status"  style={{ width: "4rem", height: "4rem", position: "absolute", top: "20%", left: "50%" }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        : 
        <PasswordContext.Provider value={cryptoKey}>
            <PasswordModal state={showPwModal} setPasswordContext={(key) => setCryptoKey(key)} dismiss={() => setShowPwModal(false)} done={() => setShowPwModal(false)} ></PasswordModal>
            <Routes>
                <Route exact path='/' Component={() => <Vulnerabilities ipfs={ipfs}/>}/>
                <Route path='announcement' Component={Announcement} />
                <Route path='settings' Component={Settings} />
                <Route path='accounts' Component={Accounts} />
                <Route path='confidentialAnnouncement' Component={() => <ConfidentialAnnouncements ipfs={ipfs} />} />
                <Route path='confidentialSettings' Component={ConfidentialSettings} />
            </Routes>    
        </PasswordContext.Provider>
        }
      </Container>
    </div>
  )
}
export default App;