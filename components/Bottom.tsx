import Image from "next/image";
import Continue from '../public/arrow-back-outline.svg';
import Back from '../public/eva_arrow-back-outline.svg';
import { useActive } from "../app/utils/ActiveContext";

const Bottom = () => {
	const { active, setActive } = useActive();

	// Handle Back button click (decrease but not below 1)
	const handleBack = () => {
		setActive((prev) => Math.max(1, prev - 1));
	};

	// Handle Continue button click (increase but not above 8)
	const handleContinue = () => {
		setActive((prev) => Math.min(8, prev + 1));
	};

	return (
		<footer id="footer" className="w-full">
			<div className="flex justify-between w-full">
				{/* Back Button */}
				<button
					className={`bottom_black_back_btn 
          ${active === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
					onClick={handleBack}
					disabled={active === 1}
				>
					<Image src={Back} alt="menu" />
					<p>Back</p>
				</button>

				{/* Continue Button */}
				<button
					className={`bottom_black_next_btn   
          ${active === 8 ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-200"}`}
					onClick={handleContinue}
					disabled={active === 8}
				>
					<p>Continue</p>
					<Image src={Continue} alt="menu" />
				</button>
			</div>
		</footer>
	);
};

export default Bottom;
