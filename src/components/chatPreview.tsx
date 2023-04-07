import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";

const ChatPreview = ({
  id,
  name,
  favored,
  onChatOpen,
  onDeleteChat,
  refreshChats,
}: {
  id: string;
  name?: string | null;
  favored?: boolean;
  onChatOpen: (id: string) => void;
  onDeleteChat: (id: string) => void;
  refreshChats: () => void;
}) => {
  const [editingChatName, setEditingChatName] = useState(false);
  const chatNameInputRef = useRef<HTMLInputElement | null>(null);
  const [chatName, setChatName] = useState(name ?? "New Chat");

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

  return (
    <div className="pt-3 px-3 pb-2" style={{ cursor: "pointer" }}>
      <div className="row g-1">
        <div className="col-9" onClick={() => onChatOpen(id)}>
          <span className={`icon icon-${favored ? "star" : "chat"} me-2`} />
          <input
            type="text"
            className="text"
            value={chatName}
            style={{
              background: "transparent",
              color: "white",
              border: "none",
              width: "inherit",
            }}
            disabled={!editingChatName}
            ref={chatNameInputRef}
            onBlur={() => {
              if (editingChatName) {
                updateChat({ id, name: chatName });
              }
              setEditingChatName(false);
            }}
            onChange={(e) => setChatName(e.target.value.trim())}
          />
        </div>
        <div className="col-3 d-flex align-items-center justify-content-end">
          <button className="btn-nostyle px-2">
            <span
              className="icon icon-edit"
              onClick={() => setEditingChatName(!editingChatName)}
            />
          </button>
          <button className="btn-nostyle px-2">
            <span
              className="icon icon-delete"
              onClick={() => onDeleteChat(id)}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPreview;
