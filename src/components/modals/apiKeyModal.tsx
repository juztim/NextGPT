import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";

const ApiKeyModal = () => {
  const { data } = useSession();

  const [newApiKey, setNewApiKey] = useState("");

  const { mutate: setApiKey } = api.openAi.setApiKey.useMutation({
    onSuccess: () => {
      toast.success("API Key set successfully");
      closeButtonRef.current?.click();
    },
    onError: () => {
      toast.error("Invalid API Key");
    },
  });

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setNewApiKey(data?.user?.apiKey ?? "");
  }, [data]);

  return (
    <div
      className="modal fade"
      id="apiKey"
      tabIndex={-1}
      aria-labelledby="apiKeyTitle"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title fs-5" id="apiKeyTitle">
              <span className="icon icon-key me-2"></span>
              Enter Your OpenAI API Key
            </h4>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              ref={closeButtonRef}
            />
          </div>
          <div className="modal-body">
            <p>
              You need an OpenAI API Key to use FutureDesk Your API Key is
              stored locally on your browser and never sent anywhere else.
            </p>

            <div className="mb-3">
              <label htmlFor="addApiKey" className="form-label">
                Title:
              </label>
              <input
                type="text"
                className="form-control"
                id="addApiKey"
                placeholder="sk-xxxxxxxxxxxxxxxxxxx"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
              />
            </div>

            <p>
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
                className="link"
              >
                Get your API key from Open AI dashboard
              </a>
            </p>

            <div className="row g-2 mb-4">
              <div className="col">
                <button
                  className="btn btn-primary btn-lg w-100"
                  onClick={() => {
                    setApiKey({ key: newApiKey });
                  }}
                >
                  Save
                </button>
              </div>
              <div className="col">
                <button className="btn btn-outline-primary btn-lg w-100">
                  Cancel
                </button>
              </div>
            </div>

            <p>
              API Key not working?
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                className="link ms-2"
                rel="noreferrer"
              >
                Click here
              </a>
            </p>

            <p>
              The app will connect to OpenAI API server to check if your API Key
              is working properly
            </p>

            <h4 className="pt-4 pb-3">FAQs about API Key</h4>

            <div className="accordion accordion-flush mb-4" id="accordionFAQ">
              <div className="accordion-item">
                <h6 className="accordion-header" id="flush-headingOne">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#flush-collapseOne"
                    aria-expanded="false"
                    aria-controls="flush-collapseOne"
                  >
                    How is the API key handled?
                  </button>
                </h6>
                <div
                  id="flush-collapseOne"
                  className="accordion-collapse collapse"
                  aria-labelledby="flush-headingOne"
                  data-bs-parent="#accordionFAQ"
                >
                  <div className="accordion-body">Loren ipsum ...</div>
                </div>
              </div>
              <div className="accordion-item">
                <h6 className="accordion-header" id="flush-headingTwo">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#flush-collapseTwo"
                    aria-expanded="false"
                    aria-controls="flush-collapseTwo"
                  >
                    Do I need to have ChatGPT Plus ($20/month) to use
                    FeatureDesk?
                  </button>
                </h6>
                <div
                  id="flush-collapseTwo"
                  className="accordion-collapse collapse"
                  aria-labelledby="flush-headingTwo"
                  data-bs-parent="#accordionFAQ"
                >
                  <div className="accordion-body">Loren ipsum ...</div>
                </div>
              </div>
              <div className="accordion-item">
                <h6 className="accordion-header" id="flush-headingThree">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#flush-collapseThree"
                    aria-expanded="false"
                    aria-controls="flush-collapseThree"
                  >
                    Do I need to pay for OpenAI for a ChatGPT API Key?
                  </button>
                </h6>
                <div
                  id="flush-collapseThree"
                  className="accordion-collapse collapse"
                  aria-labelledby="flush-headingThree"
                  data-bs-parent="#accordionFAQ"
                >
                  <div className="accordion-body">Loren ipsum ...</div>
                </div>
              </div>
              <div className="accordion-item">
                <h6 className="accordion-header" id="flush-headingFour">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#flush-collapseFour"
                    aria-expanded="false"
                    aria-controls="flush-collapseFour"
                  >
                    License Key vs. API Key
                  </button>
                </h6>
                <div
                  id="flush-collapseFour"
                  className="accordion-collapse collapse"
                  aria-labelledby="flush-headingFour"
                  data-bs-parent="#accordionFAQ"
                >
                  <div className="accordion-body">Loren ipsum ...</div>
                </div>
              </div>
            </div>

            {/*<a
              href="https://www.typingmind.com/faqs"
              target="_blank"
              className="link"
            >
              See more FAQs
            </a>*/}
          </div>
          <div className="modal-footer "></div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
