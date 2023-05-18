import Button from 'react-bootstrap/esm/Button';
import Table from 'react-bootstrap/Table'

function ContractList({contracts, remove}) {
    return (
        <Table striped bordered>
            <thead>
                <tr>
                    <th>Vendor name</th>
                    <th>Contract address</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {contracts.map((contract, index) => 
                    <tr key={index}>
                        <td>{contract["vendorName"]}</td>
                        <td>{contract["address"]}</td>
                        <td><Button size='sm' variant='danger' onClick={() => remove(contract["address"])}>Delete contract</Button></td>
                    </tr>
                )}
            </tbody>
        </Table>
    )
}
export default ContractList;