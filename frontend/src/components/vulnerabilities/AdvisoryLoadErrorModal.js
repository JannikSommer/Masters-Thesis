import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function AdvisoryLoadErrorModal({show, dismiss}) {
    return (
        <Modal size='lg' show={show} onHide={() => dismiss()}>
            <Modal.Header closeButton><Modal.Title>An error occurred!</Modal.Title></Modal.Header>
            <Modal.Body>
                <p> An error occurred trying to read the selected security advisory, probably due to a encryption key mismatch or a hash mismatch. 
                    Update the public key on your contract and have your vendor re-announce the advisory. </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => dismiss()}>
                    Dismiss
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
export default AdvisoryLoadErrorModal;