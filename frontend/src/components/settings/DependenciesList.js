import Table from 'react-bootstrap/Table'

function DependenciesList({dependencies}) {

    return (
        <Table striped bordered>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Identifier</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
                {dependencies.map((dependency, index) => 
                    <tr key={index}>
                        <td>{dependency.name}</td>
                        <td>{dependency.identifier}</td>
                        <td>{dependency.type}</td>
                    </tr>
                )}
            </tbody>
        </Table>
    )
}
export default DependenciesList;