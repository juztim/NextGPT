import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import { type Character } from "@prisma/client";

const CharacterLibraryItem = ({ character }: { character: Character }) => {
  const ctx = api.useContext();

  const { mutate: add } = api.character.addToList.useMutation({
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
  return (
    <div className="add-item">
      <div className="d-flex align-items-center justify-content-between">
        <h5>
          <span className="icon icon-face" />
          {character.name}
        </h5>
        <button
          className="btn btn-link p-3"
          onClick={() => {
            add({ id: character.id });
          }}
        >
          +Add
        </button>
      </div>
      <div className="pl-4">
        <p>{character.description}</p>
      </div>
    </div>
  );
};

export default CharacterLibraryItem;
