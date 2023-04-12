import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import CharacterLibraryItem from "~/components/promptLibrary/characterLibraryItem";

const CharacterLibraryModal = () => {
  const { data } = api.character.getAll.useQuery(undefined, {
    onError: (error) => {
      console.log(error);
      toast.error("Error loading characters");
    },
  });
  return (
    <div
      className="modal fade"
      id="aiLib"
      tabIndex={-1}
      aria-labelledby="aiLibTitle"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header flex-column justify-content-between align-items-start pb-3">
            <div className="d-flex w-100 mb-4">
              <h4 className="modal-title fs-5" id="aiLibTitle">
                <span className="icon icon-face me-3"></span>
                Select an AI Character
              </h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="w-100 d-flex align-items-end">
              <div className="w-100">
                <div className="mb-3">
                  <label htmlFor="aiCat" className="text-xsmall mb-2">
                    Category:
                  </label>
                  <select
                    id="aiCat"
                    className="form-select"
                    aria-label="Choose category"
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

                <div>
                  <input
                    type="text"
                    className="form-control"
                    id="aiSearch"
                    placeholder="Search"
                  />
                </div>
              </div>
              <a
                data-bs-toggle="modal"
                data-bs-target="#create-character"
                className="btn btn-link p-3"
              >
                +Create
              </a>
            </div>
          </div>
          <div className="modal-body mh-400">
            {data?.map((character) => (
              <CharacterLibraryItem character={character} key={character.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterLibraryModal;
