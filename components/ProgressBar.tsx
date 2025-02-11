export default function ProgressBar({ progress }) {
	return (
		<div className="flex items-center gap-2">
			<div className="w-[105px] h-[6px] bg-[#E8F6FF] rounded-[8px] overflow-hidden relative">
				<div
					className="h-full bg-blue-500 transition-all duration-300 rounded-md"
					style={{ width: `${progress}%` }}
				></div>
			</div>
			<span className="text-sm font-medium text-gray-700">{progress}%</span>
		</div>
	);
}
