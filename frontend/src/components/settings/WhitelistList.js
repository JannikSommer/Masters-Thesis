import Button from 'react-bootstrap/esm/Button';
import Table from 'react-bootstrap/Table'

function WhiteListList({whitelist, remove}) {
    return (
        <Table striped bordered>
            <thead>
                <tr>
                    <th>Vendor name</th>
                    <th>Vendor address</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {whitelist.map((vendor, index) => 
                    <tr key={index}>
                        <td>{vendor.name}</td>
                        <td>{vendor.address}</td>
                        <td><Button size='sm' variant='danger' onClick={() => remove(index)}>Delete</Button></td>
                    </tr>
                )}
            </tbody>
        </Table>
    )
}
export default WhiteListList;