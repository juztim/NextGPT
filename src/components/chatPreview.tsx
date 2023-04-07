const ChatPreview = ({
  id,
  name,
  favored,
  onChatOpen,
}: {
  id: string;
  name?: string | null;
  favored?: boolean;
  onChatOpen: (id: string) => void;
}) => {
  return (
    <div
      className="pt-3 px-3 pb-2"
      style={{ cursor: "pointer" }}
      onClick={() => onChatOpen(id)}
    >
      <div className="row g-1">
        <div className="col-9">
          <span className={`icon icon-${favored ? "star" : "chat"} me-2`} />
          <span className="text">{name ?? "New Chat"}</span>
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
  );
};

export default ChatPreview;
