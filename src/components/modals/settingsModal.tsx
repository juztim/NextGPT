import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useSettingsStore } from "~/stores/settingsStore";
import { api } from "~/utils/api";
import languages from "~/languages.json";

const SettingsModal = () => {
  const [newSettings, setNewSettings] = useState<{
    temperature: number;
    topP: number;
    maxLength?: number;
    presencePenalty: number;
    frequencyPenalty: number;
    tone: string;
    format: string;
    writingStyle: string;
    outputLanguage: string;
    initialInstructions: string;
    showWordCount: boolean;
  }>({
    temperature: 0,
    topP: 0,
    presencePenalty: 0,
    frequencyPenalty: 0,
    tone: "",
    format: "",
    writingStyle: "",
    outputLanguage: "",
    initialInstructions: "",
    showWordCount: true,
  });

  const settings = useSettingsStore();
  const closeBtn = useRef<HTMLButtonElement>(null);

  const { mutate: setSettings } = api.openAi.setSettings.useMutation({
    onSuccess: () => {
      toast.success("Settings updated!");
      closeBtn.current?.click();
    },
    onError: (error) => {
      console.log(error);
      toast.error("Error whilst saving settings to Database!");
    },
  });

  useEffect(() => {
    setNewSettings({
      temperature: settings.temperature,
      topP: settings.topP,
      maxLength: settings.maxLength ?? 0,
      presencePenalty: settings.presencePenalty,
      frequencyPenalty: settings.frequencyPenalty,
      tone: settings.tone,
      format: settings.format,
      writingStyle: settings.writingStyle,
      outputLanguage: settings.outputLanguage,
      initialInstructions: settings.initialInstructions,
      showWordCount: settings.showWordCount,
    });
  }, [settings]);

  return (
    <div
      className="modal fade"
      id="settings"
      aria-labelledby="settings-title"
      tabIndex={-1}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header flex-column justify-content-between align-items-start pb-3">
            <div className="d-flex w-100 mb-4">
              <h4 className="modal-title fs-5" id="settings-title">
                <span className="icon icon-settings me-3"></span>
                Settings
              </h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <ul className="nav nav-pills">
              <li className="nav-item">
                <a
                  className="nav-link active"
                  data-bs-toggle="pill"
                  href="#settings-general"
                >
                  General
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  data-bs-toggle="pill"
                  href="#settings-model"
                >
                  Model setting
                </a>
              </li>
              {/* <li className="nav-item">
                <a
                  className="nav-link"
                  data-bs-toggle="pill"
                  href="#settings-backup"
                >
                  Backup & Sync
                </a>
              </li> */}
            </ul>
          </div>
          <div className="modal-body">
            <div className="tab-content">
              <div className="tab-pane active" id="settings-general">
                {/* <section className="mb-5">
                  <h5 className="text-normal fw-bold">All Data</h5>

                  <div className="text-small">
                    <span className="text-muted">You have</span>
                    <span className="fw-bold">
                      25 characters, 2 folders, 3 chats with 8 messages
                    </span>
                    <span className="text-muted">on this device</span>
                  </div>

                  <div className="d-flex mt-3">
                    <a className="btn btn-primary me-2">Export</a>
                    <a className="btn btn-primary me-2">Import</a>
                    <a className="btn btn-outline-primary me-2">
                      Recover lost data
                    </a>
                  </div>
                </section>

                <section className="mb-5">
                  <h5 className="text-normal fw-bold">Local Storage</h5>
                  <p className="text-xsmall text-muted">
                    All of your data is stored locally in your browser.
                  </p>

                  <p className="text-xsmall text-muted">
                    Each browser has a different limit of how much data you can
                    store, the general limit is{" "}
                    <span className="text-black">5MB</span>. If you are running
                    out of space, you can delete ome of your old chats.
                  </p>

                  <div className="progress">
                    <div
                      className="progress-bar w-0"
                      role="progressbar"
                      aria-label="Basic example"
                      aria-valuenow={0}
                      aria-valuemin={0}
                      aria-valuemax={0}
                    />
                  </div>

                  <div className="d-flex justify-content-between mt-1">
                    <div>
                      <span className="text-muted">Used:</span> 0.00 MB (0.00%)
                    </div>

                    <div>
                      <span className="text-muted">Available:</span> 5.00 MB
                    </div>
                  </div>

                  <p className="mt-2 text-xsmall">
                    Please export and backup your chats regularly to avoid data
                    lost!
                  </p>

                  <a className="btn btn-primary mt-2">Setup Backup & Sync</a>
                </section> */}

                <section className="mb-5">
                  <h5 className="text-normal fw-bold">Voice Input</h5>
                  <p className="text-muted text-xsmall mb-2">
                    Microphone access is needed for voice input
                  </p>

                  {/*  <div className="mb-2">
                    <select
                      className="form-select"
                      aria-label="Language"
                      defaultValue={0}
                    >
                      <option value="0">English US</option>
                      <option value="1">English UK</option>
                      <option value="2">French FR</option>
                    </select>
                  </div>
 */}
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="auto-message"
                    />
                    <label
                      className="form-check-label mt-1 text-xsmall text-muted"
                      htmlFor="auto-message"
                    >
                      Auto send message after speaking
                    </label>
                  </div>
                </section>

                <section className="mb-5">
                  <h5 className="text-normal fw-bold">Output</h5>
                  <div className="mb-2">
                    <label className="text-xsmall mb-2">Output Language</label>
                    <select
                      className="form-select"
                      aria-label="Output Language"
                      value={newSettings.outputLanguage || "russian"}
                      onChange={(e) => {
                        setNewSettings({
                          ...newSettings,
                          outputLanguage: e.target.value,
                        });
                      }}
                    >
                      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
                      {languages.map((language) => (
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
                        <option value={language.name} key={language.code}>
                          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                          {language.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="text-xsmall mb-2">Tone</label>
                    <select
                      className="form-select"
                      aria-label="Tone"
                      value={newSettings.tone || ""}
                      onChange={(e) => {
                        setNewSettings({
                          ...newSettings,
                          tone: e.target.value,
                        });
                      }}
                    >
                      <option value="normal">Default</option>
                      <option value="academic">Academic</option>
                      <option value="analytical">Analytical</option>
                      <option value="argumentative">Argumentative</option>
                      <option value="conversation">Conversational</option>
                      <option value="creative">Creative</option>
                      <option value="critical">Critical</option>
                      <option value="descriptive">Descriptive</option>
                      <option value="epigrammatic">Epigrammatic</option>
                      <option value="epistolary">Epistolary</option>
                      <option value="expository">Expository</option>
                      <option value="informative">Informative</option>
                      <option value="instructive">Instructive</option>
                      <option value="journalistic">Journalistic</option>
                      <option value="metaphorical">Metaphorical</option>
                      <option value="narrative">Narrative</option>
                      <option value="persuasive">Persuasive</option>
                      <option value="poetic">Poetic</option>
                      <option value="satirical">Satirical</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="text-xsmall mb-2">Writing Style</label>
                    <select
                      className="form-select"
                      aria-label="Writing Style"
                      value={newSettings.writingStyle || ""}
                      onChange={(e) => {
                        setNewSettings({
                          ...newSettings,
                          writingStyle: e.target.value,
                        });
                      }}
                    >
                      <option value="normal">Default</option>
                      <option value="authorative">Authorative</option>
                      <option value="clinical">Clinical</option>
                      <option value="cold">Cold</option>
                      <option value="confident">Confident</option>
                      <option value="cynical">Cynical</option>
                      <option value="emotional">Emotional</option>
                      <option value="empathetic">Empathetic</option>
                      <option value="formal">Formal</option>
                      <option value="friendly">Friendly</option>
                      <option value="humorous">Humorous</option>
                      <option value="informal">Informal</option>
                      <option value="ironic">Ironic</option>
                      <option value="optimistic">Optimistic</option>
                      <option value="pessimistic">Pessimistic</option>
                      <option value="playful">Playful</option>
                      <option value="sarcastic">Sarcastic</option>
                      <option value="serious">Serious</option>
                      <option value="sympathetic">Sympathetic</option>
                      <option value="tentative">Tentative</option>
                      <option value="warm">Warm</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="text-xsmall mb-2">Format</label>
                    <select
                      className="form-select"
                      aria-label="Format"
                      value={newSettings.format || ""}
                      onChange={(e) => {
                        setNewSettings({
                          ...newSettings,
                          format: e.target.value,
                        });
                      }}
                    >
                      <option value="normal">Default</option>
                      <option value="concise">Concise</option>
                      <option value="step by step">Step-By-Step</option>
                      <option value="explain like im 5">ELI5</option>
                      <option value="extreme detail">Extreme Detail</option>
                      <option value="story">Story</option>
                      <option value="poem">Poem</option>
                      <option value="song">Song</option>
                      <option value="joke">Joke</option>
                    </select>
                  </div>
                </section>

                <section>
                  <div className="mb-2">
                    <label
                      className="text-xsmall mb-2"
                      style={{
                        fontWeight: "bolder",
                      }}
                    >
                      Search Engine
                    </label>
                    <select
                      className="form-select"
                      aria-label="Search Engine"
                      defaultValue={0}
                    >
                      <option value={0}>Google</option>
                      <option value="1">Yandex</option>
                    </select>
                  </div>
                </section>
              </div>

              <div className="tab-pane" id="settings-model">
                <div className="section mb-5">
                  <div className="d-flex justify-content-between mb-2">
                    <h5 className="text-normal fw-bold mb-0">
                      Model
                      <span className="badge bg-accent-2 ms-2 py-2 px-3 text-normal">
                        GPT - 4 Avaliable!
                      </span>
                    </h5>

                    <a
                      className="main-link text-small"
                      href="https://platform.openai.com/docs/guides/chat"
                      target="_blank"
                    >
                      Learn More
                    </a>
                  </div>

                  <div className="mb-2">
                    <select className="form-select" aria-label="Model">
                      <option>GPT-4 (Limited Beta)</option>
                    </select>
                  </div>

                  <div className="bg-light text-xsmall p-3 rounded">
                    <p>
                      <strong>Model:</strong> GPT-3.5-TURBO
                    </p>
                    <p>
                      <strong>Max tokens:</strong> 4,096
                    </p>
                    <p>
                      Most capable GPT-3.5 model and optimized for chat at
                      1/10th the cost of text-davinci-003. Will be updated with
                      our latest model iteration.
                    </p>
                    <p>
                      <strong>Training data:</strong> Up to Sep 2021
                    </p>
                  </div>
                </div>

                <div className="section mb-5">
                  <div className="d-flex justify-content-between mb-2">
                    <h5 className="text-normal fw-bold mb-0">
                      Initial System Instruction
                    </h5>

                    <a
                      className="main-link text-small"
                      href="https://platform.openai.com/docs/guides/chat/instructing-chat-models"
                      target="_blank"
                    >
                      Learn More
                    </a>
                  </div>

                  {newSettings.initialInstructions ? (
                    <div>
                      <a className="link text-small">Reset to default</a>
                    </div>
                  ) : null}

                  <div
                    style={{
                      width: "100%",
                    }}
                  >
                    <input
                      className="mt-2 border border-light p-3 text-xsmall mb-2 rounded"
                      style={{
                        width: "100%",
                      }}
                      value={newSettings.initialInstructions || ""}
                      onChange={(e) => {
                        setNewSettings({
                          ...newSettings,
                          initialInstructions: e.target.value,
                        });
                      }}
                    />
                  </div>

                  <div className="form-check form-switch d-flex align-items-center">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="stream-ai"
                      checked={newSettings.showWordCount || false}
                      onChange={(e) => {
                        setNewSettings({
                          ...newSettings,
                          showWordCount: e.target.checked,
                        });
                      }}
                    />

                    <div>
                      <label
                        className="form-check-label text-xsmall"
                        htmlFor="stream-ai"
                      >
                        Show the word counter and estimated cost
                      </label>
                    </div>
                  </div>
                </div>

                <div className="section mb-5">
                  <h5 className="text-normal fw-bold">
                    Temperature: {newSettings.temperature}
                  </h5>

                  {newSettings.temperature ? (
                    <div>
                      <a href="#" className="link text-small">
                        Reset to default (1)
                      </a>
                    </div>
                  ) : null}

                  <p className="text-muted text-small mt-2">
                    Higher values like 0.8 will make the output more random,
                    while lower values like 0.2 will make it more focused and
                    deterministic
                  </p>

                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="10"
                    step="0.01"
                    id="temperature"
                    defaultValue={newSettings.temperature}
                    onChange={(e) => {
                      setNewSettings({
                        ...newSettings,
                        temperature: Number(e.target.value),
                      });
                    }}
                  />
                  <div className="d-flex justify-content-between">
                    <span>Precise</span>
                    <span>Neutral</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div className="section mb-5">
                  <h5 className="text-normal fw-bold">
                    Top P: {newSettings.topP}
                  </h5>

                  {newSettings.topP ? (
                    <div>
                      <a href="#" className="link text-small">
                        Reset to default (0.9)
                      </a>
                    </div>
                  ) : null}
                  <p className="text-muted text-small mt-2">
                    Higher values like 0.8 will make the output more diverse and
                    unpredictable, while lower values like 0.2 will make the
                    output more focused and deterministic.
                  </p>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="1"
                    step="0.01"
                    id="topP"
                    defaultValue={newSettings.topP}
                    onChange={(e) => {
                      setNewSettings({
                        ...newSettings,
                        topP: Number(e.target.value),
                      });
                    }}
                  />
                  <div className="d-flex justify-content-between">
                    <span>Chaotic</span>
                    <span>Imaginative</span>
                    <span>Accurate</span>
                  </div>
                </div>

                <div className="section mb-5">
                  <h5 className="text-normal fw-bold">
                    Maximum length:{" "}
                    {newSettings.maxLength ? newSettings.maxLength : "No limit"}
                  </h5>

                  {newSettings.maxLength ? (
                    <div>
                      <a
                        className="link text-small"
                        onClick={() => {
                          setNewSettings({
                            ...newSettings,
                            maxLength: undefined,
                          });
                        }}
                      >
                        Reset to default (No limit)
                      </a>
                    </div>
                  ) : null}

                  <p className="text-muted text-small mt-2">
                    Maximum length controls the maximum length of the response
                    generated by the chatbot. It specifies the amount of
                    information to provide in the response. By adjusting the
                    value of maximum length, responses can be shorter or longer.
                  </p>
                  <input
                    type="range"
                    className="form-range"
                    min="1"
                    max="4096"
                    id="maxLength"
                    defaultValue={newSettings.maxLength}
                    onChange={(e) => {
                      setNewSettings({
                        ...newSettings,
                        maxLength: Number(e.target.value),
                      });
                    }}
                  />
                  <div className="d-flex justify-content-between">
                    <span>Short</span>
                    <span>Balanced</span>
                    <span>Long</span>
                  </div>
                </div>

                <div className="section mb-5">
                  <h5 className="text-normal fw-bold">
                    Presence penalty: {newSettings.presencePenalty}
                  </h5>

                  {newSettings.presencePenalty ? (
                    <div>
                      <a href="#" className="link text-small">
                        Reset to default (0)
                      </a>
                    </div>
                  ) : null}
                  <p className="text-muted text-small mt-2">
                    Number between -2.0 and 2.0. Positive values penalize new
                    tokens based on whether they appear in the text so far,
                    increasing the model&apos;s likelihood to talk about new
                    topics.
                  </p>
                  <input
                    type="range"
                    className="form-range"
                    min="-2.0"
                    max="2.0"
                    step="0.01"
                    id="presencePenalty"
                    defaultValue={newSettings.presencePenalty}
                    onChange={(e) => {
                      setNewSettings({
                        ...newSettings,
                        presencePenalty: Number(e.target.value),
                      });
                    }}
                  />
                  <div className="d-flex justify-content-between">
                    <span>Restrictive</span>
                    <span>Balanced</span>
                    <span>Lenient</span>
                  </div>
                </div>

                <div className="section mb-5">
                  <h5 className="text-normal fw-bold">
                    Frequency penalty: {newSettings.frequencyPenalty}
                  </h5>

                  {newSettings.frequencyPenalty ? (
                    <div>
                      <a href="#" className="link text-small">
                        Reset to default (0)
                      </a>
                    </div>
                  ) : null}
                  <p className="text-muted text-small mt-2">
                    Number between -2.0 and 2.0. Positive values penalize new
                    tokens based on their existing frequency in the text so far,
                    decreasing the model&apos;s likelihood to repeat the same
                    line verbatim.
                  </p>
                  <input
                    type="range"
                    className="form-range"
                    min="-2.0"
                    max="2.0"
                    step="0.01"
                    id="frequencyPenalty"
                    defaultValue={newSettings.frequencyPenalty}
                    onChange={(e) => {
                      setNewSettings({
                        ...newSettings,
                        frequencyPenalty: Number(e.target.value),
                      });
                    }}
                  />
                  <div className="d-flex justify-content-between">
                    <span>Repetitive</span>
                    <span>Balanced</span>
                    <span>Varied</span>
                  </div>
                </div>
              </div>

              {/* <div className="tab-pane" id="settings-backup">
                <section className="mb-5">
                  <h5 className="text-normal fw-bold">Local Storage</h5>
                  <p className="text-xsmall text-muted">
                    All of your data is stored locally in your browser. Each
                    browser has a different limit of how much data you can
                    store, the general limit is 5MB. If you are running out of
                    space, you can delete some of your old chats
                  </p>

                  <div className="progress">
                    <div
                      className="progress-bar w-25"
                      role="progressbar"
                      aria-label="Basic example"
                      aria-valuenow={0}
                      aria-valuemin={25}
                      aria-valuemax={25}
                    ></div>
                  </div>

                  <div className="d-flex justify-content-between mt-1">
                    <div>
                      <span className="text-muted">Used:</span> 1MB (25.00%)
                    </div>

                    <div>
                      <span className="text-muted">Available:</span> 5.00 MB
                    </div>
                  </div>
                </section>

                <section className="mb-5">
                  <div className="form-check form-switch d-flex justify-content-between ps-0">
                    <label
                      className="form-check-label mt-1 text-normal fw-bold"
                      htmlFor="future-desk"
                    >
                      FutureDesk Cloud
                    </label>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="future-desk"
                    />
                  </div>

                  <p className="text-muted text-xsmall">
                    FutureDesk Cloud provides a cloud storage for your data. You
                    can backup your data to the cloud and sync your data across
                    devices
                  </p>
                </section>

                <section className="mb-5">
                  <div className="form-check form-switch d-flex justify-content-between ps-0">
                    <label
                      className="form-check-label mt-1 text-normal fw-bold"
                      htmlFor="google-drive"
                    >
                      Google Drive
                    </label>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="google-drive"
                    />
                  </div>

                  <p className="text-muted text-xsmall">
                    Use Google Drive to backup and sync your data across devices
                  </p>
                </section>
              </div> */}
            </div>
          </div>

          <div className="modal-footer d-flex justify-content-start">
            <button
              type="button"
              className="btn btn-primary ms-0"
              onClick={() => {
                settings.saveSettings(newSettings);
                setSettings({
                  settings: newSettings,
                });
                closeBtn.current?.click();
              }}
            >
              Save
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              data-bs-dismiss="modal"
              ref={closeBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
