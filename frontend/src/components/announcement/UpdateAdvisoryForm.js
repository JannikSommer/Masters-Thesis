import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

import AcceptModal from './AcceptModal';
import ErrorModal from './ErrorModal';
import SuccessModal from './SuccessModal';

import { SUPPORTED_STORAGE_PUBLIC } from '../../storage/config';
import { useRef, useState } from 'react';
import { uploadToIpfs } from '../../storage/IpfsUpload';
import Web3Gateway from '../../models/web3/web3Gateway';

function UpdateAdvisoryForm({ accounts, ipfs }) {
    const selectedAccount = useRef();
    const productIds = useRef([]);
    const [address, setAddress] = useState("");
    const [file, setFile] = useState("");
    const [advisoryId, setAdvisoryId] = useState("");
    const [vulnerabilityIds, setVulnerabilityIds] = useState("");
    const [storageSystem, setStorageSystem] = useState("");
    const [accept, setAccept] = useState(false);
    const [transaction, setTransaction] = useState("");
    const [error, setError] = useState("");

    const [showWarning, setShowWarning] = useState(false);
    const dismissWarning = () => setShowWarning(false);

    const [showTransaction, setShowTransaction] = useState(false);
    const dismissTransaction = () => setShowTransaction(false);

    const [showError, setShowError] = useState(false);
    const dismissError = () => setShowError(false);

    const selectAccount = (value) => {
        if (value === "Select an account") {
            selectedAccount.current= {name: "", wallet: "", key: ""};
            return; 
        }
        selectedAccount.current = JSON.parse(value);
    }

    const handleFileChosen = (chosenFile) => {
        const fileReader = new FileReader();
        fileReader.readAsText(chosenFile);
        fileReader.onloadend = () => {setFile(fileReader.result);};
    }
    
    const parseCSAF = async () => {
        productIds.current = []; // reset before parsing
        let csaf = await JSON.parse(file);
        for await (const branch of csaf.product_tree.branches) {
            await visitBranch(branch);
        }
        if (productIds.current.length === 0) {
            throw new Error("No product IDs found in CSAF file.");
        }
    }

    const visitBranch = async (branch) => {
        if (branch.hasOwnProperty("branches")) {
            for await (const subBranch of branch.branches) {
                await visitBranch(subBranch);
            }
        } else {
            if (branch.category === "product_version") {
                productIds.current.push(branch.product.product_id);
            }
        }
    }

    const announce = async () => {
        if (!accept) {
            return;
        };
        dismissWarning();
        try {
            let fileLocation;
            switch (storageSystem) {
                case "IPFS":
                    fileLocation = await uploadToIpfs(ipfs, file);
                    break; // continue with announcement
                case "Arweave":
                    throw new Error("Arweave not yet supported.");
                default:
                    throw new Error("No storage system selected.");
            }
            await parseCSAF();

            const web3 = new Web3Gateway();
            const result = await web3.announcePublicSecurityAdvisoryUpdate(
                {
                    address: selectedAccount.current.address,
                    key: selectedAccount.current.key,
                },
                {address: address},
                {
                    advisoryId: advisoryId,
                    vulnerabilityIds: vulnerabilityIds,
                    productIds: productIds.current.join(","),
                    fileLocation: storageSystem.toLowerCase().concat("/", fileLocation),
                }
            );
            setTransaction(result);
            setShowTransaction(true);
        } catch (err) {
            setError(err);
            setShowError(true);
        }
    }

    return (
    <div>
        <h3>Announce update to security advisory</h3>
        <br />
        <AcceptModal state={showWarning} dismiss={dismissWarning} announce={announce}></AcceptModal>
        <ErrorModal state={showError} dismiss={dismissError} error={error}></ErrorModal>
        <SuccessModal state={showTransaction} dismiss={dismissTransaction} tx={transaction}></SuccessModal>
        <Form>
            <Form.Group className='mb-3' controlId='upAccount'>
                <Form.Select onChange={(e) => selectAccount(e.currentTarget.value)}>
                    <option>Select an account</option>
                    {accounts.map((account, index) => 
                        <option key={index} value={JSON.stringify(account)}>{account.name}</option>
                    )}
                    </Form.Select>
                <Form.Text className='text-muted'>Select account for transaction</Form.Text>
            </Form.Group>

            <Form.Group className='mb-3' controlId='upVulnVendorContract'>
                <FloatingLabel className='mb-3' controlId='upVulnVenCon' label="Vendor smart contract address">
                    <Form.Control value={address} onChange={(e) => setAddress(e.target.value)}></Form.Control>
                    <Form.Text className='text-muted'>Address of smart contract used to initiate announcement from</Form.Text>
                </FloatingLabel>
            </Form.Group>
            
            <Form.Group className='mb-3' controlId='upVulnIPFS'>
                    <Form.Label>CSAF File</Form.Label>
                    <Form.Control className='mb-3' type='file' accept='.json' onChange={e => handleFileChosen(e.target.files[0])}/>
            </Form.Group>

            <Form.Group className='mb-3' controlId='newStorageSystem'>
                    <Form.Select onChange={(e) => setStorageSystem(e.currentTarget.value)}>
                        <option>Select an storage system</option>
                        {SUPPORTED_STORAGE_PUBLIC.map((system, index) => 
                            <option key={index} value={system}>{system}</option>
                        )}
                    </Form.Select>
                    <Form.Text className='text-muted'>Select storage system for CSAF</Form.Text>
                </Form.Group>

            <Form.Group className='mb-3' controlId='upAdvisoryId'>
                <FloatingLabel className='mb-3' controlId='upAdvisorySNTLLabel' label="SENTINEL advisory ID">
                    <Form.Control value={advisoryId} onChange={(e) => setAdvisoryId(e.target.value)}></Form.Control>
                    <Form.Text className='text-muted'>The ID is issued by the Identifier Issuer Service</Form.Text>
                </FloatingLabel>
            </Form.Group>

            <Form.Group className='mb-3' controlId='upVulid'>
                <FloatingLabel className='mb-3' controlId='upVulnSNTLLabel' label="SENTINEL vulnerability IDs">
                    <Form.Control value={vulnerabilityIds} onChange={(e) => setVulnerabilityIds(e.target.value)}></Form.Control>
                    <Form.Text className='text-muted'>The IDs are issued by the Identifier Issuer Service</Form.Text>
                </FloatingLabel>
            </Form.Group>

            <Form.Group className="mb-3" controlId="upVulnCheck">
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
export default UpdateAdvisoryForm;