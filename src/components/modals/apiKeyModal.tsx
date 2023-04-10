import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";

const ApiKeyModal = ({
  show,
  setShow,
}: {
  show: boolean;
  setShow: (show: boolean) => void;
}) => {
  const { data } = useSession();

  const [newApiKey, setNewApiKey] = useState("");

  const { mutate: setApiKey } = api.openAi.setApiKey.useMutation({
    onSuccess: () => {
      setShow(false);
      toast.success("API Key set successfully");
    },
    onError: () => {
      toast.error("Invalid API Key");
    },
  });

  useEffect(() => {
    setNewApiKey(data?.user?.apiKey ?? "");
  }, [data]);

  return (
    <Modal show={show} onHide={() => setShow(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Enter your OpenAI API Key</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            setApiKey({
              key: newApiKey,
            });
          }}
        >
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control
              type="text"
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              onChange={(e) => {
                setNewApiKey(e.target.value);
              }}
              value={newApiKey}
            />
            <Form.Text className="text-muted">
              You can get your API Key from{" "}
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
              >
                OpenAI
              </a>
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() =>
            setApiKey({
              key: newApiKey,
            })
          }
        >
          Save
        </Button>
        <Button variant="secondary" onClick={() => setShow(false)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ApiKeyModal;
