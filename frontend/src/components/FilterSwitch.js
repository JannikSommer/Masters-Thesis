import Form from 'react-bootstrap/Form';

function FilterSwtich({setFiltering}) {
    return (
        <div className="d-flex align-items-center justify-content-center">
            <Form>
                <Form.Check type='switch' 
                            id="filterswitch" 
                            label="Enable filtering"
                            defaultChecked="true" 
                            onChange={(e) => setFiltering(e.target.checked)}>
                </Form.Check>
            </Form>
        </div>
    )
}
export default FilterSwtich;