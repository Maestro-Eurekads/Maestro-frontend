import React, { useState, useRef } from "react";
import { MdDragHandle, MdOutlineKeyboardArrowDown } from "react-icons/md";
import Image from 'next/image';
import icroundadd from '../public/ic_round-add.svg';


const DraggableChannel = ({ bg, description, setShow, openChannel, setOpenChannel, Icon, dateList }) => {
	const [position, setPosition] = useState(0);
	const [width, setWidth] = useState(400);
	const isResizing = useRef(null);
	const isDragging = useRef(null);

	const handleMouseDownResize = (e, direction) => {
		e.preventDefault();
		isResizing.current = { startX: e.clientX, startWidth: width, startPos: position, direction };
		document.addEventListener("mousemove", handleMouseMoveResize);
		document.addEventListener("mouseup", handleMouseUp);
	};

	const handleMouseMoveResize = (e) => {
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

		setWidth(newWidth);
		setPosition(newPos);
	};

	const handleMouseDownDrag = (e) => {
		e.preventDefault();
		isDragging.current = { startX: e.clientX, startPos: position };
		document.addEventListener("mousemove", handleMouseMoveDrag);
		document.addEventListener("mouseup", handleMouseUp);
	};

	const handleMouseMoveDrag = (e) => {
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
		<div className="relative w-full h-14 flex select-none" style={{
			transform: `translateX(${position}px)`
		}}>
			<div
				className="w-5 h-full bg-opacity-80 bg-black cursor-ew-resize rounded-l-lg text-white flex items-center justify-center"
				onMouseDown={(e) => handleMouseDownResize(e, "left")}
			>
				<MdDragHandle className="rotate-90" />
			</div>
			<div
				className="h-full flex justify-between items-center text-white px-4 gap-2 border shadow-md min-w-[150px] cursor-move"
				style={{
					// display: "grid",
					// gridTemplateColumns: `repeat(${dateList.length}, 1fr)`,
					width,
					backgroundColor: bg
				}}

				onMouseDown={handleMouseDownDrag}
			>
				<div />
				<button className="flex items-center gap-3" onClick={() => setOpenChannel(!openChannel)}>
					{Icon}
					<span className="font-medium">{description}</span>
					<MdOutlineKeyboardArrowDown />
				</button>

				<button className="channel-btn " onClick={() => {
					setShow(prev => !prev);
					setOpenChannel(true);
				}}>
					<Image src={icroundadd} alt="icroundadd" />
					<p>Add new channel</p>
				</button>
			</div>
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
