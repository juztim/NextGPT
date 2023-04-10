import { useSession } from "next-auth/react";
import Image from "next/image";
import AvatarUser from "~/images/avatar-user.jpg";

const ChatMessage = ({ message }: { message: string }) => {
  const { data } = useSession();
  return (
    <div className="chat-item">
      <div className="row justify-content-center py-5">
        <div className="col-xl-8 col-sm-10 col-11">
          <div className="d-flex align-items-center">
            <div className="image me-4">
              <Image
                src={data?.user.image ?? AvatarUser}
                alt="Avatar User"
                className="img-fluid"
                width={30}
                height={30}
              />
            </div>

            <div>{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
