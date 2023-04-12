import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import AvatarChat from "~/images/avatar-chat.jpg";
import { toast } from "react-hot-toast";

const AiChatMessage = ({
  message,
  animate = false,
}: {
  message: string;
  animate?: boolean;
}) => {
  return (
    <div className="chat-item chat-item-ai">
      <div className="row justify-content-center py-5">
        <div className="col-xl-8 col-sm-10 col-11">
          <div className="d-flex align-items-center">
            <div className="image me-4">
              <Image src={AvatarChat} alt="Avatar Chat" className="img-fluid" />
            </div>

            {animate ? (
              <TypeAnimation cursor={false} speed={75} sequence={[message]} />
            ) : (
              <div>{message}</div>
            )}
          </div>
          <div className="d-flex align-items-center ms-4 float-end">
            <button
              className="btn-nostyle"
              onClick={() => {
                // use clipboard API to copy text
                void navigator.clipboard.writeText(message);
                toast.success("Copied to clipboard");
              }}
            >
              <span>Copy</span>
            </button>

            <button className="btn-nostyle">
              <span className="icon icon-like" />
            </button>

            <button className="btn-nostyle">
              <span className="icon icon-dislike" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChatMessage;
