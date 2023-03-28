// bootstrap
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function RefreshConfirmation({ipfs, state, close, loadEvents}) {

    return (
        <Modal show={state} onHide={close}>
        <Modal.Header closeButton>
          <Modal.Title>Careful!</Modal.Title>
        </Modal.Header>
        <Modal.Body>Refreshing the page will search through all blocks in the network, which can take a while. Are you sure you want to continue?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close}>
            No, go back
          </Button>
          <Button variant="danger" onClick={() => loadEvents(ipfs)}>
            Yes, refresh vulnerabilities
          </Button>
        </Modal.Footer>
      </Modal>
    );
}
export default RefreshConfirmation;