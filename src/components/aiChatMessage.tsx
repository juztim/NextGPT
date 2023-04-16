import Image from "next/image";
import ReactMarkdown from "react-markdown";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import AvatarChat from "~/images/avatar-chat.jpg";
import { toast } from "react-hot-toast";

const AiChatMessage = ({
  message,
  controls = false,
}: {
  message: string;
  controls?: boolean;
}) => {
  return (
    <div className="chat-item chat-item-ai">
      <div className="row justify-content-center py-5">
        <div className="col-xl-8 col-sm-10 col-11">
          <div className="d-flex align-items-center">
            <div className="image me-4">
              <Image src={AvatarChat} alt="Avatar Chat" className="img-fluid" />
            </div>
            <div className="text">
              <ReactMarkdown
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
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
          {controls && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AiChatMessage;
