const UpsellModal = () => {
  return (
    <div
      className="modal modal-lg fade"
      id="buyNow"
      tabIndex={-1}
      aria-labelledby="buy-now-title"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header px-4 pt-4 pb-0">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>

          <div className="modal-body">
            <h4 className="text-center" id="buy-now-title">
              Unlock all the features!
            </h4>
            <div className="d-flex align-items-center justify-content-center">
              <div className="old-price mx-2">$59</div>
              <div className="new-price mx-2">$19</div>
            </div>

            <div id="valuePrepPop" className="row justify-content-center py-4">
              <div className="col-12 col-md-6 col-xl-5 d-flex justify-content-center">
                <ul className="list-unstyled">
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Cross Platform
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Chat Folders - Easy sort
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Search, Favorites
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Export, backup data
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Characters assist you
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Advanced prompt library
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Pro-level features
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Custom API integration
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Voice input/output
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Document upload/edit
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Multi-language support
                  </li>
                </ul>
              </div>

              <div className="col-12 col-md-6 col-xl-5 d-flex justify-content-center">
                <ul className="list-unstyled">
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Multi-device compatibility
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Self-host enable
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Full model selection
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Edit any massages
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Words counter
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Tools box
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Token usage
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    MacOs app
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Mobile friendly (PWA)
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    Limitless possibilities
                  </li>
                  <li>
                    <span className="icon icon-check-circle"></span>
                    And much more...
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-center">
              <strong>Over 50 experts & 100 prompts included!</strong> <br />
              <strong>Any future upgrades included!</strong>
            </p>
          </div>

          <div className="modal-footer">
            <div className="row">
              <div className="col-12 d-flex flex-column align-items-center justify-content-center">
                <button type="button" className="btn btn-primary btn-xl">
                  BUY NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpsellModal;
