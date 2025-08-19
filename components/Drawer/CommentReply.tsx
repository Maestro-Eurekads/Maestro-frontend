import moment from "moment";
import { useEffect, useState } from "react";
import { useAppSelector } from "store/useStore";

const CommentReply = ({ documentId, contrastingColor }) => {
  const { data: comments } = useAppSelector((state) => state.comment);
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    const comment = comments?.find((c) => c?.documentId === documentId);
    setReplies(comment?.replies || []);
  }, [comments, documentId]);

  return (
    <div className="w-full flex flex-col">
      {replies?.length > 0 && (
        <div className="flex items-center gap-1 w-full mb-2">
          <div className="w-[20px] h-0 border border-black/50" />
          <p className="font-medium text-[11px] text-black/50">
            {replies?.length} {replies?.length === 1 ? "Reply" : "Replies"}
          </p>
          <div className="w-[70%] h-0 border border-black/50" />
        </div>
      )}

      <div className="w-full mt-3 px-6 pt-2">
        {replies?.map((reply) => (
          <div key={reply?.documentId} className="mb-3">
            <div className="flex items-center gap-2">
              <div
                className="flex justify-center items-center w-[32px] h-[32px] rounded-full text-[14px] text-white"
                style={{ backgroundColor: contrastingColor }}>
                {reply?.name ? reply?.name[0] : "?"}
              </div>
              <div>
                <h3 className="font-medium text-[14px] text-[#292929]">
                  {reply?.name || "?"}
                </h3>
                <div className="flex gap-2 text-[11px] text-[#292929]">
                  <p>{moment(reply.createdAt).format("MM/DD/YYYY")} </p>
                  <p>
                    {reply?.time
                      ? moment(reply.time, "hh:mm A").format("hh:mm A")
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-2 text-[14px] text-[#292929] px-3 max-h-[120px] overflow-y-auto">
              <p className="whitespace-pre-wrap">{reply?.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentReply;
