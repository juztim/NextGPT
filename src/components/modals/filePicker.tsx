import { useModalStore } from "~/stores/modalStore";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";
import React, { useRef, useState } from "react";
import mime from "mime-types";
import { toast } from "react-hot-toast";

interface FilePickerModalProps {
  message: string;
  setMessage: (message: string) => void;
}


const FilePickerModal = ({ message, setMessage }: FilePickerModalProps) => {
  const modalStore = useModalStore();
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [content, setContent] = useState("")

  function onDismiss() {
    setContent("")
    modalStore.setActiveModal(undefined);
  }

  function onApply() {
    if (message.trim() === "") {
      setMessage(content);
    } else {
      setMessage(`${message}\n\n${content}`);
    }
    toast.success("Cheers! Your file has been successfully uploaded and its text has been applied to the chat box. Let's keep the conversation going!")
    onDismiss()
  }

  const handleFileChange = () => {
    const selectedFile = (fileInputRef.current?.files?.[0] || null);
    if (!!selectedFile) {
      const fileType: string | false = mime.lookup(selectedFile.name) as string

      // const fileExtension: string | undefined = selectedFile?.name.split(".").pop()
      // likely will be needed for different file type support such as docx/pdf ^

      if (fileType && fileType.startsWith("text/")) {
        const reader = new FileReader()
        reader.readAsText(selectedFile)
        reader.onload = () => {
          const result = reader.result as string;
          setContent(result);
        }
      } else {
        toast.error("Oops! Looks like the file format you uploaded is not supported. Please try uploading a different file format so we can continue the conversation. Cheers!")
      }
    }
  };

  return (
    <Modal
      show={modalStore.activeModal === "pickFile"}
      onHide={onDismiss}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Upload a file</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Control type="file" style={{padding: '0.375rem 0.75rem'}} onChange={handleFileChange} ref={fileInputRef} />
          </Form.Group>
        </Form>
        {
          content && (
            <FloatingLabel
              label="Preview"
              className="mb-3"
            >
              <Form.Control
                as="textarea"
                disabled={true}
                value={content}
                onChange={(newContent) => {setContent(newContent.target.value)}}
                style={{height: '100px'}} />
            </FloatingLabel>
          )
        }
        <div style={{display: "flex", justifyContent: "space-between"}}>
          <Button className="btn btn-outline-primary" onClick={onDismiss}>Cancel</Button>
          <Button onClick={onApply}>Add to message</Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default FilePickerModal;