import { useSession } from "next-auth/react";
import Image from "next/image";
import AvatarUser from "~/images/avatar-user.jpg";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

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

            <div className="text">
              <ReactMarkdown
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        language={match[1]}
                        /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/ban-ts-comment */
                        // @ts-ignore
                        style={materialDark as never}
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
