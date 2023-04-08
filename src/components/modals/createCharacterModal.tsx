import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";

const CreateCharacterModal = () => {
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    description: "",
    instructions: "",
  });

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const ctx = api.useContext();

  const { mutate: createCharacter } = api.openAi.createCharacter.useMutation({
    onSuccess: () => {
      console.log("success");
      toast.success("Character created!");
      setNewCharacter({
        name: "",
        description: "",
        instructions: "",
      });
      closeButtonRef.current?.click();
      void ctx.openAi.getAllCharacters.refetch();
    },
    onError: (error) => {
      console.log(error);
      toast.error("Error creating character!");
    },
  });

  return (
    <div
      className="modal fade"
      id="create-character"
      tabIndex={-1}
      aria-labelledby="create-character-title"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title fs-5" id="create-character-title">
              <span className="icon icon-face me-3"></span>
              Create Charcter
            </h4>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              ref={closeButtonRef}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="create-title" className="form-label">
                Title:
              </label>
              <input
                type="text"
                className="form-control"
                id="create-title"
                placeholder="Type title here"
                value={newCharacter.name}
                onChange={(e) =>
                  setNewCharacter({ ...newCharacter, name: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label htmlFor="create-desc" className="form-label">
                Description (optional):
              </label>
              <textarea
                className="form-control"
                id="create-desc"
                rows={3}
                placeholder="Type description here"
                value={newCharacter.description}
                onChange={(e) =>
                  setNewCharacter({
                    ...newCharacter,
                    description: e.target.value,
                  })
                }
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="create-inst" className="form-label">
                Instructions:
              </label>
              <textarea
                className="form-control"
                id="create-inst"
                rows={3}
                placeholder="Type your instructions here"
                value={newCharacter.instructions}
                onChange={(e) =>
                  setNewCharacter({
                    ...newCharacter,
                    instructions: e.target.value,
                  })
                }
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <div className="row g-1 m-0">
              <div className="col-sm-6 mb-1">
                <button
                  type="button"
                  className="btn w-100 btn-primary"
                  onClick={() => {
                    createCharacter(newCharacter);
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

export default CreateCharacterModal;
