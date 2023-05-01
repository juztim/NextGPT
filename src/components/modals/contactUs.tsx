import { useModalStore } from "~/stores/modalStore";
import { Form, FormControl, Modal } from "react-bootstrap";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { useState } from "react";

const ContactUsModal = () => {
  const modalStore = useModalStore();

  const [formData, setFormData] = useState({
    type: "General",
    email: "",
    message: "",
  });

  const { mutate, isLoading } = api.feedback.submitFeedback.useMutation({
    onSuccess: () => {
      toast.success("Feedback submitted successfully!");
      modalStore.setActiveModal(undefined);
      setFormData({
        type: "",
        email: "",
        message: "",
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error submitting feedback!");
      toast.error(error.message);
    },
  });

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
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            if (isLoading) return;
            mutate({
              email: formData.email,
              type: formData.type,
              feedback: formData.message,
            });
          }}
        >
          <Form.Group className="mb-3" controlId="formSubject">
            <Form.Label>Topic</Form.Label>
            <Form.Select
              onChange={(e) => {
                setFormData({
                  ...formData,
                  type: e.target.value,
                });
              }}
              required
              value={formData.type}
            >
              <option>General</option>
              <option>Idea</option>
              <option>Bug</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email address</Form.Label>
            <FormControl
              required
              type="email"
              placeholder="Enter email"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  email: e.target.value,
                });
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formMessage">
            <Form.Label>Message</Form.Label>
            <FormControl
              required
              minLength={20}
              as="textarea"
              placeholder="Enter message"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  message: e.target.value,
                });
              }}
            />
          </Form.Group>
          <button className="btn btn-primary btn-lg w-100" disabled={isLoading}>
            Send
          </button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ContactUsModal;
