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
import { DragDropContext } from "react-beautiful-dnd";
import PromptOverview from "~/components/promptOverview";
import CreateCharacterModal from "~/components/modals/createCharacterModal";
import CreatePromptModal from "~/components/modals/createPromptModal";
import type { Character } from "@prisma/client";
import SettingsModal from "~/components/modals/settingsModal";
import ApiKeyModal from "~/components/modals/apiKeyModal";
import ClearAllChats from "~/components/clearAllChatsBtn";
import { useSettingsStore } from "~/stores/settingsStore";

const Home: NextPage = () => {
  const [activeChatId, setActiveChatId] = useState<string>("");
  const ctx = api.useContext();
  const innerChatBoxRef = useRef<HTMLDivElement | null>(null);
  const { data: session, status } = useSession();
  const [selectedCharacter, setSelectedCharacter] = useState<Character>();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [cost, setCost] = useState(0);

  const settingsStore = useSettingsStore();

  const { data: settings } = api.openAi.getSettings.useQuery(undefined, {
    onError: (err) => {
      console.log(err);
      toast.error("Error loading settings");
    },
    onSuccess: (data) => {
      settingsStore.saveSettings({
        format: data?.format ?? "",
        temperature: data?.temperature ?? 0.5,
        tone: data?.tone ?? "",
        writingStyle: data?.writingStyle ?? "",
      });
    },
  });

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
            e.message ?? "Error sending message, please try again later"
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

  const { mutate: createFolder, isLoading: creatingNewFolder } =
    api.openAi.newFolder.useMutation({
      onError: (err) => {
        console.log(err);
        toast.error("Error creating folder");
      },
      onSuccess: () => {
        toast.success("Folder created");
        void ctx.openAi.getAllChats.refetch();
      },
    });

  const { mutate: moveChat } = api.openAi.move.useMutation({
    onError: (err) => {
      console.log(err);
      toast.error("Error updating chat");
    },
    onSuccess: () => {
      toast.success("Chat updated");
      void ctx.openAi.getAllChats.refetch();
    },
  });

  const { mutate: clearChat } = api.openAi.clearChat.useMutation({
    onError: (err) => {
      console.log(err);
      toast.error("Error clearing chat");
    },
    onSuccess: () => {
      toast.success("Chat cleared");
      void ctx.openAi.getChat.refetch({ id: activeChatId });
    },
  });

  const [message, setMessage] = useState("");

  const submitNewMessage = () => {
    sendMessage({
      conversationId: activeChatId,
      newMessage: message,
      prompt: selectedCharacter?.instructions ?? undefined,
      settings: {
        temperature: settings?.temperature ?? 0.5,
        format: settings?.format ?? "text",
        writingStyle: settings?.writingStyle ?? "default",
        tone: settings?.tone ?? "default",
      },
    });
  };

  // If the user is not logged in, show the login page
  useEffect(() => {
    if (status !== "authenticated" && status !== "loading") {
      void signIn();
    }
  }, [status]);

  useEffect(() => {
    const costPerWord = 1000 / 750;
    const wordCount = activeChat?.messages
      ? activeChat.messages
          .map((m) => m.text)
          .join(" ")
          .trim()
          .split(" ").length +
        activeChat.messages.length -
        1
      : 0;
    const tokens = wordCount * costPerWord;
    const cost = (tokens * 0.002) / 100;
    setCost(Number(cost.toFixed(2)));
  }, [activeChat?.messages]);

  return (
    <>
      <DragDropContext
        onDragEnd={(e) => {
          if (e.destination) {
            const folder =
              e.destination.droppableId == "ungrouped"
                ? undefined
                : e.destination.droppableId;
            moveChat({
              id: e.draggableId,
              folderId: folder,
            });
          }
        }}
        onDragStart={() => undefined}
      >
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
                      <span className="d-none d-sm-inline">
                        {session?.user.name}
                      </span>
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
                  <button
                    className="btn-nostyle"
                    onClick={() => {
                      createFolder({
                        name: "New Folder",
                      });
                    }}
                    disabled={creatingNewFolder}
                  >
                    <span className="icon icon-folder-plus" />
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
                    title="General"
                    onChatOpen={setActiveChatId}
                    conversations={chats?.ungroupedChats}
                    index={9999}
                    onChatDelete={(id) => deleteChat({ id })}
                    refreshChats={() => void ctx.openAi.getAllChats.refetch()}
                    id="ungrouped"
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
                      id={folder.id}
                    />
                  ))}
                </div>
              </div>
              <div className="menu-body-bottom py-3">
                <ClearAllChats />
              </div>
            </div>

            <div className="menu-footer py-3 border-top">
              <div className="row g-2">
                <div className="col-7">
                  <a
                    href="#"
                    className="link-with-icon d-flex align-items-center text-xsmall"
                    onClick={() => setShowApiKeyModal(true)}
                  >
                    <span className="icon text-accent icon-shild-info me-2 text-big"></span>
                    <span className="text">
                      {session?.user.apiKey ? "Edit" : "Enter"} OpenAI Key
                    </span>
                  </a>
                </div>
                <div className="col-5">
                  <span className="text-muted text-xsmall">
                    {session?.user.apiKey ? "Edit" : "Enter"} OpenAI Key
                  </span>
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
                        <AiChatMessage
                          message={message.text}
                          key={message.id}
                        />
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

                    <button
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center mx-1"
                      onClick={() => {
                        clearChat({ id: activeChatId });
                      }}
                    >
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
                        <div className="me-3">
                          Current message: {message.trim().split(" ").length}{" "}
                          words
                        </div>

                        <div className="me-3">
                          Total chat:{" "}
                          {activeChat?.messages
                            ? activeChat.messages
                                .map((m) => m.text)
                                .join(" ")
                                .trim()
                                .split(" ").length +
                              activeChat.messages.length -
                              1
                            : 0}{" "}
                          words
                        </div>

                        <div className="me-3">Estimated cost: {cost}$</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <PromptOverview
              onOpenPrompt={(prompt) => {
                toast.success("Prompt loaded");
                setMessage(prompt.instructions);
              }}
              activeCharacter={selectedCharacter}
              onSelectCharacter={(character) => {
                setSelectedCharacter(character);
              }}
            />
          </div>

          <CreateCharacterModal />

          <CreatePromptModal />

          <SettingsModal />

          <ApiKeyModal show={showApiKeyModal} setShow={setShowApiKeyModal} />
        </div>
      </DragDropContext>
    </>
  );
};

export default Home;
