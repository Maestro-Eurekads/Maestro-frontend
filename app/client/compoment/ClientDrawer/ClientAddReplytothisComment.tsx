import React, { useState } from "react";
import Image from "next/image";
import tickcircle from "../public/tick-circle.svg";
import send from "../../../../public/send.svg";
import { useComments } from "app/utils/CommentProvider";
import { SVGLoader } from "components/SVGLoader";
import { useSession } from "next-auth/react";
import { cleanName } from "components/Options";
import { toast } from "sonner";
const MAX_REPLY_LENGTH = 250;

const ClientAddReplytothisComment = ({ onReplySubmit }) => {
  const { data: session }: any = useSession();
  const { isLoadingReply, setReplyText, replyText } = useComments();
  const [charWarning, setCharWarning] = useState("");

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    if (replyText.length > MAX_REPLY_LENGTH) {
      toast.error(`Reply cannot exceed ${MAX_REPLY_LENGTH} characters.`);
      return;
    }
    try {
      const newReply = {
        name: session?.user?.name,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        message: replyText,
      };
      onReplySubmit(newReply);
    } catch (error) {
      if (
        error?.response?.data?.error?.message
          ?.toLowerCase()
          .includes("length") ||
        error?.response?.data?.message?.toLowerCase().includes("length")
      ) {
        toast.error(
          `Reply is too long. Please keep it under ${MAX_REPLY_LENGTH} characters.`
        );
      } else {
        toast.error(error?.message || "Failed to add reply.");
      }
    }
  };

  return (
    <div className="w-full">
      <div className="w-full flex flex-col items-start p-[10px] px-[20px] min-h-[200px] border border-[#3175ff4d] rounded-lg">
        <div className="w-full">
          <div className="flex justify-between items-center gap-3 ">
            <div className="flex items-center gap-2 ">
              <div className="flex flex-col justify-center items-center p-[10px] gap-[10px] w-[40px] h-[40px] bg-[#00A36C] rounded-full text-[20px] leading-[27px] text-center text-white">
                {cleanName(session?.user?.name[0]) || "?"}
              </div>
              <div>
                <h3 className="font-[500] text-[20px] leading-[27px] text-[#292929]">
                  {cleanName(session?.user?.name)}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="font-[400] text-[12px] leading-[16px] text-[#292929]">
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </p>
                  <p className="font-[400] text-[12px] leading-[16px] text-[#292929]">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="font-[500] text-[16px] leading-[22px] text-[#292929] py-5">
            <textarea
              className="font-[500] text-[16px] leading-[22px] text-[#292929] py-5 w-full"
              rows={3}
              placeholder="Write your reply here..."
              value={replyText}
              maxLength={MAX_REPLY_LENGTH}
              onChange={(e) => {
                setReplyText(e.target.value);
                if (e.target.value.length >= MAX_REPLY_LENGTH) {
                  setCharWarning("Maximum character limit reached.");
                } else {
                  setCharWarning("");
                }
              }}
            />
            <div className="w-full flex justify-end text-xs text-gray-500 mt-1">
              {replyText.length}/{MAX_REPLY_LENGTH}
              {charWarning && (
                <span className="text-red-500 ml-2">{charWarning}</span>
              )}
            </div>
          </div>

          <div className="flex w-full justify-between">
            {/* <button>
							<h3 className="font-semibold text-[15px] leading-[20px] text-[#00A36C]">Add as internal</h3>
						</button> */}
            <div>
              <button
                onClick={handleReplySubmit}
                className="flex flex-row justify-center items-center px-[28px] py-[10px] gap-[8px] w-[135px] h-[40px] bg-[#3175FF] rounded-[8px] font-semibold text-[15px] leading-[20px] text-white">
                {/* Comment */}
                {isLoadingReply ? (
                  <SVGLoader width={"25px"} height={"25px"} color={"#FFF"} />
                ) : (
                  "Comment"
                )}
                <Image src={send} alt="send" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientAddReplytothisComment;
