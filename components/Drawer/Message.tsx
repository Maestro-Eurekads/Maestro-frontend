import React, { useEffect, useState } from 'react'
import Image from "next/image";
import Mmessages from "../../public/message-2.svg";
import AddAsInternalcomment from './AddAsInternalcomment';

const Message = ({ isOpen, setMessage }) => {
	const [show, setShow] = useState(false);

	return (
		<div>
			{isOpen && (
				<div
					className="absolute left-[30%] bottom-[30%] z-50 cursor-grab active:cursor-grabbing"
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