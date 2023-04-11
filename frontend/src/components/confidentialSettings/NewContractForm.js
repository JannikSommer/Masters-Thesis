import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import FormGroup from 'react-bootstrap/esm/FormGroup';

import { useState } from 'react';

function NewContractForm({ addContract}) {
    const [contractAddress, setContractAddress] = useState("");
    const [contractName, setContractName] = useState("");
    
    async function saveContract() {
        addContract(
            contractAddress,
            contractName
        );
        setContractAddress("");
        setContractName("");
    }

    return (
        <Form>
            <FormGroup className='mb-3' controlId='contractAddress'>
                <FloatingLabel className='mb-3' controlId='contractAddressLabel' label="Contract Address">
                    <Form.Control value={contractAddress} onChange={(e) => setContractAddress(e.target.value)}/>
                    <Form.Text className='text-muted'>The Ethereum address of the contract</Form.Text>
                </FloatingLabel>
            </FormGroup>
            <FormGroup className='mb-3' controlId='contractName'>
                <FloatingLabel className='mb-3' controlId='contractNameLabel' label="Contract Name (optional)">
                    <Form.Control value={contractName} onChange={(e) => setContractName(e.target.value)}/>
                    <Form.Text className='text-muted'>A name of value to identify the contract</Form.Text>
                </FloatingLabel>
            </FormGroup>
            <Button variant="primary" type="button" onClick={() => saveContract()}>
                    Save account
                </Button>
        </Form>
    )
}
export default NewContractForm;