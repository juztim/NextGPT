﻿import Image from "next/image";
import AvatarChat from "~/images/avatar-chat.jpg";

const AiChatMessage = ({ message }: { message: string }) => {
  return (
    <div className="chat-item chat-item-ai">
      <div className="row justify-content-center py-5">
        <div className="col-xl-8 col-sm-10 col-11">
          <div className="d-flex">
            <div className="image me-4">
              <Image src={AvatarChat} alt="Avatar Chat" className="img-fluid" />
            </div>

            <div>{message}</div>

            <div className="d-flex align-items-start ms-4">
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
    </div>
  );
};

export default AiChatMessage;