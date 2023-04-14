import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

import { useRef, useState } from 'react';

import { PRIVATE_CONTRACT_ABI } from '../../config';
import { SUPPORTED_STORAGE_PRIVATE } from '../../storage/config';
import Web3 from 'web3';
import AES from '../../models/cryptography/AES';
import RSA from '../../models/cryptography/RSA';
import Utilities from '../../models/cryptography/Utilities';
import { web3Gateway } from '../../models/web3/web3Gateway';

import AcceptModal from '../announcement/AcceptModal';
import ErrorModal from '../announcement/ErrorModal';
import SuccessModal from '../announcement/SuccessModal';

function ConfidentialAdvisoryForm({accounts, ipfs}) {
    const selectedAccount = useRef();
    const [address, setAddress] = useState("");
    const [file, setFile] = useState("");
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

    const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
    const contract = new web3.eth.Contract(PRIVATE_CONTRACT_ABI, address);


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

    /**
     * Retrieves the RSA-OAEP public key from a 'Private' smart contract.
     * @returns {Promise<String>} A Base64 encoded string representing a RSA-OAEP public key.
     */
    const getPublicKey = async () => {
        const result = await contract.methods.publicKey().call({from: selectedAccount.current.wallet});
        const pKey = web3.utils.hexToBytes(result);
        return new Uint8Array(pKey);
    };

    /**
     * Exports and encrypts an AES CryptoKey.
     * @param {CryptoKey} key An AES CryptoKey.
     * @returns {Promise<ArrayBuffer>} An exported and encrypted AES cryptokey.
     */
    const wrapKey = async (key) => {
        const rsa = new RSA();
        return getPublicKey().then(async (rawPKey) => {
            const pKey = await rsa.importPublicKey(rawPKey);
            const wrappedKey =  await rsa.wrapKey(key, pKey);
            return wrappedKey;
        });
    }

    /**
     * Computes the SHA-256 hash of the file.
     * @returns {Promise<ArrayBuffer>} A promise of an ArrayBuffer.
     */
    const computeHash = async () => {
        const fileBuffer = Utilities.stringToArrayBuffer(file);
        return window.crypto.subtle.digest("SHA-256", fileBuffer);
    }

    const uploadFileIpfs = async (data) => {
        const { cid } = await ipfs.add(data);
        return cid.toString();
    }

    /**
     * Tries to encrypt, upload and announce a confidential security advisory to the 'Private' smart contract.
     */
    const announce = async () => {
        if (!accept) {
            return;
        };
        dismissWarning();
        try {
            const fileHash = await computeHash();

            const aes = new AES();
            const aesKey = await aes.generateKey();
            const { ciphertext, iv } = await aes.encrypt(file, aesKey);
            
            const wrappedKey = await wrapKey(aesKey);

            let fileLocation; 
            switch (storageSystem) {
                case "IPFS":
                    fileLocation = await uploadFileIpfs(ciphertext);
                    break;
                case "Arweave":
                    throw new Error("Arweave not supported yet.");
                case "Swarm":
                    throw new Error("Swarm not supported yet.");
                default:
                    throw new Error("No storage system selected.");
            }

            const result = await web3Gateway.announcePrivateSecurityAdvisory(
                {address: selectedAccount.current.wallet, key: selectedAccount.current.key},
                {address: address},
                {fileLocation: fileLocation, fileHash: fileHash, wrappedKey: wrappedKey, iv: iv}
            )
            setTransaction(result);
            setShowTransaction(true);
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
                <Form.Group className='mb-3' controlId='privateAccount'>
                    <Form.Select onChange={(e) => selectAccount(e.currentTarget.value)}>
                        <option>Select an account</option>
                        {accounts.map((account, index) => 
                            <option key={index} value={JSON.stringify(account)}>{account.name}</option>
                        )}
                    </Form.Select>
                    <Form.Text className='text-muted'>Select account for transaction</Form.Text>
                </Form.Group>

                <Form.Group className='mb-3' controlId='privateContract'>
                    <FloatingLabel className='mb-3' controlId='newVulnVenCon' label="Smart contract address">
                        <Form.Control value={address} onChange={(e) => setAddress(e.target.value)}></Form.Control>
                        <Form.Text className='text-muted'>Address of smart contract to announce to</Form.Text>
                    </FloatingLabel>
                </Form.Group>

                <Form.Group className='mb-3' controlId='privateCsafFile'>
                    <Form.Label>CSAF File</Form.Label>
                    <Form.Control className='mb-3' type='file' accept='.json' onChange={e => handleFileChosen(e.target.files[0])}/>
                </Form.Group>

                <Form.Group className='mb-3' controlId='privateStorageSystem'>
                    <Form.Select onChange={(e) => setStorageSystem(e.currentTarget.value)}>
                        <option>Select an storage system</option>
                        {SUPPORTED_STORAGE_PRIVATE.map((system, index) => 
                            <option key={index} value={system}>{system}</option>
                        )}
                    </Form.Select>
                    <Form.Text className='text-muted'>Select storage system for CSAF</Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="newVulnCheck">
                    <Form.Check type="checkbox" value={accept} onChange={(e) => setAccept(e.target.value)}
                        label="I accept to the consequences of creating a transaction!" />
                </Form.Group>
                <Button variant="primary" type="button" onClick={() => announce()}>
                    Announce
                </Button>
            </Form>
        </div>
    )
}
export default ConfidentialAdvisoryForm;