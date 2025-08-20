import React, { useState } from "react";
import Image from "next/image";
import send from "../../public/send.svg";
import { useComments } from "app/utils/CommentProvider";
import { SVGLoader } from "components/SVGLoader";
import { useSession } from "next-auth/react";
import { cleanName } from "components/Options";
import { toast } from "sonner";

const MAX_REPLY_LENGTH = 250;

const AddReplytothisComment = ({ onReplySubmit }) => {
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
      onReplySubmit(replyText);
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
      <div className="flex flex-col p-3 border border-[#3175ff4d] rounded-md min-h-[160px]">
        <div className="flex items-start gap-2">
          <div className="flex justify-center items-center w-[32px] h-[32px] bg-[#00A36C] text-white text-[14px] rounded-full">
            {cleanName(session?.user?.name?.[0]) || "?"}
          </div>
          <div className="flex flex-col">
            <h3 className="text-[14px] font-medium text-[#292929]">
              {cleanName(session?.user?.name)}
            </h3>
            <div className="text-[11px] text-[#292929] flex gap-2">
              <p>
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </p>

              <p>
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          </div>
        </div>

        <textarea
          className="mt-3 w-full text-[14px] text-[#292929] px-3 py-2 rounded-md resize-none focus:outline-none"
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

        <div className="flex justify-between items-center mt-3">
          <button>
            <p className="text-[13px] text-[#00A36C] font-semibold">
              Add as internal
            </p>
          </button>
          <button
            onClick={handleReplySubmit}
            className={`flex items-center gap-2 px-4 py-2 rounded-md bg-[#3175FF] text-white text-[14px] font-semibold ${
              isLoadingReply ? "opacity-60 cursor-not-allowed" : ""
            }`}>
            {isLoadingReply ? (
              <SVGLoader width="20px" height="20px" color="#FFF" />
            ) : (
              "Comment"
            )}
            <Image src={send} alt="send" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddReplytothisComment;
