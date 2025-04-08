// import React, { useRef, useState } from "react";
// import SignaturePad from "react-signature-canvas";


// export default function SignatureInput({ value, onChange }) {
// 	const [signed, setSigned] = useState(false);
// 	const sigCanvas = useRef<SignaturePad>(null);

// 	const handleEnd = () => {
// 		const dataURL = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
// 		setSigned(true);
// 		onChange(dataURL); // or extract text if needed
// 	};

// 	const clearSignature = () => {
// 		sigCanvas.current.clear();
// 		setSigned(false);
// 		onChange("");
// 	};

// 	return (
// 		<div className="w-full">
// 			{!signed ? (
// 				<div className="border rounded-xl p-2">
// 					<SignaturePad
// 						ref={sigCanvas}
// 						canvasProps={{
// 							className: "w-full h-[150px] bg-white rounded-xl border"
// 						}}
// 						onEnd={handleEnd}
// 					/>
// 					<button
// 						type="button"
// 						onClick={clearSignature}
// 						className="mt-2 text-sm text-blue-500 underline"
// 					>
// 						Clear
// 					</button>
// 				</div>
// 			) : (
// 				<input
// 					type="text"
// 					value={value}
// 					placeholder="Signed name"
// 				/>
// 			)}
// 		</div>
// 	);
// }


import React, { useRef } from "react";
import SignaturePad from "react-signature-canvas";

export default function SignatureInput({ value, onChange }) {
	const sigCanvas = useRef<SignaturePad>(null);

	const handleEnd = () => {
		const dataURL = sigCanvas.current
			?.getTrimmedCanvas()
			.toDataURL("image/png");
		onChange(dataURL);
		console.log('sigCanvas-sigCanvas', dataURL)
	};

	const clearSignature = () => {
		sigCanvas.current?.clear();
		onChange("");
	};



	return (
		<div className="w-full">
			<div className="border rounded-xl p-2">
				<SignaturePad
					ref={sigCanvas}
					canvasProps={{
						className: "w-full h-[150px] bg-white rounded-xl border"
					}}
					onEnd={handleEnd}
				/>
				<div className="flex justify-between items-center mt-2">
					<button
						type="button"
						onClick={clearSignature}
						className="text-sm text-blue-500 underline"
					>
						Clear
					</button>
					{value && (
						<span className="text-xs text-gray-500">
							Signature saved
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

