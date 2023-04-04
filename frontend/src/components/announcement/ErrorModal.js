import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function ErrorModal({state, dismiss, error}) {
    return (
        <Modal size='lg' show={state} onHide={() => dismiss()}>
            <Modal.Header closeButton><Modal.Title>An error occurred!</Modal.Title></Modal.Header>
            <Modal.Body>
                <p>{error.toString()}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => dismiss()}>
                    Dismiss
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
export default ErrorModal;