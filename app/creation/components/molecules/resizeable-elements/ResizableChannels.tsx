"use client";
import React, { useState, useEffect } from "react";
import { MdDragHandle } from "react-icons/md";
import reddelete from '../../../../../public/red-delete.svg';
import Image from "next/image";
import { useFunnelContext } from "../../../../utils/FunnelContextType";

const ResizableChannels = ({ channels, parentId }) => {
	const { funnelWidths } = useFunnelContext(); // Get parent widths
	const parentWidth = funnelWidths[parentId] || 400; // Default to 400px if not found

	// Initialize child width based on available parent space
	const [channelState, setChannelState] = useState(
		channels.map(() => ({ left: 0, width: Math.min(150, parentWidth) })) // Ensure initial width fits
	);

	const [dragging, setDragging] = useState(null);

	const handleMouseDown = (index, direction) => (event) => {
		event.preventDefault();
		setDragging({ index, direction, startX: event.clientX });
	};

	// Ensure child width does not exceed parent when the parent resizes
	useEffect(() => {
		setChannelState((prev) =>
			prev.map((state) => ({
				...state,
				width: Math.min(state.width, parentWidth), // Adjust width if it exceeds parent
			}))
		);
	}, [parentWidth]); // React to parent width changes

	useEffect(() => {
		if (!dragging) return;

		const handleMouseMove = (event) => {
			event.preventDefault();
			const { index, direction, startX } = dragging;
			const deltaX = event.clientX - startX;

			setChannelState((prev) =>
				prev.map((state, i) => {
					if (i !== index) return state;

					let newWidth =
						direction === "left"
							? Math.max(150, Math.min(state.width - deltaX, parentWidth)) // Ensure it stays within parent width
							: Math.max(150, Math.min(state.width + deltaX, parentWidth));

					return { ...state, width: newWidth };
				})
			);

			setDragging((prev) => ({ ...prev, startX: event.clientX }));
		};

		const handleMouseUp = () => {
			setDragging(null);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [dragging, parentWidth]); // React when parent width changes

	return (
		<div className="open_channel_btn_container">
			{channels.map((channel, index) => (
				<div key={channel.name} className="relative w-full h-12">
					<div
						className="absolute top-0 h-full flex justify-center items-center text-white px-4 gap-2 border shadow-md min-w-[150px]"
						style={{
							left: `${channelState[index]?.left || 0}px`,
							width: `${channelState[index]?.width || 150}px`,
							backgroundColor: channel.bg,
							color: channel.color,
							borderColor: channel.color,
							borderRadius: "10px",
						}}
					>
						<div className="flex items-center gap-3">
							<Image src={channel.icon} alt={channel.icon} />
							<span className="font-medium">{channel.name}</span>
						</div>
					</div>

					<div
						className="absolute top-0 w-5 h-full cursor-ew-resize rounded-l-lg text-white flex items-center justify-center"
						style={{
							left: `${channelState[index]?.left || 0}px`,
							backgroundColor: channel.color,
						}}
						onMouseDown={handleMouseDown(index, "left")}
					>
						<MdDragHandle className="rotate-90" />
					</div>

					<div
						className="absolute top-0 w-5 h-full cursor-ew-resize rounded-r-lg text-white flex items-center justify-center"
						style={{
							left: `${(channelState[index]?.left || 0) + (channelState[index]?.width || 150) - 5}px`,
							backgroundColor: channel.color,
						}}
						onMouseDown={handleMouseDown(index, "right")}
					>
						<MdDragHandle className="rotate-90" />
						<button className="delete-resizeableBar">
							<Image src={reddelete} alt="reddelete" />
						</button>
					</div>
				</div>
			))}
		</div>
	);
};

export default ResizableChannels;
