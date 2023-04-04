import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function SuccessModal({state, dismiss, tx}) {
    return (
        <Modal size='lg' show={state} onHide={() => dismiss()}>
            <Modal.Header closeButton><Modal.Title>Transaction created!</Modal.Title></Modal.Header>
            <Modal.Body>
            <div><pre>{JSON.stringify(tx, null, 2)}</pre></div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => dismiss()}>
                    Dismiss
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
export default SuccessModal;