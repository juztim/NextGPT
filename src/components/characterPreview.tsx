const CharacterPreview = ({ character }: { character?: any }) => {
  return (
    <div className="mb-2">
      <input
        type="checkbox"
        className="btn-check"
        id="btn-2"
        autoComplete="off"
      />
      <label
        className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
        htmlFor="btn-2"
      >
        <span className="icon icon-face me-2"></span>
        Character Preview
      </label>
    </div>
  );
};

export default CharacterPreview;
