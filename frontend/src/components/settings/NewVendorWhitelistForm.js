import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { useState } from 'react';

import { VENDOR_CONTRACT_ABI } from '../../config';
import Web3Gateway from '../../models/web3/web3Gateway';

function NewVendorWhitelistForm({whitelist, saveWhitelist}) {
    const [address, setAddress] = useState("");

    async function saveVendor() {
        let web3 = new Web3Gateway().web3;
        let contract = new web3.eth.Contract(VENDOR_CONTRACT_ABI, address);
        let newVendor = {
            name: await contract.methods.vendorName().call(),
            address: address
        };
        whitelist.push(newVendor); 
        saveWhitelist(whitelist); 
        setAddress("");
    }

    return (
        <Form>
            <Form.Group className='mb-3' controlId='addressForm'>
                <FloatingLabel className='mb-3' controlId='newVendorWhitelist' label="Vendor smart contract address">
                    <Form.Control value={address} onChange={(e) => setAddress(e.target.value)}></Form.Control>
                    <Form.Text className='text-muted'>Vendor smart contract address</Form.Text>
                </FloatingLabel>
            </Form.Group>
            <Button variant='primary' onClick={saveVendor}>Add vendor</Button>
        </Form>
    )
}
export default NewVendorWhitelistForm;