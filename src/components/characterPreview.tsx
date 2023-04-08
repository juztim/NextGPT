import type { Character } from "@prisma/client";

const CharacterPreview = ({
  character,
  onSelectCharacter,
  active,
}: {
  character: Character;
  onSelectCharacter: (character: Character) => void;
  active: boolean;
}) => {
  return (
    <div className="mb-2" onClick={() => onSelectCharacter(character)}>
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
    </div>
  );
};

export default CharacterPreview;
