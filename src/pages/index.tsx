import styles from "./index.module.css";
import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Logo from "~/images/logo.png";
import ChatMessage from "~/components/chatMessage";
import { api } from "~/utils/api";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import ChatFolder from "~/components/chatFolder";
import AiChatMessage from "~/components/aiChatMessage";

const Home: NextPage = () => {
  const [activeChatId, setActiveChatId] = useState<string>("");
  const ctx = api.useContext();
  const innerChatBoxRef = useRef<HTMLDivElement | null>(null);
  const { data: session, status } = useSession();

  const { mutate: deleteChat } = api.openAi.delete.useMutation({
    onError(error) {
      console.log(error);
      toast.error("Error deleting chat");
    },
    onSuccess() {
      toast.success("Chat deleted");
      void ctx.openAi.getAllChats.refetch();
    },
  });

  const { mutate: sendMessage, isLoading: isSendingMessage } =
    api.openAi.send.useMutation({
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.newMessage;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error(
            "Error sending message. Please try again. If the problem persists, please contact support."
          );
        }
      },
      onSuccess: (data) => {
        if (data?.newConversation) {
          toast.success("New conversation started");
          setActiveChatId(data.conversationId);
        }
        setMessage("");
        void ctx.openAi.getChat.refetch({ id: activeChatId });
        void ctx.openAi.getAllChats.refetch();

        if (innerChatBoxRef.current) {
          innerChatBoxRef.current.scrollIntoView({
            behavior: "smooth",
          });
        }
      },
    });

  const { data: chats } = api.openAi.getAllChats.useQuery(undefined, {
    onError: (err) => {
      console.log(err);
      toast.error("Error loading chats");
    },
  });

  const { data: activeChat } = api.openAi.getChat.useQuery(
    { id: activeChatId },
    {
      onError: (err) => {
        console.log(err);
        toast.error("Error loading chat");
      },
    }
  );

  const [message, setMessage] = useState("");

  const submitNewMessage = () => {
    sendMessage({
      conversationId: activeChatId,
      newMessage: message,
    });
  };

  // If the user is not logged in, show the login page
  useEffect(() => {
    if (status !== "authenticated" && status !== "loading") {
      void signIn();
    }
  }, [status]);

  return (
    <>
      <header className="header fixed-top">
        <nav className="navbar">
          <div className="container-fluid">
            <a className="navbar-brand d-inline-flex" href="#">
              <Image
                src={Logo}
                alt="GPT Skin Logo"
                className="logo img-fluid"
              />
            </a>

            <div className="d-flex align-items-center">
              <ul className="d-flex flex-row navbar-nav">
                <li className="nav-item dropdown me-sm-4">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <span className="icon icon-account-circle"></span>
                    <span className="d-none d-sm-inline">John Doe</span>
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <a className="dropdown-item" href="#">
                        My Profile
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        href="#"
                        onClick={() => void signOut()}
                      >
                        Log out
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="nav-item">
                  <a className="nav-link">
                    <span className="icon icon-info"></span>
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link">
                    <span className="icon icon-mute"></span>
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link">
                    <span className="icon icon-sun"></span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
      <div className="page-content">
        <div id="left-menu" className="show">
          <div id="left-menu-toggle">
            <span className="icon icon-left-slide"></span>
          </div>
          <div className="menu-header">
            <div className="row g-2 mb-2">
              <div className="col-9">
                <button
                  className="btn btn-primary btn-block w-100 btn-new"
                  onClick={() => setActiveChatId("")}
                >
                  <span className="icon icon-plus"></span>
                  New Chat
                </button>
              </div>
              <div className="col-3 d-flex align-items-center justify-content-center">
                <button className="btn-nostyle">
                  <span className="icon icon-folder-plus"></span>
                </button>
              </div>
            </div>

            <div className="row g-2 mb-2">
              <div className="col-9">
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
              <div className="col-3 d-flex align-items-center justify-content-center">
                <button
                  className="btn-nostyle"
                  data-bs-toggle="modal"
                  data-bs-target="#settings"
                >
                  <span className="icon icon-filter"></span>
                </button>
              </div>
            </div>
          </div>

          <div className="menu-body mt-4">
            <div className="inner">
              <div className="sticky-top inner-header border-bottom mb-4">
                <div className="p-3">
                  <div className="row g-1">
                    <div className="col-9">
                      <span className="icon icon-star text-accent me-2"></span>
                      <span className="text">Favorized Chat Name</span>
                    </div>
                    <div className="col-3 d-flex align-items-center justify-content-end">
                      <button className="btn-nostyle px-2">
                        <span className="icon icon-edit"></span>
                      </button>
                      <button className="btn-nostyle px-2">
                        <span className="icon icon-delete"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <ChatFolder
                  title="Ungrouped Chats"
                  onChatOpen={setActiveChatId}
                  conversations={chats?.ungroupedChats}
                  index={9999}
                  onChatDelete={(id) => deleteChat({ id })}
                  refreshChats={() => void ctx.openAi.getAllChats.refetch()}
                />
                {chats?.groupedChats?.map((folder, index) => (
                  <ChatFolder
                    title={folder.name}
                    conversations={folder.conversations}
                    key={folder.id}
                    index={index}
                    onChatOpen={setActiveChatId}
                    onChatDelete={(id) => deleteChat({ id })}
                    refreshChats={() => void ctx.openAi.getAllChats.refetch()}
                  />
                ))}
              </div>
            </div>
            <div className="menu-body-bottom py-3">
              <button className="btn-nostyle d-flex align-items-center">
                <span className="icon icon-delete me-3"></span>
                Clear all conversations
              </button>
            </div>
          </div>

          <div className="menu-footer py-3 border-top">
            <div className="row g-2 mb-1">
              <div className="col-7">
                <a
                  href="#"
                  className="link-with-icon d-flex align-items-center text-xsmall"
                >
                  <span className="icon text-accent icon-shild-info me-2 text-big"></span>
                  <span className="text">License Key</span>
                </a>
              </div>
              <div className="col-5">
                <span className="text-muted text-xsmall">Unlicensed</span>
              </div>
            </div>

            <div className="row g-2">
              <div className="col-7">
                <a
                  href="#"
                  className="link-with-icon d-flex align-items-center text-xsmall"
                >
                  <span className="icon text-accent icon-shild-info me-2 text-big"></span>
                  <span className="text">Open AI API Key</span>
                </a>
              </div>
              <div className="col-5">
                <span className="text-muted text-xsmall">Enter AI API Key</span>
              </div>
            </div>
          </div>
        </div>

        <div id="content-holder" className="left-open right-open">
          <div className="content-body">
            <div className="inner" ref={innerChatBoxRef}>
              {activeChatId !== "" ? (
                activeChat?.messages?.map((message) => {
                  if (!message.authorId) {
                    return (
                      <AiChatMessage message={message.text} key={message.id} />
                    );
                  } else {
                    return (
                      <ChatMessage message={message.text} key={message.id} />
                    );
                  }
                })
              ) : (
                <ChatMessage
                  message={"Start a new Conversation by sending a message"}
                />
              )}
              <div
                style={{
                  float: "left",
                  clear: "both",
                }}
                ref={innerChatBoxRef}
              ></div>
            </div>
          </div>

          <div className="content-footer py-4">
            <div className="row justify-content-center">
              <div className="col-xxl-8 col-sm-10 col-11">
                <div className="d-flex pb-3 justify-content-center">
                  <button className="btn btn-outline-secondary btn-sm d-flex align-items-center mx-1">
                    <span className="icon icon-renew me-2"></span>
                    <span className="text">Regenerate response</span>
                  </button>

                  <button className="btn btn-outline-secondary btn-sm d-flex align-items-center mx-1">
                    <span className="icon icon-refund me-2"></span>
                    <span className="text">Reset Chat</span>
                  </button>
                </div>
                <div className="d-flex">
                  <span className="icon icon-paper-clip icon-md me-2 mt-3"></span>

                  <div className="flex-grow-1">
                    <div className="input-group chat-ai">
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="chat-ai"
                        placeholder="Next question is...."
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter") return;
                          submitNewMessage();
                        }}
                        value={message}
                        disabled={isSendingMessage}
                      />

                      <span className="input-group-text" id="basic-addon1">
                        <button className="btn-nostyle">
                          <span className="icon icon-md icon-microphone"></span>
                        </button>
                      </span>
                    </div>
                    <div className="text-xsmall text-muted mt-1 d-flex flex-column flex-sm-row flex-lg-column flex-xl-row align-items-center align-items-sm-baseline align-items-lg-center align-items-xl-baseline">
                      <div className="me-3">Current message: 25 words</div>

                      <div className="me-3">Total chat: 100 words</div>

                      <div className="me-3">Estimated cost: $ 25</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
              <div
                className="inner tab-pane p-0 container active"
                id="ai-characters"
              >
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
                    <span className="icon icon-plus me-2"></span>
                    <span className="text">Add Character</span>
                  </button>
                </div>
                <div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-1"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn-1"
                    >
                      <span className="icon icon-face me-2" />
                      Stand Up Comedian
                    </label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-2"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn-2"
                    >
                      <span className="icon icon-face me-2"></span>
                      Nutritionist
                    </label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-3"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn-3"
                    >
                      <span className="icon icon-face me-2"></span>
                      Life Coach
                    </label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-4"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn-4"
                    >
                      <span className="icon icon-face me-2"></span>
                      Career Consular
                    </label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-5"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn-5"
                    >
                      <span className="icon icon-face me-2"></span>
                      Travel Advisor
                    </label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-6"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn-6"
                    >
                      <span className="icon icon-face me-2"></span>
                      Personal Trainer
                    </label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-06"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn-06"
                    >
                      <span className="icon icon-face me-2"></span>
                      Product Manager
                    </label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-7"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn-7"
                    >
                      <span className="icon icon-face me-2"></span>
                      Life Hacker
                    </label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-8"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn-8"
                    >
                      <span className="icon icon-face me-2"></span>
                      Financial Advisor
                    </label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-9"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn-9"
                    >
                      <span className="icon icon-face me-2"></span>
                      Software Developer
                    </label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-10"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn-10"
                    >
                      <span className="icon icon-face me-2"></span>
                      Language Tour
                    </label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-11"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn-11"
                    >
                      <span className="icon icon-face me-2"></span>
                      Financial Advisor
                    </label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-12"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn-12"
                    >
                      <span className="icon icon-face me-2"></span>
                      Software Developer
                    </label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-13"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn-13"
                    >
                      <span className="icon icon-face me-2"></span>
                      Language Tour
                    </label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-14"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn-14"
                    >
                      <span className="icon icon-face me-2"></span>
                      Financial Advisor
                    </label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-15"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn-15"
                    >
                      <span className="icon icon-face me-2"></span>
                      Software Developer
                    </label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-16"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn-16"
                    >
                      <span className="icon icon-face me-2"></span>
                      Language Tour
                    </label>
                  </div>
                </div>
              </div>

              <div className="inner tab-pane p-0 container" id="prompts">
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
                    <span className="icon icon-plus me-2"></span>
                    <span className="text">Add Prompt</span>
                  </button>
                </div>
                <div>
                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn2-1"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn2-1"
                    >
                      <span className="icon icon-propt me-2"></span>
                      Language Detector
                    </label>
                  </div>

                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn2-2"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn2-2"
                    >
                      <span className="icon icon-propt me-2"></span>
                      JavaScript Console
                    </label>
                  </div>

                  <div className="mb-2">
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn2-3"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
                      htmlFor="btn2-3"
                    >
                      <span className="icon icon-propt me-2"></span>
                      Midjourney Prompt
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <div className="row g-1 m-0">
                  <div className="col-sm-6 mb-1">
                    <button type="button" className="btn w-100 btn-primary">
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
                  <span className="icon icon-propt me-3"></span>
                  Create Prompt
                </h4>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="prompt-title" className="form-label">
                    Title:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="prompt-title"
                    placeholder="Type title here"
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
                  ></textarea>
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
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <div className="row g-1 m-0">
                  <div className="col-sm-6 mb-1">
                    <button type="button" className="btn w-100 btn-primary">
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
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      data-bs-toggle="pill"
                      href="#settings-backup"
                    >
                      Backup & Sync
                    </a>
                  </li>
                </ul>
              </div>
              <div className="modal-body">
                <div className="tab-content">
                  <div className="tab-pane active" id="settings-general">
                    <section className="mb-5">
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
                        Each browser has a different limit of how much data you
                        can store, the general limit is{" "}
                        <span className="text-black">5MB</span>. If you are
                        running out of space, you can delete ome of your old
                        chats.
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
                          <span className="text-muted">Used:</span> 0.00 MB
                          (0.00%)
                        </div>

                        <div>
                          <span className="text-muted">Available:</span> 5.00 MB
                        </div>
                      </div>

                      <p className="mt-2 text-xsmall">
                        Please export and backup your chats regularly to avoid
                        data lost!
                      </p>

                      <a className="btn btn-primary mt-2">
                        Setup Backup & Sync
                      </a>
                    </section>

                    <section className="mb-5">
                      <h5 className="text-normal fw-bold">Voice Input</h5>
                      <p className="text-muted text-xsmall mb-2">
                        Microphone access is needed for voice input
                      </p>

                      <div className="mb-2">
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
                        <label className="text-xsmall mb-2">
                          Output Language
                        </label>
                        <select
                          className="form-select"
                          aria-label="Output Language"
                          defaultValue={0}
                        >
                          <option value="0">English US</option>
                          <option value="1">English UK</option>
                          <option value="2">French FR</option>
                        </select>
                      </div>

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
                        <label className="text-xsmall mb-2">
                          Writing Style
                        </label>
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
                        <label className="text-xsmall mb-2">
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
                          1/10th the cost of text-davinci-003. Will be updated
                          with our latest model iteration.
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
                        You are ChatGPT, a large language model trained by
                        OpenAI.
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
                        while lower values like 0.2 will make it more focused
                        and deterministic
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

                  <div className="tab-pane" id="settings-backup">
                    <section className="mb-5">
                      <h5 className="text-normal fw-bold">Local Storage</h5>
                      <p className="text-xsmall text-muted">
                        All of your data is stored locally in your browser. Each
                        browser has a different limit of how much data you can
                        store, the general limit is 5MB. If you are running out
                        of space, you can delete some of your old chats
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
                        FutureDesk Cloud provides a cloud storage for your data.
                        You can backup your data to the cloud and sync your data
                        across devices
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
                        Use Google Drive to backup and sync your data across
                        devices
                      </p>
                    </section>
                  </div>
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
      </div>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className={styles.authContainer}>
      <p className={styles.showcaseText}>
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className={styles.loginButton}
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
