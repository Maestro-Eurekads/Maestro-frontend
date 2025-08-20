"use client";
import React, { useState } from "react";
import send from "../../public/send.svg";
import closecircle from "../../public/close-circle.svg";
import Image from "next/image";
import { useComments } from "app/utils/CommentProvider";
import CommentHeaderwithClose from "./CommentHeaderwithClose";
import { SVGLoader } from "components/SVGLoader";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "store/useStore";
import InternalVisibilityToggle from "components/InternalDropdowns";
import { toast } from "sonner";

const AddAsInternalcomment = ({ position, setShow }) => {
  const { data: session }: any = useSession();
  const { addComment, isLoading, createCommentsError, comment, setComment } =
    useComments();
  const { isLoading: loading } = useAppSelector((state) => state.comment);
  const [selectedOption, setSelectedOption] = useState(false);
  const addcomment_as = selectedOption ? "Client" : "Internal";
  const query = useSearchParams();
  const commentId = query.get("campaignId");
  const creator = {
    id: session?.user?.id,
    name: session?.user?.name,
  };

  const MAX_COMMENT_LENGTH = 250;
  const [charWarning, setCharWarning] = useState("");

  const handleAddComment = async () => {
    if (comment.trim() === "") return;
    if (comment.length > MAX_COMMENT_LENGTH) {
      toast.error(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`);
      return;
    }
    try {
      await addComment(commentId, comment, position, addcomment_as, creator);
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      } else if (
        error?.response?.data?.error?.message
          ?.toLowerCase()
          .includes("length") ||
        error?.response?.data?.message?.toLowerCase().includes("length")
      ) {
        toast.error(
          `Comment is too long. Please keep it under ${MAX_COMMENT_LENGTH} characters.`
        );
      } else if (error?.response?.status === 500) {
        toast.error("Internal Server Error. Please try again later.");
      } else {
        toast.error(error?.message || "Failed to add comment.");
      }
    }
  };

  return (
    <div className="cursor-move z-50">
      <div className="w-[320px] flex flex-col items-start p-[8px_16px] bg-white border border-black rounded-[6px]">
        <div className="flex justify-between items-center gap-2 w-full">
          <div className="flex items-center gap-2">
            <div className="flex justify-center items-center p-[8px] w-[34px] h-[34px] bg-[#00A36C] rounded-full text-[16px] text-white">
              {session?.user?.name[0]}
            </div>
            <CommentHeaderwithClose author={session?.user?.name} />
          </div>

          <button onClick={() => setShow(false)}>
            <Image src={closecircle} alt="close-circle" className="w-[22px]" />
          </button>
        </div>

        <textarea
          className="w-full font-medium text-[14px] text-[#292929] py-2 px-3 rounded-md resize-none overflow-y-auto focus:outline-none max-h-[150px]"
          rows={3}
          value={comment}
          maxLength={MAX_COMMENT_LENGTH}
          onChange={(e) => {
            setComment(e.target.value);
            if (e.target.value.length >= MAX_COMMENT_LENGTH) {
              setCharWarning("Maximum character limit reached.");
            } else {
              setCharWarning("");
            }
          }}
          placeholder="Write your comment..."
        />
        <div className="w-full flex justify-end text-xs text-gray-500 mt-1">
          {comment.length}/{MAX_COMMENT_LENGTH}
          {charWarning && (
            <span className="text-red-500 ml-2">{charWarning}</span>
          )}
        </div>

        <div className="flex items-center w-full justify-between mt-1">
          <InternalVisibilityToggle
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
          />

          <div>
            <button
              disabled={loading}
              onClick={handleAddComment}
              className={`flex justify-center items-center px-[20px] py-[8px] gap-[6px] w-[110px] h-[36px] rounded-[6px] font-semibold text-[14px] text-white z-40
								${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#3175FF] cursor-pointer"}`}>
              {isLoading ? (
                <SVGLoader width="22px" height="22px" color="#FFF" />
              ) : (
                "Comment"
              )}
              <Image src={send} alt="send" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAsInternalcomment;
