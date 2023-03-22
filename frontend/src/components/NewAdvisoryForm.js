import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

function NewAdvisoryForm() {

    return (
    <div>
        <h3>Announce new security advisory</h3>
        <br />
        <Form>
            <Form.Group className='mb-3' controlId='newAccount'>
                <Form.Select>
                    <option>0x12ac...</option>
                </Form.Select>
                <Form.Text className='text-muted'>Select account for transaction</Form.Text>
            </Form.Group>

            <Form.Group className='mb-3' controlId='newVulnProds'>
            <FloatingLabel className='mb-3' controlId='newVulnProdsLabel' label="Vulnerable product(s)">
                    <Form.Control as="textarea" rows={2} ></Form.Control>
                    <Form.Text className='text-muted'>Use comma to separate identifiers</Form.Text>
                </FloatingLabel>
            </Form.Group>
            
            <Form.Group className='mb-3' controlId='newVulnIPFS'>
                <FloatingLabel className='mb-3' controlId='upVulnIpfsLabel' label="IPFS Content ID">
                    <Form.Control></Form.Control>
                    <Form.Text className='text-muted'></Form.Text>
                </FloatingLabel>
            </Form.Group>

            <Form.Group className="mb-3" controlId="newVulnCheck">
                <Form.Check type="checkbox" label="Agree to the consquences" />
            </Form.Group>
            <Button variant="primary" type="submit">
                Announce
            </Button>
        </Form>
    </div>
    )
}
export default NewAdvisoryForm;