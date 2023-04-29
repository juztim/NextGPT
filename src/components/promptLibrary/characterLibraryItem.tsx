import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import { type Character } from "@prisma/client";
import { useSession } from "next-auth/react";
import useEnsurePremium from "~/hooks/useEnsurePremium";

const CharacterLibraryItem = ({ character }: { character: Character }) => {
  const ctx = api.useContext();
  const { data } = useSession();
  const { ensurePremium } = useEnsurePremium();

  const { mutate: add, isLoading: isAdding } =
    api.character.addToList.useMutation({
      onSuccess: () => {
        toast.success("Added character to list!");
        void ctx.character.getAdded.refetch();
      },
      onError: (error) => {
        console.log(error);
        toast.error("Error adding character to list!");
        toast.error(error.message);
      },
    });

  const { mutate: remove, isLoading: isRemoving } =
    api.character.delete.useMutation({
      onSuccess: () => {
        toast.success("Deleted character from Library!");
        void ctx.character.getAdded.refetch();
        void ctx.character.getAll.refetch();
      },
      onError: (error) => {
        console.log(error);
        toast.error("Error deleting character from Library!");
        toast.error(error.message);
      },
    });

  return (
    <div className="add-item">
      <div className="d-flex align-items-center justify-content-between">
        <h5>
          <span className="icon icon-face" />
          {character.name}
        </h5>
        <div className="d-flex gap-0">
          {character.userId === data?.user.id && (
            <button
              className="btn btn-link p-1"
              onClick={() => {
                remove({ id: character.id });
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
              add({ id: character.id });
            }}
            disabled={isAdding || isRemoving}
          >
            +Add
          </button>
        </div>
      </div>
      <div className="pl-4">
        <p>{character.description}</p>
      </div>
    </div>
  );
};

export default CharacterLibraryItem;
