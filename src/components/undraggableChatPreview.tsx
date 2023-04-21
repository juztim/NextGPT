import type { Conversation } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";

const UndraggableChatPreview = ({
  conversation,
  onChatOpen,
  onDeleteChat,
  refreshChats,
}: {
  conversation: Conversation;
  onChatOpen: (id: string) => void;
  onDeleteChat: (id: string) => void;
  refreshChats: () => void;
}) => {
  const [editingChatName, setEditingChatName] = useState(false);
  const chatNameInputRef = useRef<HTMLInputElement | null>(null);
  const [chatName, setChatName] = useState(conversation.name ?? "New Chat");

  const { mutate: updateChat } = api.openAi.update.useMutation({
    onSuccess: () => {
      toast.success("Chat updated");
      refreshChats();
    },
    onError: (error) => {
      toast.error("Error while updating chat");
      console.error(error);
    },
  });

  useEffect(() => {
    chatNameInputRef.current?.focus();
  }, [editingChatName]);

  useEffect(() => {
    setChatName(conversation.name ?? "New Chat");
  }, [conversation.name]);

  return (
    <div className="pt-3 px-3 pb-2" style={{ cursor: "pointer" }}>
      <div className="row g-1">
        <div
          className="col-9"
          onClick={(e) => {
            e.stopPropagation();
            onChatOpen(conversation.id);
          }}
        >
          <span
            className={`icon icon-${
              conversation.favored ? "star" : "chat"
            } me-2`}
            style={{
              cursor: "pointer",
              color: conversation.favored ? "yellow" : "white",
            }}
            onClick={(e) => {
              e.stopPropagation();
              updateChat({
                id: conversation.id,
                favorite: !conversation.favored,
              });
            }}
          />
          <input
            type="text"
            className="text"
            value={chatName}
            style={{
              background: "transparent",
              color: "white",
              border: "none",
              width: "inherit",
              pointerEvents: editingChatName ? "auto" : "none",
            }}
            disabled={!editingChatName}
            ref={chatNameInputRef}
            onChange={(e) => setChatName(e.target.value.trim())}
          />
        </div>
        <div className="col-3 d-flex align-items-center justify-content-end">
          {editingChatName ? (
            <>
              <span
                className="icon icon-x me-3"
                style={{
                  color: "red",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingChatName(false);
                }}
              />
              <span
                className="icon icon-check me-3"
                style={{
                  color: "green",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  updateChat({ id: conversation.id, name: chatName });
                  setEditingChatName(false);
                }}
              />
            </>
          ) : (
            <>
              <button className="btn-nostyle px-2">
                <span
                  className="icon icon-edit"
                  onClick={() => setEditingChatName(!editingChatName)}
                />
              </button>
              <button className="btn-nostyle px-2">
                <span
                  className="icon icon-delete"
                  onClick={() => onDeleteChat(conversation.id)}
                />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UndraggableChatPreview;
