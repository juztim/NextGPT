import type { Prompt } from "@prisma/client";

const PromptPreview = ({
  prompt,
  onOpenPrompt,
}: {
  prompt: Prompt;
  onOpenPrompt: (prompt: Prompt) => void;
}) => {
  return (
    <div className="mb-2" onClick={() => onOpenPrompt(prompt)}>
      <label
        className="btn btn-secondary d-flex justify-content-start align-items-center w-100"
        htmlFor="btn2-2"
      >
        <span className="icon icon-propt me-2" />
        {prompt.name}
      </label>
    </div>
  );
};

export default PromptPreview;
