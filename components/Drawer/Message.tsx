import React from 'react'
import Image from "next/image";
import Mmessages from "../../public/message-2.svg";
import AddAsInternalcomment from './AddAsInternalcomment';

const Message = ({ message, setAddMessage, addComment, isOpen, setMessage }) => {
	return (

		<div>
			{isOpen && <div className="absolute left-[30%] bottom-[30%] z-50">
				{message ? (
					<AddAsInternalcomment />
				) : (
					<button className='' onClick={() => setMessage(true)}>
						<Image src={Mmessages} alt="closecircle" />
					</button>
				)}
			</div>}
		</div>

	);
};

export default Message;
