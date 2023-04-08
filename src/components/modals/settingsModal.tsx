const SettingsModal = () => {
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
                  {/* <h5 className="text-normal fw-bold">Output</h5>
                  <div className="mb-2">
                    <label className="text-xsmall mb-2">Output Language</label>
                    <select
                      className="form-select"
                      aria-label="Output Language"
                      defaultValue={0}
                    >
                      <option value="0">English US</option>
                      <option value="1">English UK</option>
                      <option value="2">French FR</option>
                    </select>
                  </div> */}

                  <div className="mb-2">
                    <label className="text-xsmall mb-2">Tone</label>
                    <select
                      className="form-select"
                      aria-label="Tone"
                      defaultValue={0}
                    >
                      <option value="0">Default</option>
                      <option value="1">Bussiness</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="text-xsmall mb-2">Writing Style</label>
                    <select
                      className="form-select"
                      aria-label="Writing Style"
                      defaultValue={0}
                    >
                      <option value="0">Default</option>
                      <option value="1">Bussiness</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="text-xsmall mb-2">Format</label>
                    <select
                      className="form-select"
                      aria-label="Format"
                      defaultValue={0}
                    >
                      <option value={0}>Default</option>
                      <option value="1">Bussiness</option>
                    </select>
                  </div>
                </section>

                <section>
                  <div className="mb-2">
                    <label className="text-xsmall mb-2">Search Engine</label>
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

                    <a className="main-link text-small" href="#">
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

                    <a className="main-link text-small">Learn More</a>
                  </div>

                  <div>
                    <a className="link text-small">Reset to default</a>
                  </div>

                  <div className="mt-2 border border-light p-3 text-xsmall mb-2 rounded">
                    You are ChatGPT, a large language model trained by OpenAI.
                  </div>

                  <div className="form-check form-switch d-flex align-items-center">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="stream-ai"
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

                <div className="section">
                  <h5 className="text-normal fw-bold">Temperature: 0.7</h5>

                  <div>
                    <a href="#" className="link text-small">
                      Reset to default
                    </a>
                  </div>

                  <p className="text-muted text-small mt-2">
                    Higher values like 0.8 will make the output more random,
                    while lower values like 0.2 will make it more focused and
                    deterministic
                  </p>

                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="12"
                    id="temperature"
                  />
                  <div className="d-flex justify-content-between">
                    <span>Precise</span>
                    <span>Neutral</span>
                    <span>Creative</span>
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

          <div className="modal-footer justify-content-start">
            <button type="button" className="btn btn-primary ms-0">
              Save
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              data-bs-dismiss="modal"
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
