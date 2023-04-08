import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";

const CreatePromptModal = () => {
  const ctx = api.useContext();
  const modalCloseButton = useRef<HTMLButtonElement>(null);

  const [newPrompt, setNewPrompt] = useState({
    title: "",
    description: "",
    prompt: "",
  });

  const { mutate: createPrompt } = api.openAi.createPrompt.useMutation({
    onSuccess: (data) => {
      toast.success("Prompt created successfully!");
      setNewPrompt({
        title: "",
        description: "",
        prompt: "",
      });
      modalCloseButton.current?.click();
      void ctx.openAi.getAllPrompts.refetch();
    },
    onError: (error) => {
      console.log(error);
      toast.error("Error creating prompt!");
    },
  });

  return (
    <div
      className="modal fade"
      id="create-prompt"
      tabIndex={-1}
      aria-labelledby="create-character-title"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title fs-5" id="create-character-title">
              <span className="icon icon-propt me-3" />
              Create Prompt
            </h4>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              ref={modalCloseButton}
            />
          </div>
          <div className="modal-body">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                console.log(newPrompt);
              }}
            >
              <div className="mb-3">
                <label htmlFor="prompt-title" className="form-label">
                  Title:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="prompt-title"
                  placeholder="Type title here"
                  onChange={(e) => {
                    setNewPrompt({ ...newPrompt, title: e.target.value });
                  }}
                  value={newPrompt.title}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="prompt-desc" className="form-label">
                  Description (optional):
                </label>
                <textarea
                  className="form-control"
                  id="prompt-desc"
                  rows={3}
                  placeholder="Type description here"
                  onChange={(e) => {
                    setNewPrompt({ ...newPrompt, description: e.target.value });
                  }}
                  value={newPrompt.description}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="prompt-inst" className="form-label">
                  Prompt:
                  <span className="text-muted text-xsmall">
                    {
                      "Use {{field 1}} {{field 2}} {{or anything}} to indicate the fill in the blank part."
                    }
                  </span>
                </label>
                <textarea
                  className="form-control"
                  id="prompt-inst"
                  rows={3}
                  placeholder="Type your prompt here"
                  onChange={(e) => {
                    setNewPrompt({
                      ...newPrompt,
                      prompt: e.target.value,
                    });
                  }}
                  value={newPrompt.prompt}
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <div className="row g-1 m-0">
              <div className="col-sm-6 mb-1">
                <button
                  type="submit"
                  className="btn w-100 btn-primary"
                  onClick={() => {
                    createPrompt(newPrompt);
                  }}
                >
                  Create
                </button>
              </div>
              <div className="col-sm-6 mb-1">
                <button
                  type="button"
                  className="btn w-100 btn-outline-primary"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    createPrompt(newPrompt);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePromptModal;
