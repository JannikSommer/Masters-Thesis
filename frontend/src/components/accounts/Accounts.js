import { useContext, useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import NewAccountForm from './NewAccountForm';
import AccountList from './AccountList';


import { PasswordContext } from '../../contexts/PasswordContext';
import { Accounts as AccountsLS } from '../../localStorage/Accounts';

function Accounts() {
    const [accounts, setAccounts] = useState([]);
    const aesKey = useContext(PasswordContext);

    const saveAccounts = async (newState)  =>{ 
        const newAcc = [...newState];
        setAccounts(newAcc);
        await AccountsLS.Save(newAcc, aesKey);
    }

    const deleteAccount = async (index) => {
        let newAcc = [...accounts];
        newAcc.splice(index, 1);
        setAccounts(newAcc);
        await AccountsLS.Save(newAcc, aesKey);
    };

    const loadAccounts = async () => { 
        const acc = await AccountsLS.load(aesKey);
        if (acc !== null) setAccounts(acc);
    };

    useEffect(() => {
        if(aesKey !== null) loadAccounts(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aesKey]);

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