import type { Prompt } from "@prisma/client";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";

const PromptLibraryItem = ({ prompt }: { prompt: Prompt }) => {
  const ctx = api.useContext();

  const { mutate: add } = api.prompt.addToList.useMutation({
    onSuccess: () => {
      toast.success("Added prompt to list!");
      void ctx.prompt.getAdded.refetch();
    },
    onError: (error) => {
      console.log(error);
      toast.error("Error adding prompt to list!");
      toast.error(error.message);
    },
  });

  return (
    <div className="add-item">
      <div className="d-flex align-items-center justify-content-between">
        <h5>
          <span className="icon icon-face" />
          {prompt.name}
        </h5>
        <button
          className="btn btn-link p-3"
          onClick={() => {
            add({ id: prompt.id });
          }}
        >
          +Add
        </button>
      </div>
      <div className="pl-4">
        <p>{prompt.description}</p>
      </div>
    </div>
  );
};

export default PromptLibraryItem;
