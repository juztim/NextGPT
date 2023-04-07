import Image from "next/image";
import AvatarUser from "~/images/avatar-user.jpg";

const ChatMessage = ({ message }: { message: string }) => {
  return (
    <div className="chat-item">
      <div className="row justify-content-center py-5">
        <div className="col-xl-8 col-sm-10 col-11">
          <div className="d-flex">
            <div className="image me-4">
              <Image src={AvatarUser} alt="Avatar User" className="img-fluid" />
            </div>

            <div>{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
