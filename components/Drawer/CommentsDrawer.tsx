import Image from "next/image";
import closecircle from "../../public/close-circle.svg";
import Mmessages from "../../public/message-2.svg";
import Comments from "./Comments";
import AddCommentReply from "./AddCommentReply";
import { useComments } from "app/utils/CommentProvider";
import { useCampaigns } from "app/utils/CampaignsContext";
import { getContrastingColor, getRandomColor } from "components/Options";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "store/useStore";
import { SVGLoader } from "components/SVGLoader";
import { toast } from "sonner";
import { useUserPrivileges } from "utils/userPrivileges";
import { reset } from "features/Comment/commentSlice";
import clsx from "clsx";

const CommentsDrawer = ({ isOpen, onClose }) => {
  const {
    opportunities,
    setViewcommentsId,
    viewcommentsId,
    addCommentOpportunity,
    setOpportunities,
    createCommentsError,
    createCommentsSuccess,
    approvedError,
    replyError,
    setIsCreateOpen,
  } = useComments();

  const { isAgencyApprover, isFinancialApprover, isAdmin } =
    useUserPrivileges();

  const { data, isLoading } = useAppSelector((state) => state.comment);
  const dispatch = useAppDispatch();
  const { campaignData, campaignFormData } = useCampaigns();

  const [commentColors, setCommentColors] = useState({});

  const commentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const comment = useMemo(() => {
    if (!data) return [];
    return data?.filter(
      (comment) =>
        comment?.client_commentID === null || comment?.client_commentID !== null
    );
  }, [data]);

  const comments = useMemo(() => {
    return [...comment].sort(
      (a, b) =>
        new Date(b?.createdAt || 0).getTime() -
        new Date(a?.createdAt || 0).getTime()
    );
  }, [comment]);

  useEffect(() => {
    const newColors = {};
    comments?.forEach((comment) => {
      if (!commentColors[comment?.documentId]) {
        const randomColor = getRandomColor();
        newColors[comment?.documentId] = {
          color: randomColor,
          contrastingColor: getContrastingColor(randomColor),
        };
      }
    });
    setCommentColors((prevColors) => ({ ...prevColors, ...newColors }));
  }, [comments]);

  // Scroll and highlight selected comment
  useEffect(() => {
    if (viewcommentsId && commentRefs.current[viewcommentsId]) {
      const el = commentRefs.current[viewcommentsId];
      el?.scrollIntoView({ behavior: "smooth", block: "center" });

      const timeout = setTimeout(() => {
        setViewcommentsId("");
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [viewcommentsId]);

  const createCommentOpportunity = () => {
    const newOpportunity = {
      commentId: Date.now(),
      text: "New Comment Opportunity",
      position: { x: 400, y: -500 },
    };

    if (opportunities.length === 0) {
      setIsCreateOpen(true);
      addCommentOpportunity(newOpportunity);
    }
  };

  const handleClose = () => {
    setOpportunities([]);
    onClose(false);
    setViewcommentsId("");
    dispatch(reset());
  };

  useEffect(() => {
    if (createCommentsSuccess) {
      toast.success("Comment created!");
    }
    if (createCommentsError) {
      let errorMessage = "An error occurred while creating the comment";
      if (createCommentsError.response?.data) {
        // Handle different types of error data
        if (typeof createCommentsError.response.data === "string") {
          errorMessage = createCommentsError.response.data;
        } else if (createCommentsError.response.data?.message) {
          errorMessage = createCommentsError.response.data.message;
        } else if (createCommentsError.response.data?.error?.message) {
          errorMessage = createCommentsError.response.data.error.message;
        }
      } else if (createCommentsError.message) {
        errorMessage = createCommentsError.message;
      }

      toast.error(errorMessage);
    }
    if (replyError) {
      let errorMessage = "An error occurred while adding the reply";
      if (replyError.response?.data?.error?.message) {
        errorMessage = replyError.response.data.error.message;
      } else if (replyError.message) {
        errorMessage = replyError.message;
      }

      toast.error(errorMessage);
    }
    if (approvedError) {
      let errorMessage = "An error occurred with approval";
      if (approvedError.response?.data?.error?.message) {
        errorMessage = approvedError.response.data.error.message;
      } else if (approvedError.message) {
        errorMessage = approvedError.message;
      }

      toast.error(errorMessage);
    }
  }, [createCommentsSuccess, createCommentsError, replyError, approvedError]);

  return (
    <div
      className={`drawer-container ${
        isOpen ? "drawer-open" : ""
      } max-h-screen`}>
      <div className="flex w-full justify-between p-3">
        <div>
          <h3 className="font-medium text-[22px] text-[#292929]">
            Comments For
          </h3>
          <div className="flex items-center gap-2 w-full">
            <p className="font-medium text-[16px] text-[#292929] mb-4">
              {campaignFormData?.funnel_stages?.length > 0
                ? (() => {
                    // Use selected phases from campaignFormData instead of all phases from campaignData
                    const selectedStages =
                      campaignFormData?.funnel_stages || [];
                    return selectedStages.length > 3
                      ? selectedStages.slice(0, 3).join(" · ") + " ..."
                      : selectedStages.join(" · ");
                  })()
                : ""}
            </p>
          </div>
        </div>
        <button onClick={handleClose}>
          <Image src={closecircle} alt="Close" />
        </button>
      </div>

      <div className="w-full flex flex-col justify-center items-center gap-5 mt-[-10px] mb-4">
        <button onClick={createCommentOpportunity}>
          <Image src={Mmessages} alt="Add Comment Opportunity" />
        </button>
        <h6 className="w-[70%] text-center text-black text-[15px]">
          Add a comment, your comments will appear here!
        </h6>
      </div>

      {/* Comments Section */}
      <div className="faq-container p-5 overflow-y-auto max-h-[calc(88vh-100px)]">
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center py-5">
            <SVGLoader width={"35px"} height={"35px"} color={"#00A36C"} />
          </div>
        ) : (
          comments?.map((comment) => {
            const { color, contrastingColor } =
              commentColors[comment?.documentId] || {};
            return (
              <div
                key={comment?.documentId}
                ref={(el) => {
                  commentRefs.current[comment?.documentId] = el;
                }}
                className={clsx(
                  "flex flex-col justify-between p-5 gap-4 w-full min-h-[203px] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.1)] rounded-lg border-box mb-5 transition-all duration-500",
                  viewcommentsId === comment?.documentId &&
                    "ring-2 ring-[#00A36C]"
                )}>
                <Comments
                  comment={comment}
                  contrastingColor={contrastingColor}
                  isAgencyApprover={isAgencyApprover}
                  isFinancialApprover={isFinancialApprover}
                  isAdmin={isAdmin}
                />
                <AddCommentReply
                  documentId={comment?.documentId}
                  contrastingColor={contrastingColor}
                  commentId={comment?.commentId}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommentsDrawer;
