import { Modal, ModalBody, ModalTitle } from "react-bootstrap";

const AboutModal = ({
  show,
  onHide,
}: {
  show: boolean;
  onHide: () => void;
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <ModalTitle>Welcome to Future Desk!</ModalTitle>
      </Modal.Header>
      <ModalBody>
        <p>
          We are an advanced chatbot interface that is designed to provide a
          more efficient and user-friendly experience with ChatGPT. Our platform
          offers a wide range of features such as faster response, chat history
          search, document uploads, drag & drop folders, voice input and output,
          word counter, and the ability to edit, copy and delete any chat or
          message.
        </p>
        <p>
          Our team is constantly working to improve our platform and make it
          more user-friendly. We have also developed a list of AI experts to
          assist you and a prompt library that includes a wide range of
          pre-built conversation starters that you can use to get your
          conversations started quickly and easily.
        </p>
        <p>
          Think of FutureDesk as your personal ChatGPT workplace that lets you
          organize your conversations and work more efficiently. With our
          convenient features and user-friendly interface, you can save time and
          get more done in less time.
        </p>
        <p>
          To use FutureDesk, all you need is a working OpenAI API Key. When you
          use the API Key, you pay directly to OpenAI for the amount of
          credits/tokens you use. With FutureDesk, you don’t need ChatGPT pro
          and there are no monthly fees. Our platform is designed to be easy to
          use and affordable for everyone.
        </p>
        <p>
          Our platform is also the ultimate solution for team collaboration and
          management, allowing you to customize workspaces for your team and the
          tools that fit their projects.
        </p>
        <p>
          Thank you for considering FutureDesk as your go-to chatbot interface.
          We look forward to helping you improve your conversations and work
          more efficiently.
        </p>
      </ModalBody>
    </Modal>
  );
};

export default AboutModal;
