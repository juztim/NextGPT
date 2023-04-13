import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";

const ApiKeyModal = () => {
  const { data } = useSession();

  const [newApiKey, setNewApiKey] = useState("");

  const reloadSession = () => {
    const event = new Event("visibilitychange");
    document.dispatchEvent(event);
  };

  const { mutate: setApiKey } = api.openAi.setApiKey.useMutation({
    onSuccess: () => {
      toast.success("API Key set successfully");
      reloadSession();
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
            <p>You need an OpenAI API Key to use FutureDesk.</p>

            <div className="mb-3">
              <label htmlFor="addApiKey" className="form-label">
                API Key
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

            {/*<h4 className="pt-4 pb-3">FAQs about API Key</h4>*/}

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
                    API Key not working?
                  </button>
                </h6>
                <div
                  id="flush-collapseOne"
                  className="accordion-collapse collapse"
                  aria-labelledby="flush-headingOne"
                  data-bs-parent="#accordionFAQ"
                >
                  <div className="accordion-body">
                    Make sure you have your billing information on the{" "}
                    <a
                      href=" https://platform.openai.com/account/billing/overview"
                      target="_blank"
                      rel="noreferrer"
                    >
                      OpenAI Billing page.
                    </a>{" "}
                    If you don&apos;t, it won&apos;t work. it&apos;s really
                    cheap! You only pay for what you use, like $1 for every
                    100,000 words.{" "}
                    <a
                      href="https://openai.com/pricing#language-models"
                      target="_blank"
                      rel="noreferrer"
                    >
                      See pricing
                    </a>{" "}
                    You don&apos;t have to pay extra for a ChatGPT Plus
                    Subscription to use the API key.
                  </div>
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
