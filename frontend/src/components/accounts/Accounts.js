import { useEffect, useRef, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import NewAccountForm from './NewAccountForm';
import AccountList from './AccountList';

import { LS_KEY_ACC } from '../../config';

function Accounts() {
    let isLoaded = useRef(false);
    const [accounts, setAccounts] = useState([]);

    async function saveAccounts(newState) { 
        setAccounts([...newState]);
        localStorage.setItem(LS_KEY_ACC, JSON.stringify(accounts))
    }

    async function deleteAccount(index) {
        accounts.splice(index, 1);
        saveAccounts(accounts);
    };

    async function loadAccounts() {
        let acc = localStorage.getItem(LS_KEY_ACC); 
        if (acc !== null) 
            setAccounts(JSON.parse(acc));
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