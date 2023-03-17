import { Route, Routes } from "react-router-dom"
import Container from 'react-bootstrap/Container';

import VulnerabilityTable from './VulnerabilityTable';
import Announcement from './Announcement';
import Settings from './Settings';
import Accounts from './Accounts';

function App() {
  return (
    <div>
      <Container>
        <Routes>
          <Route exact path='/' Component={VulnerabilityTable} />
          <Route path='announcement' Component={Announcement} />
          <Route path='Settings' Component={Settings} />
          <Route path='Accounts' Component={Accounts} />
        </Routes>
      </Container>
    </div>
  )
}
export default App;