import { Route, Routes } from "react-router-dom"
import Container from 'react-bootstrap/Container';
import Vulnerabilities from './Vulnerabilities';
import Announcement from './Announcement';
import Settings from './Settings';
import Accounts from './Accounts';
import Spinner from 'react-bootstrap/Spinner';

import { useEffect, useState } from "react";
import * as IPFS from 'ipfs-core';

function App() {
  const [ipfs, setIpfs] = useState();

  async function loadIpfs() {
    var result = await IPFS.create({ repo: '/var/ipfs/data' });
    setIpfs(result);
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
          <Routes>
            <Route exact path='/' Component={() => <Vulnerabilities ipfs={ipfs}/>}/>
            <Route path='announcement' Component={Announcement} />
            <Route path='settings' Component={Settings} />
            <Route path='accounts' Component={Accounts} />
          </Routes>
        }
      </Container>
    </div>
  )
}
export default App;