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

	// Load comments from local storage on mount
	useEffect(() => {
		const storedComments = JSON.parse(localStorage.getItem("comments")) || [];
		setComments(storedComments);
	}, []);

	// Save comments to local storage whenever they change
	useEffect(() => {
		localStorage.setItem("comments", JSON.stringify(comments));
	}, [comments]);

	// Function to add a new comment
	const addComment = (text) => {
		const newComment = {
			id: Date.now(),
			text,
			replies: [],
			approved: false,
		};
		setComments((prev) => [...prev, newComment]); // Updates state in real-time
	};

	// Function to add an internal comment
	const addInternalComment = (text) => {
		const newComment = {
			id: Date.now(),
			text,
			replies: [],
			approved: false,
			internal: true, // Distinguish internal comments if needed
		};
		setComments((prev) => [...prev, newComment]);
	};

	// Function to add a reply to a comment 
	const addReply = (commentId, newReply) => {
		setComments((prev) =>
			prev.map((comment) =>
				comment.id === commentId
					? {
						...comment,
						replies: [...(comment.replies || []), newReply], // Ensure replies exist
					}
					: comment
			)
		);
	};


	return (
		<CommentContext.Provider value={{ comments, addComment, addReply, addInternalComment }}>
			{children}
		</CommentContext.Provider>
	);
};
