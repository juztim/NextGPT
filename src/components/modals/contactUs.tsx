import { useModalStore } from "~/stores/modalStore";
import { Form, FormControl, Modal } from "react-bootstrap";

const ContactUsModal = () => {
  const modalStore = useModalStore();
  return (
    <Modal
      show={modalStore.activeModal === "Contact"}
      onHide={() => modalStore.setActiveModal(undefined)}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Contact Us</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formSubject">
            <Form.Label>Topic</Form.Label>
            <Form.Select>
              <option>General</option>
              <option>Idea</option>
              <option>Bug</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email address</Form.Label>
            <FormControl type="email" placeholder="Enter email" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formMessage">
            <Form.Label>Message</Form.Label>
            <FormControl as="textarea" placeholder="Enter message" />
          </Form.Group>
          <button
            className="btn btn-primary btn-lg w-100"
            onClick={() => {
              // We want to send the message to our email
            }}
          >
            Send
          </button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ContactUsModal;
