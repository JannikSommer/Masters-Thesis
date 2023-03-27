import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

import { useState } from 'react';

import { VENDOR_CONTRACT_ABI } from '../../config';
import Web3 from 'web3';
import AcceptModal from './AcceptModal';
import ErrorModal from './ErrorModal';
import SuccessModal from './SuccessModal';

function NewAdvisoryForm() {
    const [account, setAccount] = useState("0x8a14BFc39B0D2299B8D4181C5AD03d3863333815");
    const [address, setAddress] = useState("0x6aa196cb41C5CAA23ecDe4Be00B86015AE3A0F2D");
    const [pids, setPids] = useState("CSAFPID-0001,CSAFPID-0002");
    const [cid, setCid] = useState("QmPQuXq1JuipvhLKdDz84eSM3tLbESjDAKeAHNzScjZz7Y");
    const [accept, setAccept] = useState(false);
    const [transaction, setTransaction] = useState("");
    const [error, setError] = useState("");

    const [showWarning, setShowWarning] = useState(false);
    const dismissWarning = () => setShowWarning(false);

    const [showTransaction, setShowTransaction] = useState(false);
    const dismissTransaction = () => setShowTransaction(false);

    const [showError, setShowError] = useState(false);
    const dismissError = () => setShowError(false);

    const announce = () => {
        if (!accept) {
            return;
        };
        dismissWarning();
        let pkey = "4128f3cd838b12265a6b0f51ba3b8feb92049c413e2cdad7d63563b9a136ab55";
        try {
            var web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
            const contract = new web3.eth.Contract(VENDOR_CONTRACT_ABI, address);
            web3.eth.accounts.signTransaction({
                from: account,
                to: address,
                gas: 6721975,
                data: contract.methods.announceNewAdvisory(pids, cid).encodeABI()
            }, pkey).then((signedTx) => {
                const sentTx = web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
                sentTx.on("receipt", receipt => {
                    setTransaction(receipt);
                    setShowTransaction(true);
                });
                sentTx.on("error", err => {
                    setError(err);
                    setShowError(true);
                });
            }).catch((err) => {
                setError(err);
                setShowError(true);
            })
        } catch (err) {
            setError(err);
            setShowError(true);
        }
    }

    return (
        <div>
            <h3>Announce new security advisory</h3>
            <br />
            <AcceptModal state={showWarning} dismiss={dismissWarning} announce={announce}></AcceptModal>
            <ErrorModal state={showError} dismiss={dismissError} error={error}></ErrorModal>
            <SuccessModal state={showTransaction} dismiss={dismissTransaction} tx={transaction}></SuccessModal>
            <Form>
                <Form.Group className='mb-3' controlId='newAccount'>
                    <Form.Select value={account} onChange={(e) => setAccount(e.target.value)}>
                        <option>0x12ac...</option>
                    </Form.Select>
                    <Form.Text className='text-muted'>Select account for transaction</Form.Text>
                </Form.Group>

                <Form.Group className='mb-3' controlId='newVulnVendorContract'>
                    <FloatingLabel className='mb-3' controlId='newVulnVenCon' label="Vendor smart contract address">
                        <Form.Control value={address} onChange={(e) => setAddress(e.target.value)}></Form.Control>
                        <Form.Text className='text-muted'>Address of smart contract used to initiate announcement from</Form.Text>
                    </FloatingLabel>
                </Form.Group>

                <Form.Group className='mb-3' controlId='newVulnProds'>
                    <FloatingLabel className='mb-3' controlId='newVulnProdLabel' label="Vulnerable product(s)">
                        <Form.Control as="textarea" rows={5} value={pids} onChange={(e) => setPids(e.target.value)}></Form.Control>
                        <Form.Text className='text-muted'>Use comma to separate identifiers</Form.Text>
                    </FloatingLabel>
                </Form.Group>

                <Form.Group className='mb-3' controlId='newVulnIPFS'>
                    <FloatingLabel className='mb-3' controlId='new' label="IPFS Content ID">
                        <Form.Control value={cid} onChange={(e) => setCid(e.target.value)}></Form.Control>
                        <Form.Text className='text-muted'></Form.Text>
                    </FloatingLabel>
                </Form.Group>

                <Form.Group className="mb-3" controlId="newVulnCheck">
                    <Form.Check type="checkbox" value={accept} onChange={(e) => setAccept(e.target.value)}
                        label="I accept to the consequences of creating a transaction!" />
                </Form.Group>
                <Button variant="primary" type="button" onClick={() => setShowWarning(true)}>
                    Announce
                </Button>
            </Form>
        </div>
    )
}
export default NewAdvisoryForm;