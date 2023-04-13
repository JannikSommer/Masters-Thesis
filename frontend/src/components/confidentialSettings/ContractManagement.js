import Alert from 'react-bootstrap/Alert';

import ContractList from './ContractList';
import NewContractForm from './NewContractForm';

function ContractManagement({ contracts, addContract, removeContract }) {

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
            <h2>Your contracts</h2>
            Your confidential contracts setup for use in SENTINEL are listed below. 
            <ContractList contracts={contracts} remove={removeContract}/>
            <br />
            <h2>Setup new contract</h2>
            Input the data here to setup new contracts.
            <NewContractForm addContract={addContract}/>
        </>
    );
}
export default ContractManagement;