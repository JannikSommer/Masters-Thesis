import { useContext, useEffect, useRef, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import NewAccountForm from './NewAccountForm';
import AccountList from './AccountList';
import Utilities from '../../models/cryptography/Utilities';


import { LS_KEY_ACC, LS_KEY_PWD } from '../../config';
import { PasswordContext } from '../../contexts/PasswordContext';

function Accounts() {
    let isLoaded = useRef(false);
    const [accounts, setAccounts] = useState([]);
    const aesKey = useContext(PasswordContext);
    const aesParams = {
        name: "AES-GCM",
        length: 256,
        iv: Utilities.base64ToArrayBuffer(JSON.parse(localStorage.getItem(LS_KEY_PWD)).iv),
    }

    async function encryptAccounts(data) {
        const dataEncoded = new TextEncoder().encode(data);
        return window.crypto.subtle.encrypt(
            aesParams,
            aesKey,
            dataEncoded
        );
    }

    async function saveAccounts(newState) { 
        setAccounts([...newState]);
        const encAccounts = await encryptAccounts(JSON.stringify(accounts));
        localStorage.setItem(LS_KEY_ACC, Utilities.arrayBufferToBase64(encAccounts))
    }

    async function deleteAccount(index) {
        accounts.splice(index, 1);
        saveAccounts(accounts);
    };

    async function decryptAccounts(data) {
        const dataDecrypted = await window.crypto.subtle.decrypt(
            aesParams, 
            aesKey,
            data
        );
        return new TextDecoder().decode(dataDecrypted);
    }

    async function loadAccounts() { 
        let acc = localStorage.getItem(LS_KEY_ACC); 
        if (acc !== null) {
            const decAccounts = await decryptAccounts(Utilities.base64ToArrayBuffer(acc));
            setAccounts(JSON.parse(decAccounts));
        }
    };

    useEffect(() => {
        if (!isLoaded.current) {
            loadAccounts();
            isLoaded.current = true;
        }
    });

    return (
        <>
            <Alert variant="warning">
                <Alert.Heading>Information is stored locally</Alert.Heading>
                <p>Information provided here will be stored with browser localstorage which may be a security concern for your setup.</p>
            </Alert>
            <h1>Accounts</h1>
            See your accounts and setup new accounts a here to make announcements.
            <br />
            <hr />
            <h2>Your accounts</h2>
            Your accounts setup for use in SENTINEL are listed below. 
            <AccountList accounts={accounts} remove={deleteAccount}/>
            <br />
            <h2>Setup new account</h2>
            Input the data here to setup new accounts.
            <NewAccountForm accounts={accounts} saveAccounts={saveAccounts}/>
        </>
    );
}
export default Accounts;