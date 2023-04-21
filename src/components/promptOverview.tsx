import { api } from "~/utils/api";
import CharacterPreview from "./characterPreview";
import PromptPreview from "./promptPreview";
import { toast } from "react-hot-toast";
import type { Character, Prompt } from "@prisma/client";
import { useState } from "react";

const PromptOverview = ({
  onOpenPrompt,
  onSelectCharacter,
  activeCharacter,
}: {
  onOpenPrompt: (prompt: Prompt) => void;
  onSelectCharacter: (character: Character) => void;
  activeCharacter?: Character;
}) => {
  const { data: prompts } = api.prompt.getAdded.useQuery(undefined, {
    onError: (error) => {
      console.log(error);
      toast.error("Error fetching prompts!");
    },
  });

  const { data: characters } = api.character.getAdded.useQuery(undefined, {
    onError: (error) => {
      console.log(error);
      toast.error("Error fetching characters!");
    },
  });

  const [searchFilter, setSearchFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

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
                <div className="input-group me-2 mb-2">
                  <span className="input-group-text">
                    <span className="icon icon-search-2"></span>
                  </span>
                  <input
                    className="form-control"
                    type="search"
                    placeholder="Search Character"
                    aria-label="Search"
                    value={searchFilter}
                    onChange={(e) =>
                      setSearchFilter(e.target.value.toLowerCase())
                    }
                  />
                </div>
                <div className="input-group me-2">
                  <span className="input-group-text">
                    <span className="icon icon-search-2"></span>
                  </span>
                  <select
                    id="promptCat"
                    className="form-select"
                    aria-label="Choose category"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                    }}
                    style={{
                      background: "#202123",
                      color: "gray",
                    }}
                  >
                    <option disabled value="">
                      Select a category
                    </option>
                    <option value="">All</option>
                    <option value="custom">Custom </option>
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
              </div>
            </div>

            <button
              className="btn-nostyle py-2 px-3 d-flex align-items-center mb-2"
              data-bs-toggle="modal"
              data-bs-target="#aiLib"
            >
              <span
                className="icon icon-plus me-2"
                style={{
                  color: "White",
                }}
              />
              <span className="text text-white">Add Character</span>
            </button>
          </div>
          <div>
            {characters
              ?.filter((c) => c.name.toLowerCase().includes(searchFilter))
              .filter((c) => {
                if (!selectedCategory) return true;
                if (selectedCategory === "custom") {
                  return c.userId !== null;
                }
                return c.category === selectedCategory;
              })
              .map((character) => (
                <CharacterPreview
                  key={character.id}
                  character={character}
                  onSelectCharacter={() => onSelectCharacter(character)}
                  active={character.id === activeCharacter?.id}
                />
              ))}
          </div>
        </div>

        <div className="inner tab-pane p-0 container" id="prompts">
          <div className="sticky-top inner-header border-bottom mb-4">
            <div className="row g-2 mb-4">
              <div className="col-12">
                <div className="input-group me-2 mb-2">
                  <span className="input-group-text">
                    <span className="icon icon-search-2" />
                  </span>
                  <input
                    className="form-control"
                    type="search"
                    placeholder="Search Prompt"
                    aria-label="Search"
                    value={searchFilter}
                    onChange={(e) =>
                      setSearchFilter(e.target.value.toLowerCase())
                    }
                  />
                </div>
                <div className="input-group me-2">
                  <span className="input-group-text">
                    <span className="icon icon-search-2"></span>
                  </span>
                  <select
                    id="promptCat"
                    className="form-select"
                    aria-label="Choose category"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                    }}
                    style={{
                      background: "#202123",
                      color: "gray",
                    }}
                  >
                    <option disabled value="">
                      Select a category
                    </option>
                    <option value="">All</option>
                    <option value="custom">Custom </option>
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
              </div>
            </div>

            <button
              className="btn-nostyle py-2 px-3 d-flex align-items-center mb-2"
              data-bs-toggle="modal"
              data-bs-target="#promptLib"
            >
              <span
                className="icon icon-plus me-2"
                style={{
                  color: "White",
                }}
              />
              <span
                className="text"
                style={{
                  color: "White",
                }}
              >
                Add Prompt
              </span>
            </button>
          </div>
          <div>
            {prompts
              ?.filter((c) => c.name.toLowerCase().includes(searchFilter))
              .filter((c) => {
                if (!selectedCategory) return true;
                if (selectedCategory === "custom") {
                  return c.userId !== null;
                }
                return c.category === selectedCategory;
              })
              .map((prompt) => (
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
