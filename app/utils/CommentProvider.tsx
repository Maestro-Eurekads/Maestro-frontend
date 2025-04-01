"use client";
import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { getComment } from "features/Comment/commentSlice";
import { useAppDispatch } from "store/useStore";
const CommentContext = createContext(null);

export const useComments = () => {
	return useContext(CommentContext);
};

export const CommentProvider = ({ children }) => {
	const [comments, setComments] = useState([]);
	const [comment, setComment] = useState("");
	const [approvedIsLoading, setapprovedIsLoading] = useState(false);
	const [positionIsLoading, setPositionIsLoading] = useState(false);
	const [viewcommentsId, setViewcommentsId] = useState(null);
	const [opportunities, setOpportunities] = useState([]);
	const [showAdd, setShowAdd] = useState(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [createCommentsError, setCreateCommentsError] = useState(null);
	const [replyError, setReplyError] = useState(null);
	const [approvedError, setApprovedError] = useState(null);
	const [createCommentsSuccess, setCreateCommentsSuccess] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingReply, setIsLoadingReply] = useState(false);
	const [replyText, setReplyText] = useState("");
	const dispatch = useAppDispatch();


	const addComment = async (commentId, text, position, addcomment_as) => {
		setIsLoading(true);
		try {
			const response = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/comments`, {
				data: {
					commentId,
					text,
					position,
					replies: [],
					approved: false,
					addcomment_as,
				},
			}, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
				},
			});
			// setComments((prev) => [...prev, response.data.data]);
			setShowAdd(response.data.data.commentId);
			dispatch(getComment());
			setComment("");
			setIsLoading(false);
			setCreateCommentsSuccess(true);
		} catch (error) {
			setCreateCommentsError(error);
			setIsLoading(false);
		}
	};




	const addReply = async (documentId, newReply) => {
		setIsLoadingReply(true);
		try {
			// Fetch the existing comment using documentId
			const { data } = await axios.get(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/comments/${documentId}`,
				{
					headers: {
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
					},
				}
			);
			const comment = data.data;
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
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
					},
				}
			);
			setReplyText("");
			setIsLoadingReply(false);
			dispatch(getComment());
		} catch (error) {
			setIsLoadingReply(false);
			setReplyError(error);
		}
	};


	const approval = async (documentId, approveds) => {
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
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
					},
				}
			);

			setapprovedIsLoading(false);
			dispatch(getComment());
		} catch (error) {
			setapprovedIsLoading(false);
			setApprovedError(error);
		}
	};

	const updatePosition = async (documentId, position) => {
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
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
					},
				}
			);

			setPositionIsLoading(false);
			// dispatch(getComment());
		} catch (error) {
			setPositionIsLoading(false);
			setApprovedError(error);
		}
	};

	// Function to create a new comment opportunity
	const createCommentOpportunity = () => {
		const newOpportunity = {
			commentId: Date.now(),
			text: "New Comment Opportunity",
			position: { x: 150, y: 150 },
		};
		setOpportunities((prev) => [...prev, newOpportunity]); // Update opportunities state
	};


	const updateOpportunityPosition = (id: any, newPosition: any) => {
		setOpportunities((prev) =>
			prev.map((opportunity) =>
				opportunity.commentId === id ? { ...opportunity, position: newPosition } : opportunity
			)
		);
	};

	// Function to update the position of a comment
	const updateCommentsPosition = (id: any, newPosition: any) => {
		setComments((prev) =>
			prev.map((comment) =>
				comment.commentId === id ? { ...comment, position: newPosition } : comment
			)
		);
	};

	// Function to add a comment as an opportunity
	const addCommentOpportunity = (comment: any) => {
		setOpportunities((prev) => [...prev, comment]);
	};

	// Function to clear all comments & opportunities
	const clearCommentsAndOpportunities = () => {
		setOpportunities([]);
	};

	return (
		<CommentContext.Provider
			value={{
				comments,
				opportunities,
				addComment,
				createCommentOpportunity,
				updateOpportunityPosition,
				addCommentOpportunity,
				updateCommentsPosition,
				showAdd,
				setShowAdd,
				addReply,
				clearCommentsAndOpportunities,
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
				positionIsLoading
			}}
		>
			{children}
		</CommentContext.Provider>
	);
};


