"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Create Context
const CommentContext = createContext(null);

// Custom Hook to use Comment Context
export const useComments = () => {
	return useContext(CommentContext);
};

// Context Provider Component
export const CommentProvider = ({ children }) => {
	const [comments, setComments] = useState([]);
	const [viewcommentsId, setViewcommentsId] = useState(null);
	const [opportunities, setOpportunities] = useState([]);
	const [showAdd, setShowAdd] = useState(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	// Load comments from local storage on mount
	useEffect(() => {
		const storedComments = JSON.parse(localStorage.getItem("comments")) || [];
		const storedOpportunities = JSON.parse(localStorage.getItem("opportunities")) || [];
		setComments(storedComments);
		setOpportunities(storedOpportunities);
	}, []);

	// Save comments & opportunities to local storage whenever they change
	useEffect(() => {
		localStorage.setItem("comments", JSON.stringify(comments));
		localStorage.setItem("opportunities", JSON.stringify(opportunities));
	}, [comments, opportunities]);

	// Function to add a new comment (internal or client-based)
	const addComment = (text: any, position: any, addcomment_as: any) => {
		const newComment = {
			commentId: Date.now(),
			text,
			position,
			replies: [],
			approved: false,
			addcomment_as,
		};
		setComments((prev) => [...prev, newComment]);
		setShowAdd(newComment.commentId);
	};

	// Function to add a reply to a comment
	const addReply = (commentId: any, newReply: any) => {
		setComments((prev) =>
			prev.map((comment) =>
				comment.commentId === commentId
					? {
						...comment,
						replies: [...(comment.replies || []), newReply], // Ensure replies exist
					}
					: comment
			)
		);
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

	// Function to update the position of a comment opportunity
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
			}}
		>
			{children}
		</CommentContext.Provider>
	);
};

