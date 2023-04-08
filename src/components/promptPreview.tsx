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

  const { mutate: deletePrompt } = api.openAi.deletePrompt.useMutation({
    onSuccess: () => {
      toast.success("Prompt deleted");
      void ctx.openAi.getAllPrompts.refetch();
    },
    onError: (error) => {
      toast.error("Error deleting prompt");
    },
  });

  return (
    <div
      className="mb-2"
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
          onClick={(e) => {
            e.stopPropagation();
            deletePrompt({ id: prompt.id });
          }}
        >
          <span className="icon icon-delete" />
        </button>
      </label>
    </div>
  );
};

export default PromptPreview;
