import Image from "next/image";
import Continue from '../public/arrow-back-outline.svg';
import Back from '../public/eva_arrow-back-outline.svg';
import { useActive } from "../app/utils/ActiveContext";

const Bottom = () => {
	const { active, setActive, subStep, setSubStep } = useActive();

	const handleBack = () => {
		if (active === 6 && subStep > 0) {
			setSubStep((prev) => prev - 1); // Move back within sub-steps
		} else {
			setSubStep(0); // Reset sub-step when going back
			setActive((prev) => Math.max(1, prev - 1));
		}
	};

	const handleContinue = () => {
		if (active === 6 && subStep < 1) {
			setSubStep((prev) => prev + 1); // Go to the next sub-step
		} else {
			setSubStep(0); // Reset sub-step when advancing
			setActive((prev) => Math.min(9, prev + 1));
		}
	};

	return (
		<footer id="footer" className="w-full">
			<div className="flex justify-between w-full">
				{/* Back Button */}
				<button
					className={`bottom_black_back_btn 
          ${(active === 1 && subStep === 0) ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
					onClick={handleBack}
					disabled={active === 1 && subStep === 0}
				>
					<Image src={Back} alt="menu" />
					<p>Back</p>
				</button>

				{/* Continue Button */}
				<button
					className={`bottom_black_next_btn   
          ${(active === 9) ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-200"}`}
					onClick={handleContinue}
					disabled={active === 9}
				>
					<p>Continue</p>
					<Image src={Continue} alt="menu" />
				</button>
			</div>
		</footer>
	);
};

export default Bottom;
