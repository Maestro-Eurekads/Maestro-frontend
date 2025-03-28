"use client";

// import React, { createContext, useContext, useState, useEffect } from "react";

// // Create Context
// const CommentContext = createContext(null);

// // Custom Hook to use Comment Context
// export const useComments = () => {
// 	return useContext(CommentContext);
// };

// // Context Provider Component
// export const CommentProvider = ({ children }) => {
// 	const [comments, setComments] = useState([]);

// 	// Load comments from local storage on mount
// 	useEffect(() => {
// 		const storedComments = JSON.parse(localStorage.getItem("comments")) || [];
// 		setComments(storedComments);
// 	}, []);

// 	// Save comments to local storage whenever they change
// 	useEffect(() => {
// 		localStorage.setItem("comments", JSON.stringify(comments));
// 	}, [comments]);

// 	// Function to add a new comment
// 	const addComment = (text) => {
// 		const newComment = {
// 			id: Date.now(),
// 			text,
// 			replies: [],
// 			approved: false,
// 		};
// 		setComments((prev) => [...prev, newComment]); // Updates state in real-time
// 	};

// 	// Function to add an internal comment
// 	const addInternalComment = (text) => {
// 		const newComment = {
// 			id: Date.now(),
// 			text,
// 			replies: [],
// 			approved: false,
// 			internal: true, // Distinguish internal comments if needed
// 		};
// 		setComments((prev) => [...prev, newComment]);
// 	};

// 	// Function to add a reply to a comment 
// 	const addReply = (commentId, newReply) => {
// 		setComments((prev) =>
// 			prev.map((comment) =>
// 				comment.id === commentId
// 					? {
// 						...comment,
// 						replies: [...(comment.replies || []), newReply], // Ensure replies exist
// 					}
// 					: comment
// 			)
// 		);
// 	};


// 	return (
// 		<CommentContext.Provider value={{ comments, addComment, addReply, addInternalComment }}>
// 			{children}
// 		</CommentContext.Provider>
// 	);
// };


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
	const [opportunities, setOpportunities] = useState([]); // Separate state for opportunities
	const [showAdd, setShowAdd] = useState(null); // Manage "HiOutlinePlus" visibility globally
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

	// Save comments & opportunities to local storage whenever they change
	useEffect(() => {
		localStorage.setItem("comments", JSON.stringify(comments));
		localStorage.setItem("opportunities", JSON.stringify(opportunities));
	}, [comments, opportunities]);

	// Function to add a new comment
	const addComment = (text, position) => {
		const newComment = {
			id: Date.now(),
			text,
			position,
			replies: [],
			approved: false,
		};
		setComments((prev) => [...prev, newComment]);
		setShowAdd(newComment.id);
	};

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

	// Function to add a new comment opportunity
	const createCommentOpportunity = () => {
		const newOpportunity = {
			id: Date.now(),
			text: "New Comment Opportunity",
			position: { x: 150, y: 150 },
		};
		setOpportunities((prev) => [...prev, newOpportunity]); // Update opportunities state
	};

	// Function to update position of a comment opportunity
	const updateOpportunityPosition = (id, newPosition) => {
		setOpportunities((prev) =>
			prev.map((opportunity) =>
				opportunity.id === id ? { ...opportunity, position: newPosition } : opportunity
			)
		);
	};
	//  Function to add a new Comment Opportunity
	const addCommentOpportunity = (newOpportunity) => {
		setOpportunities((prev) => [...prev, newOpportunity]);
	};

	const clearCommentsAndOpportunities = () => {
		// setComments([]);
		setOpportunities([]);
	};

	return (
		<CommentContext.Provider value={{
			comments,
			opportunities,
			addComment,
			createCommentOpportunity,
			updateOpportunityPosition,
			addCommentOpportunity,
			showAdd,
			setShowAdd,
			addReply,
			clearCommentsAndOpportunities,
			setViewcommentsId,
			viewcommentsId,
			isDrawerOpen,
			setIsDrawerOpen
		}}>
			{children}
		</CommentContext.Provider>
	);
};
