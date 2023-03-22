import Form from 'react-bootstrap/Form';

function FilterSwtich({filter}) {
    return (
        <>
            <Form>
                <Form.Check type='switch' id="filterswitch" label="Enable filtering" defaultChecked="true" onChange={(e) => filter(e.target.checked)}></Form.Check>
            </Form> 
        </>
    )
}
export default FilterSwtich;