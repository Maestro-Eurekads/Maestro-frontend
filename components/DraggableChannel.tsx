"use client";

import React, { useState, useRef } from "react";
import { MdDragHandle, MdOutlineKeyboardArrowDown } from "react-icons/md";
import Image from "next/image";
import icroundadd from "../public/ic_round-add.svg";
import { useFunnelContext } from "../app/utils/FunnelContextType";

interface DraggableChannelProps {
	id: string;
	bg: string;
	description: string;
	setIsOpen: (show: boolean) => void;
	openChannel: boolean;
	setOpenChannel: (open: boolean) => void;
	Icon: React.ReactNode;
	dateList: Date[];
}

const DraggableChannel: React.FC<DraggableChannelProps> = ({
	id,
	bg,
	description,
	setIsOpen,
	openChannel,
	setOpenChannel,
	Icon,
	dateList
}) => {
	const { funnelWidths, setFunnelWidth } = useFunnelContext();
	const [position, setPosition] = useState(0);
	const width = funnelWidths[id] || 400;
	const isResizing = useRef<{ startX: number; startWidth: number; startPos: number; direction: "left" | "right" } | null>(null);
	const isDragging = useRef<{ startX: number; startPos: number } | null>(null);

	const handleMouseDownResize = (e: React.MouseEvent<HTMLDivElement>, direction: "left" | "right") => {
		e.preventDefault();
		isResizing.current = { startX: e.clientX, startWidth: width, startPos: position, direction };
		document.addEventListener("mousemove", handleMouseMoveResize);
		document.addEventListener("mouseup", handleMouseUp);
	};

	const handleMouseMoveResize = (e: MouseEvent) => {
		if (!isResizing.current) return;
		const { startX, startWidth, startPos, direction } = isResizing.current;
		let newWidth = startWidth;
		let newPos = startPos;

		if (direction === "left") {
			newWidth = Math.max(150, startWidth - (e.clientX - startX));
			newPos = startPos + (e.clientX - startX);
		} else {
			newWidth = Math.max(150, startWidth + (e.clientX - startX));
		}

		setFunnelWidth(id, newWidth);
		setPosition(newPos);
	};



	const handleMouseDownDrag = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		isDragging.current = { startX: e.clientX, startPos: position };
		document.addEventListener("mousemove", handleMouseMoveDrag);
		document.addEventListener("mouseup", handleMouseUp);
	};

	const handleMouseMoveDrag = (e: MouseEvent) => {
		if (!isDragging.current) return;
		const { startX, startPos } = isDragging.current;
		setPosition(startPos + (e.clientX - startX));
	};

	const handleMouseUp = () => {
		isResizing.current = null;
		isDragging.current = null;
		document.removeEventListener("mousemove", handleMouseMoveResize);
		document.removeEventListener("mousemove", handleMouseMoveDrag);
		document.removeEventListener("mouseup", handleMouseUp);
	};

	return (
		<div className="relative w-full h-14 flex select-none" style={{ transform: `translateX(${position}px)` }}>
			{/* Left Resize Handle */}
			<div
				className="w-5 h-full bg-opacity-80 bg-black cursor-ew-resize rounded-l-lg text-white flex items-center justify-center"
				onMouseDown={(e) => handleMouseDownResize(e, "left")}
			>
				<MdDragHandle className="rotate-90" />
			</div>

			{/* Draggable Content */}
			<div
				className="h-full flex justify-between items-center text-white px-4 gap-2 border shadow-md min-w-[150px] cursor-move"
				style={{ width, backgroundColor: bg }}
				onMouseDown={handleMouseDownDrag}
			>
				<div />
				<button className="flex items-center gap-3" onClick={() => setOpenChannel(!openChannel)}>
					{Icon}
					<span className="font-medium">{description}</span>
					<MdOutlineKeyboardArrowDown />
				</button>

				{width >= 350 ? (
					<button className="channel-btn"
						onClick={() => {
							setIsOpen(true);
						}}
					>
						<Image src={icroundadd} alt="icroundadd" />
						<p>Add new channel</p>
					</button>
				) : <div />}

			</div>

			{/* Right Resize Handle */}
			<div
				className="w-5 h-full bg-opacity-80 bg-black cursor-ew-resize rounded-r-lg text-white flex items-center justify-center"
				onMouseDown={(e) => handleMouseDownResize(e, "right")}
			>
				<MdDragHandle className="rotate-90" />
			</div>
		</div>
	);
};

export default DraggableChannel;
