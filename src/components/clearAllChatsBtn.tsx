import { useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";

const ClearAllChats = () => {
  const [requireConfirmation, setRequireConfirmation] = useState(false);

  const ctx = api.useContext();

  const { mutate: deleteAllChats } = api.openAi.deleteAllChats.useMutation({
    onSuccess: () => {
      console.log("success");
      toast.success("All chats cleared!");
      setRequireConfirmation(false);
      void ctx.openAi.getAllChats.refetch();
      void ctx.openAi.getChat.invalidate();
    },
    onError: (error) => {
      console.log(error.message);
      toast.error("Error clearing chats!");
    },
  });

  return (
    <button
      className="btn-nostyle d-flex align-items-center"
      onClick={(e) => {
        e.stopPropagation();
        setRequireConfirmation(true);
      }}
      style={{
        cursor: requireConfirmation ? "default" : "pointer",
      }}
    >
      {requireConfirmation ? (
        <>
          <span
            className="icon icon-x me-3"
            style={{
              color: "red",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setRequireConfirmation(false);
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
              deleteAllChats();
            }}
          />
        </>
      ) : (
        <span className="icon icon-delete me-3" />
      )}
      {requireConfirmation ? (
        <span>Are you sure?</span>
      ) : (
        <span>Clear all chats</span>
      )}
    </button>
  );
};

export default ClearAllChats;
