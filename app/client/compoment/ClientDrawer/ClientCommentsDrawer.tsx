import Image from "next/image";
import closecircle from "../../../../public/close-circle.svg";
import Mmessages from "../../../../public/message-2.svg";
import { useComments } from "app/utils/CommentProvider";
import { useCampaigns } from "app/utils/CampaignsContext";
import { getContrastingColor, getRandomColor } from "components/Options";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "store/useStore";
import { getComment } from "features/Comment/commentSlice";
import { SVGLoader } from "components/SVGLoader";
import AlertMain from "components/Alert/AlertMain";
import ClientComments from "./ClientComments";
import ClientAddCommentReply from "./ClientAddCommentReply";
import { BsXLg } from "react-icons/bs";

interface Comment {
  documentId: string;
  addcomment_as: string;
  createdAt: string;
  commentId: string; // Added commentId property
  replies?: Reply[];
}

interface Reply {
  documentId: string;
  name?: string;
  date?: string;
  time?: string;
  message?: string;
}

const ClientCommentsDrawer = ({ isOpen, onClose, campaign }) => {
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
    setClose,
  } = useComments();
  const { data, isLoading, isError } = useAppSelector((state) => state.comment);
  const comments: Comment[] = data
    ?.filter((comment: Comment) => comment?.addcomment_as !== "Internal")
    .sort(
      (a: Comment, b: Comment) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const dispatch = useAppDispatch();
  const [alert, setAlert] = useState(null);
  const [commentColors, setCommentColors] = useState({});
  const commentId = campaign?.documentId;
  const { jwt, campaignFormData } = useCampaigns();

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
  }, [data]);

  // Function to create a new Comment Opportunity
  const createCommentOpportunity = () => {
    const newOpportunity = {
      commentId: Date.now(),
      text: "New Comment Opportunity",
      position: { x: 400, y: -500 },
    };

    // Add only if there are 0
    if (opportunities.length === 0) {
      setIsCreateOpen(true);
      addCommentOpportunity(newOpportunity);
    }
  };

  const handleClose = () => {
    setOpportunities([]);
    onClose(false);
    setViewcommentsId("");
    setClose(false);
  };

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    if (createCommentsSuccess) {
      setAlert({
        variant: "success",
        message: "Commment created!",
        position: "bottom-right",
      });
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

      setAlert({
        variant: "error",
        message: errorMessage,
        position: "bottom-right",
      });
    }
    if (replyError) {
      let errorMessage = "An error occurred while adding the reply";
      if (replyError.response?.data?.error?.message) {
        errorMessage = replyError.response.data.error.message;
      } else if (replyError.message) {
        errorMessage = replyError.message;
      }

      setAlert({
        variant: "error",
        message: errorMessage,
        position: "bottom-right",
      });
    }
    if (approvedError) {
      let errorMessage = "An error occurred with approval";
      if (approvedError.response?.data?.error?.message) {
        errorMessage = approvedError.response.data.error.message;
      } else if (approvedError.message) {
        errorMessage = approvedError.message;
      }

      setAlert({
        variant: "error",
        message: errorMessage,
        position: "bottom-right",
      });
    }
  }, [createCommentsError, replyError]);

  useEffect(() => {
    if (jwt) {
      dispatch(getComment(commentId, jwt));
    }
  }, [dispatch, jwt]);

  return (
    <div
      className={`drawer-container ${
        isOpen ? "drawer-open" : ""
      }   max-h-screen`}>
      {alert && <AlertMain alert={alert} />}
      <div className="flex w-full justify-between p-3">
        <div>
          <h3 className="font-medium text-2xl text-[#292929]">Comments For</h3>
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
        <h6 className="w-[70%] text-center text-black text-[16px]">
          Add a comment, your comments will appear here!
        </h6>
      </div>

      {/* Comments Section */}
      <div className="faq-container p-5 overflow-y-auto max-h-[calc(88vh-100px)]">
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center py-5">
            <SVGLoader width={"35px"} height={"35px"} color={"#00A36C"} />
          </div>
        ) : viewcommentsId ? (
          comments
            .filter((comment) => comment?.documentId === viewcommentsId)
            .map((comment) => {
              const { color, contrastingColor } =
                commentColors[comment?.documentId] || {};
              return (
                <div
                  key={comment?.documentId}
                  className="relative flex flex-col p-5 gap-4 w-full min-h-[203px] max-h-[70vh] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.1)] rounded-lg border-box mb-5 overflow-y-auto">
                  <button
                    className="cursor-pointer absolute right-2 top-2 group z-10"
                    onClick={() => setViewcommentsId("")}>
                    <BsXLg className="text-[#29292968] group-hover:text-red-500 transition-colors duration-200" />
                  </button>
                  <div className="flex flex-col gap-4 w-full">
                    <ClientComments
                      comment={comment}
                      contrastingColor={contrastingColor}
                    />
                    <ClientAddCommentReply
                      documentId={comment?.documentId}
                      contrastingColor={contrastingColor}
                      commentId={comment?.commentId}
                    />
                  </div>
                </div>
              );
            })
        ) : (
          comments?.map((comment) => {
            const { color, contrastingColor } =
              commentColors[comment?.documentId] || {};
            return (
              <div
                key={comment?.documentId}
                className="flex flex-col p-5 gap-4 w-full min-h-[203px] max-h-[60vh] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.1)] rounded-lg border-box mb-5 overflow-y-auto">
                <div className="flex flex-col gap-4 w-full">
                  <ClientComments
                    comment={comment}
                    contrastingColor={contrastingColor}
                  />
                  <ClientAddCommentReply
                    documentId={comment?.documentId}
                    contrastingColor={contrastingColor}
                    commentId={comment?.commentId}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ClientCommentsDrawer;
