import type { Character } from "@prisma/client";
import toast from "react-hot-toast";
import { api } from "~/utils/api";

const CharacterPreview = ({
  character,
  onSelectCharacter,
  active,
}: {
  character: Character;
  onSelectCharacter: (character: Character) => void;
  active: boolean;
}) => {
  const ctx = api.useContext();

  const { mutate: removeCharacter, isLoading: isRemoving } =
    api.character.removeFromList.useMutation({
      onSuccess: () => {
        toast.success("Character removed from list");
        void ctx.character.getAll.refetch();
        void ctx.character.getAdded.refetch();
      },
      onError: (error) => {
        toast.error("Error removing character from list");
        toast.error(error.message);
        console.error(error);
      },
    });

  return (
    <div
      className="mb-2"
      onClick={(e) => {
        e.stopPropagation();
        onSelectCharacter(character);
      }}
      style={{
        display: "flex",
        position: "relative",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <input
        type="checkbox"
        className="btn-check"
        autoComplete="off"
        checked={active}
      />
      <label className="btn btn-secondary d-flex justify-content-start align-items-center w-100">
        <span className="icon icon-face me-2" />
        {character?.name}
      </label>
      <button
        className="btn-nostyle px-2"
        style={{
          position: "absolute",
          right: "20px",
        }}
        disabled={isRemoving}
        onClick={(e) => {
          e.stopPropagation();
          removeCharacter({ id: character.id });
        }}
      >
        <span className="icon icon-delete" />
      </button>
    </div>
  );
};

export default CharacterPreview;
