import type { Prompt } from "@prisma/client";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import useEnsurePremium from "~/hooks/useEnsurePremium";

const PromptLibraryItem = ({ prompt }: { prompt: Prompt }) => {
  const ctx = api.useContext();
  const session = useSession();
  const { ensurePremium } = useEnsurePremium();

  const { mutate: add, isLoading: isAdding } = api.prompt.addToList.useMutation(
    {
      onSuccess: () => {
        toast.success("Added prompt to list!");
        void ctx.prompt.getAdded.refetch();
      },
      onError: (error) => {
        console.log(error);
        toast.error("Error adding prompt to list!");
        toast.error(error.message);
      },
    }
  );

  const { mutate: remove, isLoading: isRemoving } =
    api.prompt.delete.useMutation({
      onSuccess: () => {
        toast.success("Deleted prompt from Library!");
        void ctx.prompt.getAdded.refetch();
        void ctx.prompt.getAll.refetch();
      },
      onError: (error) => {
        console.log(error);
        toast.error("Error deleting prompt from Library!");
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
        <div className="d-flex gap-0">
          {prompt.userId === session.data?.user.id && (
            <button
              className="btn btn-link p-1"
              onClick={() => {
                remove({ id: prompt.id });
              }}
              disabled={isAdding || isRemoving}
            >
              - Delete
            </button>
          )}
          <button
            className="btn btn-link p-1"
            onClick={() => {
              if (!ensurePremium()) return;
              add({ id: prompt.id });
            }}
            disabled={isAdding || isRemoving}
          >
            +Add
          </button>
        </div>
      </div>
      <div className="pl-4">
        <p>{prompt.description}</p>
      </div>
    </div>
  );
};

export default PromptLibraryItem;
