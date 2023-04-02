import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

import { useRef, useState } from 'react';

import { PRIVATE_CONTRACT_ABI } from '../../config';
import Web3 from 'web3';
import AES from '../../models/AES';
import RSA from '../../models/RSA';

import AcceptModal from '../announcement/AcceptModal';
import ErrorModal from '../announcement/ErrorModal';
import SuccessModal from '../announcement/SuccessModal';

function ConfidentialAdvisoryForm({accounts, ipfs }) {
    const selectedAccount = useRef();
    const [address, setAddress] = useState("");
    const [file, setFile] = useState("");
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

    /**
     * Retrieves the RSA-OAEP public key from a 'Private' smart contract.
     * @returns {Promise<String>} A Base64 encoded string representing a RSA-OAEP public key.
     */
    const getPublicKey = async () => {
        const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
        const contract = new web3.eth.Contract(PRIVATE_CONTRACT_ABI, address);
        const result = await contract.methods.publicKey().call({from: selectedAccount.current.wallet});
        const pKey = web3.utils.hexToUtf8(result);
        return pKey;
    };

    /**
     * Exports and encrypts an AES CryptoKey.
     * @param {CryptoKey} key An AES CryptoKey.
     * @returns {Promise<ArrayBuffer>} An exported and encrypted AES cryptokey.
     */
    const wrapKey = async (key) => {
        const rsa = new RSA();
        return getPublicKey().then(async (stringPKey) => {
            const rawPKey = rsa.base64ToArrayBuffer(stringPKey);
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
        const rsa = new RSA();
        const fileBuffer = rsa.stringToArrayBuffer(file);
        return window.crypto.subtle.digest("SHA-256", fileBuffer);
    }

    const uploadFile = async (data) => {
        const { cid } = await ipfs.add(data);
        return cid.toString();
    }

    const announce = async () => {
        if (!accept) {
            return;
        };
        dismissWarning();
        try {
            const rsa = new RSA();
            // Compute hash of file
            const fileHash = await computeHash();

            // Generate AES-128 key, encode and encrypt data
            const aes = new AES();
            const aesKey = await aes.generateKey();
            const { ciphertext, iv } = await aes.encrypt(file, aesKey);

            // Export and wrap key
            const wrappedKey = await wrapKey(aesKey);

            // Upload file to IPFS
            let fileLocation = await uploadFile(ciphertext);

            //Announce with IV and key         
            var web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
            const contract = new web3.eth.Contract(PRIVATE_CONTRACT_ABI, address);
            web3.eth.accounts.signTransaction({
                from: selectedAccount.current.wallet,
                to: address,
                gas: 6721975,   
                data: contract.methods.announce(
                    fileLocation,
                    web3.utils.bytesToHex(new Uint8Array(fileHash)),
                    web3.utils.bytesToHex(new Uint8Array(wrappedKey)),
                    web3.utils.bytesToHex(iv)
                ).encodeABI()
            }, selectedAccount.current.key).then((signedTx) => {
                const sentTx = web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
                sentTx.on("receipt", receipt => {
                    setTransaction(receipt);
                    setShowTransaction(true);
                });
                sentTx.on("error", err => {
                    console.log(err);

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