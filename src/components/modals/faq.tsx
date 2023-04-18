import { Modal, ModalBody, ModalTitle } from "react-bootstrap";

const FAQModal = ({ show, onHide }: { show: boolean; onHide: () => void }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <ModalTitle>Frequently Asked Questions</ModalTitle>
      </Modal.Header>
      <ModalBody>
        <p>
          Is FutureDesk.io free? FutureDesk.io is free to use with basic
          features. However, users need a working OpenAI API Key, which can be
          obtained by signing up directly with OpenAI.
        </p>
        <p>
          What are the premium features? Premium features include access to Chat
          Search History, Prompt Library, Integrations, etc. Please refer to the
          Pricing page for more details.
        </p>
        <p>How many chats can I have? FutureDesk.io allows unlimited chats.</p>
        <p>
          Can I get my money back? FutureDesk.io offers a 14-day money-back
          guarantee. Contact FutureDesk within 14 days if unsatisfied with the
          product for a full refund.
        </p>
        <p>
          How is my OpenAI API Key stored securely? FutureDesk.io encrypts
          OpenAI API Keys before storing them in a secure database. Strict
          access controls are in place to limit the number of personnel who can
          access the stored API keys. Regular security audits and strong data
          handling policies are also implemented.
        </p>
        <p>
          Does FutureDesk store prompts and responses? Yes, FutureDesk stores
          prompts and responses on a per-user basis. Stored data is not used for
          any purposes other than providing value to the user through the Prompt
          Library and Chat Search History. Users have full control over what
          content is shared and can manage accessibility at any time.
        </p>
        <p>
          Can I use ChatGPT API through FutureDesk without ChatGPT Plus
          subscription? Yes, ChatGPT API can be used through FutureDesk.io with
          an OpenAI API Key. A ChatGPT Plus subscription is not required.
        </p>
        <p>
          What are the differences between ChatGPT Plus and ChatGPT API through
          FutureDesk? Both have the same model and quality. However, initial
          settings in the OpenAI app may differ from FutureDesk&apos;s. Users
          can customize the output by clicking &apos;Re-generate Response&apos;
          or adjusting the prompt.
        </p>
        <p>
          Is FutureDesk.io faster than ChatGPT? FutureDesk.io is generally
          faster than ChatGPT for longer responses, but speed depends on the
          user&apos;s internet connection and API availability.
        </p>
        <p>
          Does FutureDesk store prompts and responses, and how is this data
          used? Yes, FutureDesk stores prompts and responses on a per-user
          basis. This data is primarily used to provide users with a curated
          library of pre-existing content to streamline the development of new
          chat prompts or to reference previous interactions. The stored data is
          not used for any other purposes, and users have full control over what
          content is shared and can manage accessibility at any time.
        </p>
      </ModalBody>
    </Modal>
  );
};

export default FAQModal;
