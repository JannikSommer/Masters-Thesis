import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function AcceptModal({state, dismiss, announce}) {

    return (
        <Modal show={state} onHide={() => dismiss()}>
            <Modal.Header closeButton><Modal.Title>Careful!</Modal.Title></Modal.Header>
            <Modal.Body>
                Creating transactions will cost you gas on the selected account and 
                actions are NOT reversible. Make sure that the information provided is correct!
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={() => dismiss()}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={() => announce()}>
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
export default AcceptModal;