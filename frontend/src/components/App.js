import { Route, Routes } from "react-router-dom"
import Container from 'react-bootstrap/Container';

import VulnerabilityTable from './VulnerabilityTable';
import Announcement from './Announcement';

function App() {
  return (
    <div>
      <Container>
        <Routes>
          <Route exact path='/' Component={VulnerabilityTable} />
          <Route path='announcement' Component={Announcement} />
        </Routes>
      </Container>
    </div>
  )
}
export default App;