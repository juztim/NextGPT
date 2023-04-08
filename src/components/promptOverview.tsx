import { api } from "~/utils/api";
import CharacterPreview from "./characterPreview";
import PromptPreview from "./promptPreview";
import { toast } from "react-hot-toast";
import type { Prompt } from "@prisma/client";

const PromptOverview = ({
  onOpenPrompt,
}: {
  onOpenPrompt: (prompt: Prompt) => void;
}) => {
  const { data: prompts } = api.openAi.getAllPrompts.useQuery(undefined, {
    onError: (error) => {
      console.log(error);
      toast.error("Error fetching prompts!");
    },
  });

  return (
    <div id="right-menu" className="show">
      <div id="right-menu-toggle">
        <span className="icon icon-right-slide"></span>
      </div>

      <div className="menu-header">
        <ul className="nav nav-pills mb-4 d-flex mt-2">
          <li className="nav-item">
            <a
              className="nav-link active"
              data-bs-toggle="pill"
              href="#ai-characters"
            >
              <span className="icon icon-face" />
              AI Characters
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" data-bs-toggle="pill" href="#prompts">
              <span className="icon icon-propt" />
              Prompts
            </a>
          </li>
        </ul>
      </div>

      <div className="tab-content menu-body">
        <div className="inner tab-pane p-0 container active" id="ai-characters">
          <div className="sticky-top inner-header border-bottom mb-4">
            <div className="row g-2 mb-4">
              <div className="col-12">
                <div className="input-group me-2">
                  <span className="input-group-text">
                    <span className="icon icon-search-2"></span>
                  </span>
                  <input
                    className="form-control"
                    type="search"
                    placeholder="Search Chat"
                    aria-label="Search"
                  />
                </div>
              </div>
            </div>

            <button
              className="btn-nostyle py-2 px-3 d-flex align-items-center mb-2"
              data-bs-toggle="modal"
              data-bs-target="#create-character"
            >
              <span className="icon icon-plus me-2" />
              <span className="text">Add Character</span>
            </button>
          </div>
          <div>
            <CharacterPreview />
            <CharacterPreview />
          </div>
        </div>

        <div className="inner tab-pane p-0 container" id="prompts">
          <div className="sticky-top inner-header border-bottom mb-4">
            <div className="row g-2 mb-4">
              <div className="col-12">
                <div className="input-group me-2">
                  <span className="input-group-text">
                    <span className="icon icon-search-2" />
                  </span>
                  <input
                    className="form-control"
                    type="search"
                    placeholder="Search Prompt"
                    aria-label="Search"
                  />
                </div>
              </div>
            </div>

            <button
              className="btn-nostyle py-2 px-3 d-flex align-items-center mb-2"
              data-bs-toggle="modal"
              data-bs-target="#create-prompt"
            >
              <span className="icon icon-plus me-2" />
              <span className="text">Add Prompt</span>
            </button>
          </div>
          <div>
            {prompts?.map((prompt) => (
              <PromptPreview
                key={prompt.id}
                prompt={prompt}
                onOpenPrompt={onOpenPrompt}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptOverview;
