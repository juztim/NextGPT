import PromptLibraryItem from "~/components/promptLibrary/promptLibraryItem";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { Virtuoso } from "react-virtuoso";

const PromptLibraryModal = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");

  const { data } = api.prompt.getAll.useQuery(undefined, {
    onError: (error) => {
      console.log(error);
      toast.error("Error loading prompts");
    },
  });

  return (
    <div
      className="modal fade"
      id="promptLib"
      tabIndex={-1}
      aria-labelledby="promptLibTitle"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header flex-column justify-content-between align-items-start pb-3">
            <div className="d-flex w-100 mb-4">
              <h4 className="modal-title fs-5" id="promptLibTitle">
                <span className="icon icon-propt me-3"></span>
                Prompt Library
              </h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>

            <div className="w-100 d-flex align-items-end">
              <div className="w-100">
                <div className="mb-3">
                  <label htmlFor="promptCat" className="text-xsmall mb-2">
                    Category:
                  </label>
                  <select
                    id="promptCat"
                    className="form-select"
                    aria-label="Choose category"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                    }}
                  >
                    <option disabled>Select a category</option>
                    <option value="">All</option>
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
                    id="promptSearch"
                    placeholder="Search"
                    value={searchFilter}
                    onChange={(e) => {
                      setSearchFilter(e.target.value.toLowerCase());
                    }}
                  />
                </div>
              </div>
              <a
                data-bs-toggle="modal"
                data-bs-target="#create-prompt"
                className="btn btn-link p-3"
              >
                +Create
              </a>
            </div>
          </div>
          <div className="modal-body">
            {data && (
              <Virtuoso
                style={{ height: "400px" }}
                data={data
                  .filter((prompt) => {
                    if (selectedCategory === "") {
                      return true;
                    }
                    return prompt.category === selectedCategory;
                  })
                  .filter((prompt) => {
                    if (searchFilter === "") {
                      return true;
                    }
                    return prompt.instructions
                      .toLowerCase()
                      .includes(searchFilter);
                  })}
                itemContent={(index, prompt) => {
                  return <PromptLibraryItem key={prompt.id} prompt={prompt} />;
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptLibraryModal;
