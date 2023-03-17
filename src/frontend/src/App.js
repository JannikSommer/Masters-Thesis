import logo from './logo.svg';
import './App.css';

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

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

export default App;
