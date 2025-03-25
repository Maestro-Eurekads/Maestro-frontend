// import React, { useState } from 'react'
// import tickcircle from "../../public/tick-circle.svg";
// import tickcircles from "../../public/tick-circle-green.svg";
// import Image from "next/image";


// const Comments = () => {

// 	const [approved, setApproved] = useState(false)


// 	return (
// 		<div  >
// 			<div>
// 				<div className='flex justify-between items-center gap-3 '>
// 					<div className='flex  items-center gap-2 '>
// 						<div className="flex flex-col justify-center items-center p-[10px] gap-[10px] w-[40px] h-[40px] bg-[#00A36C] rounded-full text-[20px] leading-[27px] text-center text-white">D</div>
// 						<div>
// 							<h3 className="font-[500] text-[20px] leading-[27px] text-[#292929]">
// 								Daniel Silva</h3>
// 							<div className='flex items-center gap-2'>
// 								<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">
// 									12/01/25 </p>
// 								<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">
// 									12:09 P.M</p>
// 							</div>
// 						</div>
// 					</div>

// 					{approved ? <div className='flex items-center gap-2 cursor-pointer' onClick={() => setApproved(false)}>
// 						<button className='cursor-pointer'>
// 							<Image src={tickcircles} alt={"tickcircle"} />
// 						</button>
// 						<p className="w-[116px] h-[16px] font-semibold text-[14px] leading-[16px] text-[#00A36C] whitespace-nowrap">
// 							Mark as approved </p>
// 					</div> : <div className='flex items-center gap-2 cursor-pointer' onClick={() => setApproved(true)}>
// 						<button className='cursor-pointer'>
// 							<Image src={tickcircle} alt={"tickcircle"} />
// 						</button>
// 						<p className="w-[116px] h-[16px] font-semibold text-[14px] leading-[16px] text-[#292D32] whitespace-nowrap">
// 							Mark as approved </p>
// 					</div>}

// 				</div>
// 				<p className="font-[500] text-[16px] leading-[22px] text-[#292929] py-5">
// 					This is a sample comment comprising of dummy text and any other existing material. Facebook ad targeting 18-24 works well here.</p>
// 			</div>
// 		</div>
// 	)
// }

// export default Comments


import React, { useState } from "react";
import Image from "next/image";
import tickcircle from "../../public/tick-circle.svg";
import tickcircles from "../../public/tick-circle-green.svg";
import { useComments } from "app/utils/CommentProvider";
import CommentHeader from "./CommentHeader";

const Comments = ({ comment }) => {
	const { comments, setComments } = useComments(); // Access global comments state
	const [approved, setApproved] = useState(comment.approved || false);

	// Toggle approval state
	const handleApproval = () => {
		const updatedComments = comments.map((c) =>
			c.id === comment.id ? { ...c, approved: !approved } : c
		);
		setComments(updatedComments); // Update global state
		setApproved(!approved);
	};

	console.log('comment-comment', comment)

	return (
		<div >
			<div className="flex justify-between items-center gap-3">
				<CommentHeader timestamp={undefined} />
				{/* <div className="flex items-center gap-2">
					<div className="flex flex-col justify-center items-center p-2 w-10 h-10 bg-[#00A36C] rounded-full text-white">
						{comment.author?.[0] || "?"}
					</div>
					<div>
						<h3 className="font-[500] text-[20px] leading-[27px] text-[#292929]">{comment.author}</h3>
						<div className="flex items-center gap-2">
							<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">{comment.date}</p>
							<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">{comment.time}</p>
						</div>
					</div>
				</div> */}

				{/* Approval Button */}
				<div className="flex items-center gap-2 cursor-pointer whitespace-nowrap" onClick={handleApproval}>
					<button className="cursor-pointer">
						<Image src={approved ? tickcircles : tickcircle} alt={"tickcircle"} />
					</button>
					<p className={`w-[116px] font-semibold text-[14px] ${approved ? "text-[#00A36C]" : "text-[#292D32]"}`}>
						{approved ? "Approved" : "Mark as approved"}
					</p>
				</div>
			</div>

			{/* Comment Text */}
			<p className="font-[500] text-[16px] leading-[22px] text-[#292929] py-5">{comment.text}</p>
		</div>
	);
};

export default Comments;

