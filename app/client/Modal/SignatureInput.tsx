"use client";
import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";


export default function SignatureInput({ value, onChange, setSign }) {
	const sigCanvas = useRef<SignatureCanvas>(null);

	const handleEnd = (e: MouseEvent) => {
		const dataURL = sigCanvas?.current?.getTrimmedCanvas()?.toDataURL("image/png");
		console.log('dataURL', dataURL)
		setSign(dataURL);
	};




	const clearSignature = () => {
		sigCanvas.current?.clear();
		onChange("");
	};





	return (
		<div className="w-full">
			<div className="border rounded-xl p-2">
				<SignatureCanvas
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

