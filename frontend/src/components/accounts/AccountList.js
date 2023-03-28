import Button from 'react-bootstrap/esm/Button';
import Table from 'react-bootstrap/Table'

function AccountList({accounts, remove}) {

    return (
        <Table striped bordered>
            <thead>
                <tr>
                    <th>Account name</th>
                    <th>Wallet address</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {accounts.map((account, index) => 
                    <tr key={index}>
                        <td>{account.name}</td>
                        <td>{account.wallet}</td>
                        <td><Button size='sm' variant='danger' onClick={() => remove(index)}>Delete account</Button></td>
                    </tr>
                )}
            </tbody>
        </Table>
    )
}
export default AccountList;