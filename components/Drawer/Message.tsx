import React, { useEffect, useState } from 'react'
import Image from "next/image";
import Mmessages from "../../public/message-2.svg";
import AddAsInternalcomment from './AddAsInternalcomment';

const Message = ({ message, setAddMessage, addComment, isOpen, setMessage }) => {
	const [show, setShow] = useState(false);
	const [position, setPosition] = useState({ x: 100, y: 100 });
	const [dragging, setDragging] = useState(false);
	const [offset, setOffset] = useState({ x: 0, y: 0 });

	useEffect(() => {
		if (!isOpen) {
			setShow(false);
		}
	}, [isOpen]);

	const handlePointerDown = (e) => {
		setDragging(true);
		setOffset({
			x: e.clientX - position.x,
			y: e.clientY - position.y,
		});
	};

	const handlePointerMove = (e) => {
		if (!dragging) return;
		e.preventDefault(); // Prevent text selection while dragging
		setPosition({
			x: e.clientX - offset.x,
			y: e.clientY - offset.y,
		});
	};

	const handlePointerUp = () => {
		setDragging(false);
	};

	useEffect(() => {
		document.addEventListener("pointermove", handlePointerMove);
		document.addEventListener("pointerup", handlePointerUp);
		return () => {
			document.removeEventListener("pointermove", handlePointerMove);
			document.removeEventListener("pointerup", handlePointerUp);
		};
	}, [dragging]);

	return (
		<div>
			{isOpen && (
				<div
					className="absolute z-50 cursor-grab active:cursor-grabbing"
					style={{
						left: `${position.x}px`,
						top: `${position.y}px`,
						transition: dragging ? "none" : "transform 0.2s ease-out",
					}}
					onPointerDown={handlePointerDown}
				>
					{show ? (
						<AddAsInternalcomment setMessage={setMessage} />
					) : (
						<button onClick={() => setShow(true)}>
							<Image src={Mmessages} alt="closecircle" />
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default Message;