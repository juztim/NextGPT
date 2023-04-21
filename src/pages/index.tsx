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
import { OpenAI, OpenAIError } from "openai-streams";
import { useRouter } from "next/router";
import { yieldStream } from "yield-stream";
import CharacterLibraryModal from "~/components/modals/characterLibraryModal";
import PromptLibraryModal from "~/components/modals/promptLibraryModal";
import useAutosizeTextArea from "~/hooks/useAutosizeTextArea";
import JsPdf from "jspdf";
import { NavDropdown } from "react-bootstrap";
import AboutModal from "~/components/modals/about";
import FAQModal from "~/components/modals/faq";
import TermsModal from "~/components/modals/terms";
import PrivacyModal from "~/components/modals/privacy";
import useEnsurePremium from "~/hooks/useEnsurePremium";
import UpsellModal from "~/components/modals/upsellModal";
import { DndContext, rectIntersection } from "@dnd-kit/core";

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
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [message, setMessage] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState<string>();
  const { ensurePremium } = useEnsurePremium();

  const settingsStore = useSettingsStore();

  useAutosizeTextArea(textAreaRef.current, message);

  const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = evt.target?.value;

    setMessage(val);
  };

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

  const { mutate: createImage, isLoading: generatingImage } =
    api.prodia.create.useMutation({
      onError(error) {
        console.log(error);
        toast.error("Error generating image");
      },
      onSuccess(imageUrl) {
        addMessage({
          newMessage: `![Generated Image](${imageUrl})`,
          botMessage: true,
          conversationId: activeChatId,
        });
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

  const generateImage = () => {
    const prompt = message.toLowerCase().split("/imagine")[1];
    if (!prompt || prompt.trim() === "") {
      toast.error("Please enter a prompt");
      return;
    }
    addMessage({
      newMessage: message,
      conversationId: activeChatId,
    });
    setMessage("");
    createImage({
      prompt: prompt.trim(),
    });
  };

  const submitNewMessage = async () => {
    if (message.trim() === "") {
      console.log("Message is empty");
      return;
    }
    if (streamedMessage !== null) {
      console.log("Message is already being generated");
      return;
    }
    if (!session?.user.apiKey) {
      toast.error("Please enter your OpenAI API key");
      editApiKeyRef.current?.click();
      return;
    }
    if (activeChatId === "") {
      await createChat();
    }

    if (message.toLowerCase().startsWith("/imagine")) {
      void generateImage();
      return;
    }

    addMessage({
      newMessage: message,
      conversationId: activeChatIdRef.current,
    });

    setMessage("");

    resetTranscript();

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
      role: "user",
    });

    messageHistory.unshift({
      content: `Please respect the following instructions. Respond in a ${settingsStore.tone}. Use the following writing style: ${settingsStore.writingStyle}. Additionally I want you to format your response as ${settingsStore.format}. Reply in ${settingsStore.outputLanguage}.}`,
      role: "user",
    });

    if (selectedCharacter && selectedCharacter.instructions) {
      messageHistory.unshift({
        content: selectedCharacter.instructions,
        role: "user",
      });
    }

    try {
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
    } catch (e) {
      if (e instanceof OpenAIError) {
        toast.error(e.message);
      } else {
        toast.error("Unknown error generating message");
      }
      setStreamedMessage(null);
    } finally {
      stopGenerating.current = false;
    }
  };

  const regenerateMessage = async (message: string) => {
    toast.success("Regenerating message");
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

    // we want to remove all assistant messages until the last user message
    const lastUserMessageIndex = messageHistory
      .map((message) => message.role)
      .lastIndexOf("user");

    messageHistory.splice(
      lastUserMessageIndex + 1,
      messageHistory.length - lastUserMessageIndex - 1
    );

    messageHistory.push({ content: message, role: "assistant" });

    messageHistory.unshift({
      content: settingsStore.initialInstructions,
      role: "user",
    });

    messageHistory.unshift({
      content: `Please respect the following instructions. Respond in a ${settingsStore.tone}. Use the following writing style: ${settingsStore.writingStyle}. Additionally I want you to format your response as ${settingsStore.format}. Reply in ${settingsStore.outputLanguage}.}`,
      role: "user",
    });

    if (selectedCharacter && selectedCharacter.instructions) {
      messageHistory.unshift({
        content: selectedCharacter.instructions,
        role: "user",
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

  const handleScroll = () => {
    if (!innerChatBoxRef.current) return;

    const { scrollTop, clientHeight, scrollHeight } = innerChatBoxRef.current;

    setAutoScroll(scrollTop + clientHeight + 50 >= scrollHeight);
  };

  // If the user is not logged in, show the login page
  useEffect(() => {
    if (status !== "authenticated" && status !== "loading") {
      // log out the entire url
      console.log(window.location.href);
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
    //innerChatBoxRef.current && autoAnimate(innerChatBoxRef.current);
  }, [innerChatBoxRef]);

  useEffect(() => {
    chatControlRef.current && autoAnimate(chatControlRef.current);
  }, [chatControlRef]);

  useEffect(() => {
    if (chatPlaceHolderRef.current && autoScroll) {
      chatPlaceHolderRef.current.scrollIntoView({
        behavior: "auto",
      });
    }
  }, [
    activeChatId,
    activeChat?.messages.length,
    streamedMessage,
    autoScroll,
    generatingImage,
  ]);

  useEffect(() => {
    if (chatPlaceHolderRef.current) {
      chatPlaceHolderRef.current.scrollIntoView({
        behavior: "auto",
      });
    }
  }, [activeChatId]);

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
      <DndContext
        collisionDetection={rectIntersection}
        onDragEnd={(e) => {
          console.log("drag end");
          const chatId = e.active?.id.toString();
          const folderId = e.over?.id.toString();
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const oldFolderId = e.active.data.current?.folder ?? "ungrouped";
          if (chatId && folderId) {
            if (folderId === oldFolderId) return;
            if (e.active.data.current?.folder === folderId) return;
            moveChat({
              folderId: folderId === "ungrouped" ? undefined : folderId,
              id: chatId,
            });
          }
        }}
      >
        <header className="header fixed-top">
          <nav className="navbar">
            <div className="container-fluid">
              <a className="navbar-brand d-inline-flex" href="#">
                <Image
                  src={Logo}
                  alt="Futuredesk Logo"
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
                        <a className="dropdown-item" href="#">
                          Usage
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#">
                          Members
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#">
                          Settings
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#">
                          Customization
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
                    <NavDropdown
                      title={
                        <div className="nav-item">
                          <span
                            className="icon icon-info"
                            style={{
                              fontSize: "1.3rem",
                            }}
                          />
                        </div>
                      }
                    >
                      <NavDropdown.Item
                        onClick={() => {
                          setShowInfoModal("About");
                        }}
                      >
                        <span>About</span>
                      </NavDropdown.Item>
                      <NavDropdown.Item
                        onClick={() => {
                          setShowInfoModal("FAQ");
                        }}
                      >
                        <span>FAQ</span>
                      </NavDropdown.Item>
                      <NavDropdown.Item
                        onClick={() => {
                          setShowInfoModal("Terms");
                        }}
                      >
                        <span>Terms</span>
                      </NavDropdown.Item>
                      <NavDropdown.Item
                        onClick={() => {
                          setShowInfoModal("Privacy");
                        }}
                      >
                        <span>Privacy</span>
                      </NavDropdown.Item>
                      <NavDropdown.Item
                        onClick={() => {
                          setShowInfoModal("Contact");
                        }}
                      >
                        <span>Contact</span>
                      </NavDropdown.Item>
                    </NavDropdown>
                  </li>
                  {/*<li className="nav-item">*/}
                  {/*  <a className="nav-link">*/}
                  {/*    <span className="icon icon-mute"></span>*/}
                  {/*  </a>*/}
                  {/*</li>*/}
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
                <ClearAllChats
                  onClearChats={() => {
                    stopGenerating.current = true;
                    setActiveChatId("");
                    setStreamedMessage(null);
                    setMessage("");
                  }}
                />
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
            {!!selectedCharacter && (
              <>
                <div
                  style={{
                    width: "100%",
                  }}
                  className="d-flex justify-content-center align-items-center p-4 sticky-top"
                >
                  <div
                    style={{
                      background: "#7436DA",
                      padding: "10px 20px",
                      borderRadius: "10px",
                    }}
                  >
                    You are chatting with {selectedCharacter.name}
                    <button
                      className="btn-nostyle"
                      style={{
                        paddingLeft: "10px",
                      }}
                      onClick={() => {
                        setSelectedCharacter(undefined);
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </>
            )}
            <div className="content-body">
              <div
                className="inner"
                ref={innerChatBoxRef}
                onScroll={handleScroll}
              >
                {activeChat?.messages?.map((message) => {
                  if (!message.authorId) {
                    return (
                      <AiChatMessage
                        message={message.text}
                        key={message.id}
                        controls
                      />
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

                {!!streamedMessage && (
                  <AiChatMessage message={streamedMessage} />
                )}

                {generatingImage && (
                  <AiChatMessage message="Generating image..." />
                )}

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
                        setStreamedMessage(null);
                      }}
                    >
                      <span className="icon icon-delete me-2"></span>
                      <span className="text">Reset Chat</span>
                    </button>

                    {!!activeChat && !!activeChat.name && (
                      <>
                        <button
                          className="btn btn-outline-secondary btn-sm d-flex align-items-center mx-1"
                          onClick={() => {
                            if (!ensurePremium()) return;
                            const doc = new JsPdf("p", "pt", "a4");
                            doc.setFontSize(18);
                            doc.text(activeChat.name ?? "New Chat", 40, 40);
                            doc.setFontSize(12);
                            doc.text("Messages", 40, 60);
                            doc.setFontSize(10);
                            const messages = activeChat.messages;
                            let y = 80;
                            for (let i = 0; i < messages.length; i++) {
                              const message = messages[i];
                              const text = message?.text;
                              if (!text) continue;
                              const author = message?.authorId
                                ? "You"
                                : "FutureDesk";
                              const textToDisplay = `${author}: ${text}`;
                              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                              const textLines: string[] = doc.splitTextToSize(
                                textToDisplay,
                                500
                              );
                              if (y + textLines.length * 10 > 800) {
                                doc.addPage();
                              }
                              doc.text(textLines, 40, y);
                              y += textLines.length * 10 + 10;
                            }

                            doc.save(activeChat.name ?? "New Chat" + ".pdf");
                          }}
                        >
                          <span className="icon icon-export me-2"></span>
                          <span className="text">Export Chat</span>
                        </button>
                      </>
                    )}
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
                        <textarea
                          className="form-control form-control-lg"
                          style={{
                            resize: "none",
                          }}
                          rows={1}
                          id="chat-ai"
                          ref={textAreaRef}
                          placeholder="Send a message..."
                          onChange={handleChange}
                          onKeyDown={(e) => {
                            if (e.shiftKey) return;
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void submitNewMessage();
                            }
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

          <UpsellModal />

          <AboutModal
            show={showInfoModal === "About"}
            onHide={() => setShowInfoModal(undefined)}
          />

          <FAQModal
            show={showInfoModal === "FAQ"}
            onHide={() => {
              setShowInfoModal(undefined);
            }}
          />

          <TermsModal
            show={showInfoModal === "Terms"}
            onHide={() => {
              setShowInfoModal(undefined);
            }}
          />

          <PrivacyModal
            show={showInfoModal === "Privacy"}
            onHide={() => {
              setShowInfoModal(undefined);
            }}
          />
        </div>
      </DndContext>
    </>
  );
};

export default Home;
