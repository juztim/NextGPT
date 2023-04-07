import type { Conversation, Message } from "@prisma/client";
import ChatPreview from "./chatPreview";

declare module "react" {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // extends React's HTMLAttributes
    href?: string;
  }
}

const ChatFolder = ({
  title,
  conversations,
  index,
  onChatOpen,
  onChatDelete,
  refreshChats,
}: {
  title: string;
  conversations?: Conversation[];
  index: number;
  onChatOpen: (id: string) => void;
  onChatDelete: (id: string) => void;
  refreshChats: () => void;
}) => {
  return (
    <div className="folder mb-2">
      <div className="folder-toggle p-3">
        <div className="row g-1">
          <div
            className="col-9 folder-trigger"
            data-bs-toggle="collapse"
            href={`#folder-${index}`}
            role="button"
            aria-expanded="true"
            aria-controls={`folder-${index}`}
          >
            <span className="icon icon-folder me-2" />
            <span className="text">
              {title}
              <span className="text-muted">({conversations?.length})</span>
            </span>
            {/*<span className="icon icon-chevron-down" />*/}
          </div>
          <div className="col-3 d-flex align-items-center justify-content-end">
            <button className="btn-nostyle px-2">
              <span className="icon icon-edit" />
            </button>
            <button className="btn-nostyle px-2">
              <span className="icon icon-delete" />
            </button>
          </div>
        </div>
      </div>
      <div className="folder-chat collapse" id={`folder-${index}`}>
        {conversations?.map((conversation) => (
          <ChatPreview
            key={conversation.id}
            name={conversation.name}
            onChatOpen={onChatOpen}
            onDeleteChat={onChatDelete}
            id={conversation.id}
            refreshChats={refreshChats}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatFolder;