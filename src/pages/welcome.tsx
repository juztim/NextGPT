import { type NextPage } from "next";
import Image from "next/image";
import Logo from "~/images/logo.png";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

const Welcome: NextPage = () => {
  const { status } = useSession();
  const router = useRouter();
  return (
    <>
      <div className="page-content">
        <div id="content-holder" className=" ">
          <div className="content-body">
            <div className="inner">
              <div className="d-flex align-items-md-center h-100">
                <div className="container-fluid">
                  <div className="row my-4">
                    <div className="col-12">
                      <div className="d-flex align-items-center justify-content-center flex-column text-center">
                        <Image
                          src={Logo}
                          alt="FutureDesk Logo"
                          className="hp-logo mb-3"
                        />
                        <h1>You Got The Whole World In Your Chat</h1>
                        <h4 className="text-weight-thin">
                          Unleash the power of GPT:
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div
                    id="valuePrep"
                    className="row justify-content-center py-4"
                  >
                    <div className="col-12 col-md-4 col-xl-3 d-flex justify-content-center">
                      <ul className="list-unstyled">
                        <li>
                          <span className="icon icon-lock" />
                          No login hassle
                        </li>
                        <li>
                          <span className="icon icon-folder-file" />
                          Chat Folders - Easy sort
                        </li>
                        <li>
                          <span className="icon icon-search" />
                          Search, Favorites
                        </li>
                        <li>
                          <span className="icon icon-export" />
                          Export, backup data
                        </li>
                        <li>
                          <span className="icon icon-user" />
                          Characters assist you
                        </li>
                        <li>
                          <span className="icon icon-book" />
                          Advanced prompt library
                        </li>
                        <li>
                          <span className="icon icon-emoji-events" />
                          Pro-level features
                        </li>
                        <li>
                          <span className="icon icon-globe" />
                          Browser-based workflow
                        </li>
                      </ul>
                    </div>

                    <div className="col-12 col-md-4 col-xl-3 d-flex justify-content-center">
                      <ul className="list-unstyled">
                        <li>
                          <span className="icon icon-key" />
                          Custom API integration
                        </li>
                        <li>
                          <span className="icon icon-mic" />
                          Voice input/output
                        </li>
                        <li>
                          <span className="icon icon-file-dock" />
                          Document upload/edit
                        </li>
                        <li>
                          <span className="icon icon-translate" />
                          Multi-language support
                        </li>
                        <li>
                          <span className="icon icon-phonelink" />
                          Multy-device compatibility
                        </li>
                        <li>
                          <span className="icon icon-upload" />
                          Self-host enable
                        </li>
                        <li>
                          <span className="icon icon-select-all" />
                          Full model selection
                        </li>
                        <li>
                          <span className="icon icon-all-inclusive" />
                          Limitless possibilities
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="row justify-content-center">
                    <div className="col-12 col-md-11 col-lg-10 text-center">
                      <div className="d-flex align-items-center justify-content-center flex-column">
                        <button
                          className="btn btn-primary btn-lg mb-5"
                          onClick={() => {
                            if (status === "authenticated") {
                              window.location.href = "/";
                            } else {
                              void signIn();
                            }
                          }}
                        >
                          Start Now
                          <span className="icon icon-expand-right-double ms-2"></span>
                        </button>

                        {/*<p>Start by logging in or signing up for free!</p>*/}
                        {/*<p className="mb-5">*/}
                        {/*  <a*/}
                        {/*    href="#"*/}
                        {/*    className="link"*/}
                        {/*    data-bs-toggle="modal"*/}
                        {/*    data-bs-target="#apiKey"*/}
                        {/*  >*/}
                        {/*    Enter Your API Key*/}
                        {/*  </a>{" "}*/}
                        {/*  or*/}
                        {/*  <a href="#" className="link">*/}
                        {/*    Get your API key from Open AI dashboard*/}
                        {/*  </a>*/}
                        {/*</p>*/}

                        {/*<button*/}
                        {/*  className="btn btn-outline-white btn-lg mb-3"*/}
                        {/*  onClick={() => {*/}
                        {/*    if (status === "authenticated") {*/}
                        {/*      void router.push("/");*/}
                        {/*    } else {*/}
                        {/*      void signIn();*/}
                        {/*    }*/}
                        {/*  }}*/}
                        {/*>*/}
                        {/*  Get your FutureDesk*/}
                        {/*  <span className="icon icon-expand-right-double ms-2"></span>*/}
                        {/*</button>*/}

                        {/*<a*/}
                        {/*  href="#"*/}
                        {/*  className="text-white text-weight-thin text-underline"*/}
                        {/*>*/}
                        {/*  Learn more*/}
                        {/*</a>*/}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="content-footer py-4">
            <div className="row justify-content-center">
              <div className="col-xxl-7 col-sm-9 col-11">
                <div className="d-flex">
                  <span className="icon icon-paper-clip icon-md me-2 mt-3"></span>

                  <div className="flex-grow-1">
                    <div className="input-group chat-ai">
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="chat-ai"
                        placeholder="Next question is...."
                      />

                      <span className="input-group-text" id="basic-addon1">
                        <button className="btn-nostyle">
                          <span className="icon icon-md icon-microphone"></span>
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Welcome;
