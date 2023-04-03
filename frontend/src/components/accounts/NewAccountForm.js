import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import FormGroup from 'react-bootstrap/esm/FormGroup';
import { useState } from 'react';

function NewAccountForm({accounts, saveAccounts}) {
    const [accountName, setAccountName] = useState("");
    const [wallet, setWallet] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    
    async function saveAccount() {
        let newAccount = {
            name: accountName, 
            wallet: wallet, 
            key: privateKey
        };
        accounts.push(newAccount);
        saveAccounts(accounts); // this will save to localstorage
        setAccountName("");
        setWallet("");
        setPrivateKey("");
    }

    return (
        <Form>
            <FormGroup className='mb-3' controlId='account1'>
                <FloatingLabel className='mb-3' controlId='account2' label="Account name">
                    <Form.Control value={accountName} onChange={(e) => setAccountName(e.target.value)}/>
                    <Form.Text className='text-muted'>Arbitrary name of the account</Form.Text>
                </FloatingLabel>
            </FormGroup>
            <FormGroup className='mb-3' controlId='account1'>
                <FloatingLabel className='mb-3' controlId='account2' label="Wallet address">
                    <Form.Control value={wallet} onChange={(e) => setWallet(e.target.value)}/>
                    <Form.Text className='text-muted'>Address of the wallet of the account</Form.Text>
                </FloatingLabel>
            </FormGroup>
            <FormGroup className='mb-3' controlId='account1'>
                <FloatingLabel className='mb-3' controlId='account2' label="Private key">
                    <Form.Control type='password' value={privateKey} onChange={(e) => setPrivateKey(e.target.value)}/>
                    <Form.Text className='text-muted'>Private key of the associated wallet. The private key cannot be changed!</Form.Text>
                </FloatingLabel>
            </FormGroup>
            <Button variant="primary" type="button" onClick={() => saveAccount()}>
                    Save account
                </Button>
        </Form>
    )
}
export default NewAccountForm;