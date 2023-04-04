import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/Col';

import { useRef, useState } from 'react';

import { PRIVATE_CONTRACT_ABI } from '../../config';
import Web3 from 'web3';

import AcceptModal from '../announcement/AcceptModal';
import ErrorModal from '../announcement/ErrorModal';
import SuccessModal from '../announcement/SuccessModal';


function VendorManagementForm({accounts}) {
    const selectedAccount = useRef();
    const [address, setAddress] = useState("");
    const [vendorAddress, setVendorAddress] = useState("");
    const [accept, setAccept] = useState(false);
    const [transaction, setTransaction] = useState("");
    const [error, setError] = useState("");

    const [showWarningAdd, setShowWarningAdd] = useState(false);
    const dismissWarningAdd = () => setShowWarningAdd(false);

    const [showWarningRemove, setShowWarningRemove] = useState(false);
    const dismissWarningRemove = () => setShowWarningRemove(false);

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

    /**
     * Creates a transaction calling a method on the 'Private' smart contract.
     * @param {String} method The method to call encoded as ABI bytecode.
     */
    const contractTransaction = (method) => {
        let config = {
            from: selectedAccount.current.wallet,
            to: address,
            gas: 6721975,   
            data: method
        }

        web3.eth.accounts.signTransaction(config, selectedAccount.current.key)
        .then((signedTx) => {
            const sentTx = web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
            sentTx.on("receipt", receipt => {
                setTransaction(receipt);
                setShowTransaction(true);
            });
            sentTx.on("error", err => {
                setError(err);
                setShowError(true);
            });
        });
    }

    /**
     * Tries to remove an Ethereum wallet address to the whitelist of the 'Private' smart contract.
     */
    const removeVendor = () => {
        if (!accept) {
            return;
        };
        dismissWarningRemove();

        try {
            contractTransaction(
                contract.methods.removeVendor(vendorAddress).encodeABI()
            );
        } catch (err) {
            setError(err);
            setShowError(true);
        }
    }

    /**
     * Tries to add an Ethereum wallet address to the whitelist of the 'Private' smart contract.
     */
    const AddVendor = () => {
        if (!accept) {
            return;
        };
        dismissWarningAdd();

        try {  
            contractTransaction(
                contract.methods.addVendor(vendorAddress).encodeABI()
            );
        } catch (err) {
            setError(err);
            setShowError(true);
        }
    }

    return (
        <div>
            <h3>Manage Vendor Whitelist</h3>
            <br />
            <AcceptModal state={showWarningAdd} dismiss={dismissWarningAdd} announce={AddVendor}></AcceptModal>
            <AcceptModal state={showWarningRemove} dismiss={dismissWarningRemove} announce={removeVendor}></AcceptModal>
            <ErrorModal state={showError} dismiss={dismissError} error={error}></ErrorModal>
            <SuccessModal state={showTransaction} dismiss={dismissTransaction} tx={transaction}></SuccessModal>
            <Form>
                <Form.Group className='mb-3' controlId='manageVendorAccount'>
                    <Form.Select onChange={(e) => selectAccount(e.currentTarget.value)}>
                        <option>Select an account</option>
                        {accounts.map((account, index) => 
                            <option key={index} value={JSON.stringify(account)}>{account.name}</option>
                        )}
                    </Form.Select>
                    <Form.Text className='text-muted'>Select account for the transaction</Form.Text>
                </Form.Group>

                <Form.Group className='mb-3' controlId='manageVendorPrivateContract'>
                    <FloatingLabel className='mb-3' controlId='manageVendorPrivateContractLabel' label="Smart contract address">
                        <Form.Control value={address} onChange={(e) => setAddress(e.target.value)}></Form.Control>
                        <Form.Text className='text-muted'>Address of confidential smart contract</Form.Text>
                    </FloatingLabel>
                </Form.Group>

                <Form.Group className='mb-3' controlId='manageVendorAddress'>
                    <FloatingLabel className='mb-3' controlId='manageVendorAddressLabel' label="Vendor Address">
                        <Form.Control value={vendorAddress} onChange={(e) => setVendorAddress(e.target.value)}></Form.Control>
                        <Form.Text className='text-muted'>The address of the vendor to add/remove from the whitelist</Form.Text>
                    </FloatingLabel>
                </Form.Group>

                <Form.Group className="mb-3" controlId="manageVendorCheck">
                    <Form.Check type="checkbox" value={accept} onChange={(e) => setAccept(e.target.value)}
                        label="I accept the consequences of creating a transaction!" />
                </Form.Group>
                    <Row>
                        <Col lg="2">
                            <Button variant="primary" type="button" onClick={() => setShowWarningAdd(true)}>  {/* TODO: Disable if values form is not filled correctly*/}
                                Add
                            </Button>
                        </Col>
                        <Col lg="2">
                            <Button variant="danger" type="button" onClick={() => setShowWarningRemove(true)}>
                                Remove
                            </Button>
                        </Col>
                    </Row>
            </Form>
        </div>
    )
}
export default VendorManagementForm;