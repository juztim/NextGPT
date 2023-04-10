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
    category: "",
  });

  const { mutate: createPrompt } = api.openAi.createPrompt.useMutation({
    onSuccess: () => {
      toast.success("Prompt created successfully!");
      setNewPrompt({
        title: "",
        description: "",
        prompt: "",
        category: "",
      });
      modalCloseButton.current?.click();
      void ctx.openAi.getAllPrompts.refetch();
    },
    onError: (error) => {
      const titleError = error.data?.zodError?.fieldErrors.title;
      const descriptionError = error.data?.zodError?.fieldErrors.description;
      const instructionsError = error.data?.zodError?.fieldErrors.instructions;
      const categoryError = error.data?.zodError?.fieldErrors.category;

      if (titleError && titleError[0]) {
        toast.error(titleError[0]);
      }

      if (descriptionError && descriptionError[0]) {
        toast.error(descriptionError[0]);
      }

      if (instructionsError && instructionsError[0]) {
        toast.error(instructionsError[0]);
      }

      if (categoryError && categoryError[0]) {
        toast.error(categoryError[0]);
      }

      if (
        !titleError &&
        !descriptionError &&
        !instructionsError &&
        !categoryError
      ) {
        toast.error("Error creating character!");
      }
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
                <label htmlFor="create-category" className="form-label">
                  Category:
                </label>
                <select
                  className="form-select"
                  id="create-category"
                  value={newPrompt.category}
                  onChange={(e) =>
                    setNewPrompt({
                      ...newPrompt,
                      category: e.target.value,
                    })
                  }
                >
                  <option disabled>Select a category</option>
                  <option value="generalandadmin">General & Admin </option>
                  <option value="marketingandsales">Marketing & Sales</option>
                  <option value="developmentandit">Development & IT</option>
                  <option value="contentwriting">Content Writing</option>
                  <option value="designandart">Design & Art</option>
                  <option value="createandvideos">Creative & Videos</option>
                  <option value="lifestyleandentertainment">
                    Lifestyle & Entertainment
                  </option>
                </select>
              </div>
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
