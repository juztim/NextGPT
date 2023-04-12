import type { Conversation } from "@prisma/client";
import ChatPreview from "./chatPreview";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { Droppable } from "react-beautiful-dnd";
import { useEffect, useRef, useState } from "react";

declare module "react" {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // extends React's HTMLAttributes
    href?: string;
  }
}

const ChatFolder = ({
  id,
  title,
  conversations,
  index,
  onChatOpen,
  onChatDelete,
  refreshChats,
  searchFilter,
}: {
  id: string;
  title: string;
  conversations?: Conversation[];
  index: number;
  onChatOpen: (id: string) => void;
  onChatDelete: (id: string) => void;
  refreshChats: () => void;
  searchFilter: string;
}) => {
  const [editingFolderName, setEditingFolderName] = useState(false);
  const [folderName, setFolderName] = useState(title ?? "New Chat");
  const folderNameInputRef = useRef<HTMLInputElement | null>(null);
  const [requireDeleteConfirmation, setRequireDeleteConfirmation] =
    useState(false);
  const [requireEditConfirmation, setRequireEditConfirmation] = useState(false);

  const { mutate: updateFolder } = api.openAi.updateFolder.useMutation({
    onSuccess: () => {
      toast.success("Folder updated");
      refreshChats();
      setEditingFolderName(false);
      setRequireEditConfirmation(false);
    },
    onError: (error) => {
      toast.error("Error while updating folder");
      console.error(error);
    },
  });

  const { mutate: deleteFolder } = api.openAi.deleteFolder.useMutation({
    onSuccess: () => {
      toast.success("Folder deleted");
      refreshChats();
      setRequireDeleteConfirmation(false);
    },
    onError: (error) => {
      toast.error("Error while deleting folder");
      console.error(error);
    },
  });

  useEffect(() => {
    editingFolderName && folderNameInputRef.current?.focus();
  }, [editingFolderName, requireEditConfirmation]);

  return (
    <Droppable droppableId={id}>
      {(provided) => (
        <div
          className="folder mb-2"
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          <div className="folder-toggle p-3">
            <div className="row g-1">
              <div
                className="col-9 folder-trigger"
                data-bs-toggle="collapse"
                href={`#folder-${index}`}
                role="button"
                aria-expanded="true"
                aria-controls={`folder-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span className="icon icon-folder me-2" />

                <input
                  type="text"
                  className="text"
                  value={folderName}
                  style={{
                    background: "transparent",
                    color: "white",
                    border: "none",
                    width: "inherit",
                    pointerEvents: editingFolderName ? "auto" : "none",
                  }}
                  disabled={!editingFolderName}
                  ref={folderNameInputRef}
                  onChange={(e) => setFolderName(e.target.value)}
                />
                <span className="icon icon-chevron-down" />
                <span className="text-muted">({conversations?.length})</span>
              </div>
              <div className="col-3 d-flex align-items-center justify-content-end">
                {requireDeleteConfirmation ? (
                  <>
                    <button
                      className="btn-nostyle px-2"
                      disabled={id === "ungrouped"}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFolder({ id });
                      }}
                    >
                      <span
                        className="icon icon-check"
                        style={{ color: "green" }}
                      />
                    </button>
                    <button
                      className="btn-nostyle px-2"
                      disabled={id === "ungrouped"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRequireDeleteConfirmation(false);
                      }}
                    >
                      <span className="icon icon-x" style={{ color: "red" }} />
                    </button>
                  </>
                ) : requireEditConfirmation ? (
                  <>
                    <button
                      className="btn-nostyle px-2"
                      disabled={id === "ungrouped"}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateFolder({ id, name: folderName });
                      }}
                    >
                      <span
                        className="icon icon-check"
                        style={{ color: "green" }}
                      />
                    </button>
                    <button
                      className="btn-nostyle px-2"
                      disabled={id === "ungrouped"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRequireEditConfirmation(false);
                        setEditingFolderName(false);
                      }}
                    >
                      <span className="icon icon-x" style={{ color: "red" }} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn-nostyle px-2"
                      disabled={id === "ungrouped"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFolderName(true);
                        setRequireEditConfirmation(true);
                      }}
                    >
                      {id !== "ungrouped" && (
                        <span className="icon icon-edit" />
                      )}
                    </button>
                    <button
                      className="btn-nostyle px-2"
                      disabled={id === "ungrouped"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRequireDeleteConfirmation(true);
                      }}
                    >
                      {id !== "ungrouped" && (
                        <span className="icon icon-trash" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="folder-chat collapse" id={`folder-${index}`}>
            {conversations
              ?.filter((c) => {
                if (searchFilter === "") {
                  return true;
                }
                if (c.name == null) {
                  return false;
                }
                return c.name
                  .toLowerCase()
                  .includes(searchFilter.toLowerCase());
              })
              .map((conversation, index) => (
                <ChatPreview
                  key={conversation.id}
                  conversation={conversation}
                  onChatOpen={onChatOpen}
                  onDeleteChat={onChatDelete}
                  refreshChats={refreshChats}
                  index={index}
                />
              ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default ChatFolder;
