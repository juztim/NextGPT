import { type NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
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
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import autoAnimate from "@formkit/auto-animate";
import UndraggableChatPreview from "~/components/undraggableChatPreview";
import { OpenAI } from "openai-streams";
import { useRouter } from "next/router";
import { yieldStream } from "yield-stream";
import CharacterLibraryModal from "~/components/modals/characterLibraryModal";
import PromptLibraryModal from "~/components/modals/promptLibraryModal";

const Home: NextPage = () => {
  const [activeChatId, setActiveChatId] = useState<string>("");
  const ctx = api.useContext();
  const innerChatBoxRef = useRef<HTMLDivElement | null>(null);
  const { data: session, status } = useSession();
  const [selectedCharacter, setSelectedCharacter] = useState<Character>();
  const [cost, setCost] = useState(0);
  const [searchFilter, setSearchFilter] = useState("");
  const chatPlaceHolderRef = useRef<HTMLDivElement | null>(null);
  const [conversationWordCount, setConversationWordCount] = useState(0);
  const [streamedMessage, setStreamedMessage] = useState<string | null>(null);
  const router = useRouter();
  const chatControlRef = useRef<HTMLDivElement | null>(null);
  const stopGenerating = useRef(false);
  const activeChatIdRef = useRef<string>("");
  const editApiKeyRef = useRef<HTMLAnchorElement | null>(null);

  const settingsStore = useSettingsStore();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

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
        outputLanguage: data?.outputLanguage ?? "",
        initialInstructions: data?.initialInstructions ?? "",
        showWordCount: data?.showWordCount ?? false,
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

  const { mutate: generateTitle } = api.openAi.getTitle.useMutation({
    onError(error) {
      console.log(error);
      toast.error("Error generating title");
    },
    onSuccess() {
      void ctx.openAi.getAllChats.invalidate();
      void ctx.openAi.getChat.invalidate();
    },
  });

  const { mutate: addMessage, isLoading: isSendingMessage } =
    api.openAi.addMessage.useMutation({
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
      onSuccess: async (data) => {
        if (data?.firstMessage) {
          void generateTitle({ id: data.conversationId, message });
        }
        setMessage("");
        await ctx.openAi.getChat.refetch({ id: activeChatId });
        if (data?.botMessage) {
          setStreamedMessage(null);
        }
        await ctx.openAi.getAllChats.refetch();
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
      stopGenerating.current = false;
      void ctx.openAi.getChat.refetch({ id: activeChatId });
    },
  });

  const { mutateAsync: createChat, isLoading: creatingNewChat } =
    api.openAi.createConversation.useMutation({
      onError: (err) => {
        console.log(err);
        toast.error("Error creating conversation");
      },
      onSuccess: (data) => {
        toast.success("Conversation created");
        activeChatIdRef.current = data.conversationId;
        setActiveChatId(data.conversationId);
        void ctx.openAi.getAllChats.refetch();
      },
    });

  const [message, setMessage] = useState("");

  const submitNewMessage = async () => {
    if (!session?.user.apiKey) {
      toast.error("Please enter your OpenAI API key");
      editApiKeyRef.current?.click();
      return;
    }
    if (activeChatId === "") {
      await createChat();
    }

    addMessage({
      newMessage: message,
      conversationId: activeChatIdRef.current,
    });

    const messageHistory:
      | {
          content: string;
          role: "user" | "system" | "assistant";
        }[]
      | undefined = activeChat?.messages.map((message) => {
      return {
        content: message.text,
        role: message.authorId === session.user.id ? "user" : "assistant",
      };
    }) ?? [{ content: message, role: "user" }];

    messageHistory.push({ content: message, role: "user" });

    messageHistory.unshift({
      content: settingsStore.initialInstructions,
      role: "system",
    });

    messageHistory.unshift({
      content: `Please respect the following instructions. Respond in a ${settingsStore.tone}. Use the following writing style: ${settingsStore.writingStyle}. Additionally I want you to format your response as ${settingsStore.format}. Reply in ${settingsStore.outputLanguage}.}`,
      role: "system",
    });

    if (selectedCharacter && selectedCharacter.instructions) {
      messageHistory.unshift({
        content: selectedCharacter.instructions,
        role: "system",
      });
    }

    const stream = await OpenAI(
      "chat",
      {
        model: "gpt-3.5-turbo",
        messages: messageHistory,
        temperature: settings?.temperature ?? 0.5,
      },
      { apiKey: session.user.apiKey }
    );

    let streamedLocalMessage = "";
    for await (const chunk of yieldStream(stream)) {
      const text = new TextDecoder("utf-8").decode(chunk);

      if (stopGenerating.current) {
        break;
      }

      streamedLocalMessage += text;
      setStreamedMessage(streamedLocalMessage);
    }

    addMessage({
      newMessage: streamedLocalMessage,
      conversationId: activeChatIdRef.current,
      botMessage: true,
    });
    stopGenerating.current = false;
  };

  const regenerateMessage = async (message: string) => {
    const messageHistory:
      | {
          content: string;
          role: "user" | "system" | "assistant";
        }[]
      | undefined = activeChat?.messages.map((message) => {
      return {
        content: message.text,
        role: message.authorId === session?.user.id ? "user" : "assistant",
      };
    }) ?? [{ content: message, role: "user" }];

    messageHistory.push({ content: message, role: "user" });

    messageHistory.unshift({
      content: settingsStore.initialInstructions,
      role: "system",
    });

    messageHistory.unshift({
      content: `Please respect the following instructions. Respond in a ${settingsStore.tone}. Use the following writing style: ${settingsStore.writingStyle}. Additionally I want you to format your response as ${settingsStore.format}. Reply in ${settingsStore.outputLanguage}.}`,
      role: "system",
    });

    if (selectedCharacter && selectedCharacter.instructions) {
      messageHistory.unshift({
        content: selectedCharacter.instructions,
        role: "system",
      });
    }

    const stream = await OpenAI(
      "chat",
      {
        model: "gpt-3.5-turbo",
        messages: messageHistory,
        temperature: settings?.temperature ?? 0.5,
      },
      { apiKey: session?.user.apiKey }
    );

    let streamedLocalMessage = "";
    for await (const chunk of yieldStream(stream)) {
      const text = new TextDecoder("utf-8").decode(chunk);

      if (stopGenerating.current) {
        break;
      }

      streamedLocalMessage += text;
      setStreamedMessage(streamedLocalMessage);
    }

    addMessage({
      newMessage: streamedLocalMessage,
      conversationId: activeChatIdRef.current,
      botMessage: true,
    });
    stopGenerating.current = false;
  };

  const attemptVoiceRecognition = async () => {
    if (listening) {
      SpeechRecognition.stopListening();
      resetTranscript();
      return;
    }
    if (!browserSupportsSpeechRecognition) {
      toast.error("Browser does not support voice recognition");
      return;
    }
    await SpeechRecognition.startListening({
      continuous: true,
      language: "en-US",
    });
  };

  // If the user is not logged in, show the login page
  useEffect(() => {
    if (status !== "authenticated" && status !== "loading") {
      void router.push("/welcome");
    }
  }, [status, router]);

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

  useEffect(() => {
    setMessage(transcript);
  }, [transcript]);

  useEffect(() => {
    innerChatBoxRef.current && autoAnimate(innerChatBoxRef.current);
  }, [innerChatBoxRef]);

  useEffect(() => {
    chatControlRef.current && autoAnimate(chatControlRef.current);
  }, [chatControlRef]);

  useEffect(() => {
    if (chatPlaceHolderRef.current) {
      chatPlaceHolderRef.current.scrollIntoView({
        behavior: "auto",
      });
    }
  }, [activeChatId, activeChat?.messages.length, streamedMessage]);

  useEffect(() => {
    setConversationWordCount(
      activeChat?.messages
        ? activeChat.messages
            .map((m) => m.text)
            .join(" ")
            .trim()
            .split(" ").length +
            activeChat.messages.length -
            1
        : 0
    );
  }, [activeChat, activeChat?.messages]);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

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
              <span>
                {activeChat?.name
                  ? `${activeChat.name} (${activeChat.messages.length} messages)`
                  : "Start a new Chat"}
              </span>
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
                    <a className="nav-link" id="theme">
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
                    onClick={() => {
                      setActiveChatId("");
                    }}
                    disabled={creatingNewChat}
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
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
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
                  {chats?.ungroupedChats
                    .filter((c) => c.favored)
                    .map((c) => (
                      <UndraggableChatPreview
                        conversation={c}
                        onChatOpen={() => setActiveChatId(c.id)}
                        onDeleteChat={() => deleteChat({ id: c.id })}
                        refreshChats={() =>
                          void ctx.openAi.getAllChats.refetch()
                        }
                        key={c.id}
                      />
                    ))}
                  {chats?.groupedChats
                    .flatMap((c) => c.conversations)
                    .filter((c) => c.favored)
                    .map((c) => (
                      <UndraggableChatPreview
                        conversation={c}
                        onChatOpen={() => setActiveChatId(c.id)}
                        onDeleteChat={() => deleteChat({ id: c.id })}
                        refreshChats={() =>
                          void ctx.openAi.getAllChats.refetch()
                        }
                        key={c.id}
                      />
                    ))}
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
                    searchFilter={searchFilter}
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
                      searchFilter={searchFilter}
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
                    data-bs-toggle="modal"
                    data-bs-target="#apiKey"
                    className="link-with-icon d-flex align-items-center text-xsmall"
                    ref={editApiKeyRef}
                  >
                    <span className="icon text-accent icon-shild-info me-2 text-big"></span>
                    <span className="text">
                      {session?.user.apiKey ? "Edit" : "Enter"} OpenAI Key
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div id="content-holder" className="left-open right-open">
            <div className="content-body">
              <div className="inner" ref={innerChatBoxRef}>
                {activeChat?.messages?.map((message) => {
                  if (!message.authorId) {
                    return (
                      <AiChatMessage message={message.text} key={message.id} />
                    );
                  } else {
                    return (
                      <ChatMessage message={message.text} key={message.id} />
                    );
                  }
                })}

                {activeChatId == "" && (
                  <AiChatMessage message="Welcome to FutureDesk! Type your message here to start a new conversation." />
                )}

                {streamedMessage && <AiChatMessage message={streamedMessage} />}
                <div
                  style={{
                    float: "left",
                    clear: "both",
                  }}
                  ref={chatPlaceHolderRef}
                ></div>
              </div>
            </div>

            <div className="content-footer py-4">
              <div className="row justify-content-center">
                <div className="col-xxl-8 col-sm-10 col-11">
                  <div className="d-flex pb-3 justify-content-center">
                    <button
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center mx-1"
                      onClick={() => {
                        if (streamedMessage === null) {
                          const lastReply = activeChat?.messages?.filter(
                            (x) => x.authorId == null
                          )[0];
                          if (lastReply) {
                            void regenerateMessage(lastReply.text);
                          } else {
                            toast.error("There is no response to regenerate");
                          }
                          return;
                        }
                        stopGenerating.current = true;
                      }}
                    >
                      <span
                        className={`icon me-2 ${
                          streamedMessage === null ? "icon-renew" : "icon-x"
                        }`}
                      />
                      <span className="text">
                        {streamedMessage === null || streamedMessage === ""
                          ? "Regenerate response"
                          : "Stop Generating"}
                      </span>
                    </button>

                    <button
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center mx-1"
                      onClick={() => {
                        clearChat({ id: activeChatId });
                        stopGenerating.current = true;
                        setStreamedMessage("");
                      }}
                    >
                      <span className="icon icon-delete me-2"></span>
                      <span className="text">Reset Chat</span>
                    </button>
                  </div>
                  <div className="d-flex">
                    <span
                      className="icon icon-paper-clip icon-md me-2 mt-3"
                      onClick={() => {
                        toast.error("Coming soon!");
                      }}
                      style={{ cursor: "pointer" }}
                    />

                    <div className="flex-grow-1">
                      <div className="input-group chat-ai">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="chat-ai"
                          placeholder="Send a message..."
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key !== "Enter") return;
                            void submitNewMessage();
                          }}
                          value={message}
                          disabled={isSendingMessage}
                        />

                        <span
                          className="input-group-text"
                          id="basic-addon1"
                          ref={chatControlRef}
                        >
                          <button
                            className="btn-nostyle"
                            onClick={() => {
                              void attemptVoiceRecognition();
                            }}
                          >
                            <span
                              className={`icon icon-md ${
                                listening ? "icon-mute" : "icon-mic"
                              }`}
                            />
                          </button>
                          {message.length > 0 && (
                            <button
                              className="btn-nostyle"
                              onClick={() => {
                                void submitNewMessage();
                              }}
                            >
                              <span className="icon icon-md icon-send" />
                            </button>
                          )}
                        </span>
                      </div>
                      {useSettingsStore.getState().showWordCount && (
                        <>
                          <div className="text-xsmall text-muted mt-1 d-flex flex-column flex-sm-row flex-lg-column flex-xl-row align-items-center align-items-sm-baseline align-items-lg-center align-items-xl-baseline">
                            <div className="me-3">
                              Current message:{" "}
                              {message.trim().split(" ").length} words
                            </div>

                            <div className="me-3">
                              Total chat: {conversationWordCount} words
                            </div>

                            <div className="me-3">Estimated cost: {cost}$</div>
                          </div>
                        </>
                      )}
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
                toast.success("Character selected");
                setSelectedCharacter(character);
              }}
            />
          </div>

          <CreateCharacterModal />

          <CharacterLibraryModal />

          <CreatePromptModal />

          <PromptLibraryModal />

          <SettingsModal />

          <ApiKeyModal />
        </div>
      </DragDropContext>
    </>
  );
};

export default Home;
