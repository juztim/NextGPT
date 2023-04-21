import type { Prompt } from "@prisma/client";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";

const PromptPreview = ({
  prompt,
  onOpenPrompt,
}: {
  prompt: Prompt;
  onOpenPrompt: (prompt: Prompt) => void;
}) => {
  const ctx = api.useContext();

  const { mutate: removePrompt, isLoading: isRemoving } =
    api.prompt.removeFromList.useMutation({
      onSuccess: () => {
        toast.success("Prompt removed");
        void ctx.prompt.getAll.refetch();
        void ctx.prompt.getAdded.refetch();
      },
      onError: (error) => {
        toast.error("Error removing prompt");
        toast.error(error.message);
        console.error(error);
      },
    });

  return (
    <div
      className="mb-2"
      style={{
        display: "flex",
        position: "relative",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onOpenPrompt(prompt);
      }}
    >
      <label
        className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
        htmlFor="btn2-2"
      >
        <span className="icon icon-propt me-2" />
        {prompt.name}
        <button
          className="btn-nostyle px-2"
          style={{
            position: "absolute",
            right: "20px",
          }}
          disabled={isRemoving}
          onClick={(e) => {
            e.stopPropagation();
            removePrompt({ id: prompt.id });
          }}
        >
          <span
            className="icon icon-delete"
            style={{
              color: "White",
            }}
          />
        </button>
      </label>
    </div>
  );
};

export default PromptPreview;
