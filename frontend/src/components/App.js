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
import { PasswordContext } from "../contexts/PasswordContext";
import PasswordModal from "./PasswordModal";
import Web3Gateway from "../models/web3/web3Gateway";

export default function App() {
    const [ipfs, setIpfs] = useState();
    const [loading, setLoading] = useState(true);
    const [cryptoKey, setCryptoKey] = useState(null);
    const [showPwModal, setShowPwModal] = useState(true);
    const web3Gateway = useRef(new Web3Gateway());

    async function loadIpfs() {
        var ipfsClient = create({
            host: "127.0.0.1",
            port: 5001,
            protocol: "http"
        });
        setIpfs(ipfsClient);
    }
    
    useEffect(() => {
        setLoading(true);
        if (ipfs === undefined)
            loadIpfs();
        setLoading(false);
    }, [ipfs, loading]);

    return (
        <div>
            <Container className="mb-5 pb-5">
                {loading
                    ? <Spinner animation="border" role="status" style={{ width: "4rem", height: "4rem", position: "absolute", top: "20%", left: "50%" }}>
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    : <PasswordContext.Provider value={cryptoKey}>
                        <PasswordModal state={showPwModal} setPasswordContext={(key) => setCryptoKey(key)} dismiss={() => setShowPwModal(false)} done={() => setShowPwModal(false)} ></PasswordModal>
                        <Routes>
                            <Route exact path='/' Component={() => 
                                <Vulnerabilities 
                                    ipfs={ipfs}
                                    web3Gateway={web3Gateway.current}
                                />}
                            />
                            <Route path='announcement' Component={() => <Announcement ipfs={ipfs} />} />
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