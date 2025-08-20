"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  getComment,
  getGeneralComment,
  getSignedApproval,
} from "features/Comment/commentSlice";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "store/useStore";
import { client } from "../../types/types";
import { useSession } from "next-auth/react";
import { useActive } from "./ActiveContext";
import { useCampaigns } from "./CampaignsContext";
const CommentContext = createContext(null);

export const useComments = () => {
  return useContext(CommentContext);
};

export const CommentProvider = ({ children }) => {
  const [close, setClose] = useState(false);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [approvedIsLoading, setapprovedIsLoading] = useState(false);
  const [positionIsLoading, setPositionIsLoading] = useState(false);
  const [viewcommentsId, setViewcommentsId] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [showAdd, setShowAdd] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [createCommentsError, setCreateCommentsError] = useState(null);
  const [replyError, setReplyError] = useState(null);
  const [approvedError, setApprovedError] = useState(null);
  const [generalError, setGeneralError] = useState(null);
  const [createCommentsSuccess, setCreateCommentsSuccess] = useState(null);
  const [generalcommentsSuccess, setGeneralcommentsSuccess] = useState(null);
  const [generalcommentsUpdateSuccess, setGeneralcommentsUpdateSuccess] =
    useState(null);
  const [createApprovalSuccess, setCreateApprovalSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSaveProgress, setIsLoadingSaveProgress] = useState(false);
  const [isLoadingApproval, setIsLoadingApproval] = useState(false);
  const [isLoadingGeneral, setIsLoadingGeneral] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingReply, setIsLoadingReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [generalComment, setGeneralComment] = useState("");
  const [selected, setSelected] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeComment, setActiveComment] = useState(null);
  const [show, setShow] = useState(false);

  const dispatch = useAppDispatch();
  const { data } = useAppSelector((state) => state.comment);
  const { data: session } = useSession();
  const jwt = (session?.user as { data?: { jwt: string } })?.data?.jwt;
  const { getActiveCampaign } = useCampaigns();

  const { active, subStep } = useActive();

  // Load comments from local storage on mount
  useEffect(() => {
    // Get campaign ID from URL or use default
    const urlParams = new URLSearchParams(window.location.search);
    const campaignId = urlParams.get("campaignId") || "default";

    const storedComments =
      JSON.parse(localStorage.getItem(`comments_${campaignId}`)) || [];
    const storedOpportunities =
      JSON.parse(localStorage.getItem(`opportunities_${campaignId}`)) || [];
    setComments(storedComments);
    setOpportunities(storedOpportunities);
    if (active === 7) {
      if (subStep === 1) {
        setClose(true);
      }
    }
  }, [active, subStep]);

  // Save comments & opportunities to local storage whenever they change
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const campaignId = urlParams.get("campaignId") || "default";

    localStorage.setItem(`comments_${campaignId}`, JSON.stringify(comments));
    // localStorage.setItem(`opportunities_${campaignId}`, JSON.stringify(opportunities));
  }, [comments, opportunities]);

  // Sync local state with Redux when comments change
  useEffect(() => {
    if (data) {
      setComments(data); // Update local state
      setShowAdd(data[data.length - 1]?.documentId); // Show latest comment
    }
  }, [data]);

  const addGeneralComment = async (commentId, generalComment, author) => {
    setIsLoadingGeneral(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/general-comments`,
        {
          data: {
            commentId,
            generalComment,
            author,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      dispatch(getGeneralComment({ commentId, jwt }));
      setGeneralComment("");
      setIsLoadingGeneral(false);
      setGeneralcommentsSuccess(true);
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
      setGeneralError(error);
      setIsLoadingGeneral(false);
    }
  };

  const updateGeneralComment = async (
    commentId,
    generalComment,
    author,
    id
  ) => {
    setIsLoadingGeneral(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/general-comments/${id}`,
        {
          data: {
            commentId,
            generalComment,
            author,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      dispatch(getGeneralComment({ commentId, jwt }));
      setGeneralComment("");
      setIsLoadingGeneral(false);
      setGeneralcommentsUpdateSuccess(true);
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
      setGeneralError(error);
      setIsLoadingGeneral(false);
    }
  };

  const addComment = async (
    commentId,
    text,
    position,
    addcomment_as,
    creator,
    client_commentID
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/comments`,
        {
          data: {
            client_commentID,
            commentId,
            text,
            position,
            replies: [],
            approved: false,
            addcomment_as,
            creator,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      // Automatically delete signed approvals when a comment is created
      try {
        // Get existing signed approvals for this document
        const signedApprovalsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/client-signature-approvals`,
          {
            params: {
              "filters[isdocumentId][$eq]": commentId,
            },
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        // Delete each signed approval
        if (
          signedApprovalsResponse.data?.data &&
          signedApprovalsResponse.data.data.length > 0
        ) {
          for (const approval of signedApprovalsResponse.data.data) {
            await axios.delete(
              `${process.env.NEXT_PUBLIC_STRAPI_URL}/client-signature-approvals/${approval.id}`,
              {
                headers: {
                  Authorization: `Bearer ${jwt}`,
                },
              }
            );
          }
        } else {
          console.log("No signed approvals found to delete");
        }
      } catch (deleteError) {}

      setOpportunities([]);
      localStorage.setItem("opportunities", JSON.stringify(null));
      setComments((prev) => [...prev, response?.data?.data]);
      setShowAdd(response.data.data.commentId);
      dispatch(getComment({ commentId, jwt }));
      setComment("");
      setIsLoading(false);
      setCreateCommentsSuccess(true);
      setViewcommentsId("");
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
      setCreateCommentsError(error);
      setIsLoading(false);
    }
  };

  const createAsignatureapproval = async (sign, inputs, id, isdocumentId) => {
    setIsLoadingApproval(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/client-signature-approvals`,
        {
          data: {
            dateSigned: inputs.date,
            initials: inputs.initials,
            signature: sign,
            fullname: inputs.name,
            clientId: id,
            isdocumentId: isdocumentId,
            isSignature: true,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      setIsLoadingApproval(false);
      setCreateApprovalSuccess(true);
      setIsOpen(false);
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
      setCreateCommentsError(error);
      setIsLoadingApproval(false);
    }
  };

  const addReply = async (documentId, newReply, commentId) => {
    setIsLoadingReply(true);
    try {
      // Fetch the existing comment using documentId
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/comments/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      const comment = data?.data;
      // Ensure replies array exists
      const updatedReplies = [...(comment?.replies || []), newReply];

      // Update the comment with the new reply
      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/comments/${documentId}`,
        {
          data: {
            replies: updatedReplies,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      setReplyText("");
      setIsLoadingReply(false);
      dispatch(getComment({ commentId, jwt }));
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
      setIsLoadingReply(false);
      setReplyError(error);
    }
  };

  const approval = async (documentId, approveds, commentId) => {
    setapprovedIsLoading(true);

    try {
      // Ensure 'approved' is a boolean, not an array
      const updatedApprovalState = approveds; // Just store the new value

      // Update the comment with the new approved state
      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/comments/${documentId}`,
        {
          data: {
            approved: updatedApprovalState,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      setapprovedIsLoading(false);
      dispatch(getComment({ commentId, jwt }));
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
      setapprovedIsLoading(false);
      setApprovedError(error);
    }
  };

  const updatePosition = async (documentId, position, commentId) => {
    setPositionIsLoading(true);

    try {
      // Ensure 'Position' is a boolean, not an array
      const updatedposition = position; // Just store the new value

      // Update the comment with the new Position state
      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/comments/${documentId}`,
        {
          data: {
            position: updatedposition,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      setPositionIsLoading(false);
      // dispatch(getComment(commentId));
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
      setPositionIsLoading(false);
      setApprovedError(error);
    }
  };

  const updateOpportunityPosition = (id: any, newPosition: any) => {
    setOpportunities((prev) =>
      prev.map((opportunity) =>
        opportunity.commentId === id
          ? { ...opportunity, position: newPosition }
          : opportunity
      )
    );
  };

  // Function to update the position of a comment
  const updateCommentsPosition = (id: any, newPosition: any) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.commentId === id
          ? { ...comment, position: newPosition }
          : comment
      )
    );
  };

  // Function to add a comment as an opportunity
  const addCommentOpportunity = (comment: any) => {
    setOpportunities((prev) => [...prev, comment]);
  };

  // Function to clear all comments & opportunities

  // Function to delete signed approval by ID
  const deleteSignedApproval = async (approvalId: string) => {
    setIsLoadingApproval(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/client-signature-approvals/${approvalId}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      // Refresh the signed approval data
      if (selected) {
        dispatch(getSignedApproval({ isdocumentId: selected, jwt }));
        getActiveCampaign(selected);
      }

      setIsLoadingApproval(false);
      // toast.success("Signed approval deleted successfully");
    } catch (error: any) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
      setIsLoadingApproval(false);
      toast.error(
        error?.response?.data?.message || "Failed to delete signed approval"
      );
    }
  };

  return (
    <CommentContext.Provider
      value={{
        comments,
        opportunities,
        addComment,
        setOpportunities,
        updateOpportunityPosition,
        addCommentOpportunity,
        updateCommentsPosition,
        showAdd,
        setShowAdd,
        addReply,
        setViewcommentsId,
        viewcommentsId,
        isDrawerOpen,
        setIsDrawerOpen,
        createCommentsError,
        isLoading,
        setComment,
        comment,
        createCommentsSuccess,
        approvedIsLoading,
        isLoadingReply,
        replyText,
        setReplyText,
        replyError,
        approval,
        approvedError,
        updatePosition,
        positionIsLoading,
        setIsCreateOpen,
        isCreateOpen,
        setClose,
        close,
        modalOpen,
        setModalOpen,
        setIsLoadingApproval,
        isLoadingApproval,
        createAsignatureapproval,
        createApprovalSuccess,
        setCreateApprovalSuccess,
        deleteSignedApproval,
        addGeneralComment,
        generalcommentsSuccess,
        isLoadingGeneral,
        generalError,
        generalComment,
        setGeneralComment,
        updateGeneralComment,
        generalcommentsUpdateSuccess,
        setGeneralcommentsUpdateSuccess,
        setGeneralcommentsSuccess,
        selected,
        setSelected,
        isOpen,
        setIsOpen,
        activeComment,
        setActiveComment,
        show,
        setShow,
        setIsLoadingSaveProgress,
        isLoadingSaveProgress,
      }}>
      {children}
    </CommentContext.Provider>
  );
};
