import Image from "next/image";
import clsx from "clsx";
import Continue from "../public/arrow-back-outline.svg";
import Back from "../public/eva_arrow-back-outline.svg";
import { useActive } from "../app/utils/ActiveContext";

const Bottom = () => {
  const { active, setActive, subStep, setSubStep } = useActive();

  const handleBack = () => {
    // For steps 5 and 6, allow moving back within sub-steps if possible
    if ((active === 5 || active === 7) && subStep > 0) {
      setSubStep((prev) => prev - 1);
    } else {
      // Otherwise, reset subStep and go back to previous main step
      setSubStep(0);
      setActive((prev) => Math.max(0, prev - 1));
    }
  };

  const handleContinue = () => {
    // For steps 5 and 6, allow moving forward within sub-steps if not already at the last sub-step
    if ((active === 5 || active === 7) && subStep < 1) {
      setSubStep((prev) => prev + 1);
    } else {
      // Otherwise, reset subStep and go to the next main step
      setSubStep(0);
      setActive((prev) => Math.min(10, prev + 1));
    }
  };

  return (
    <footer id="footer" className="w-full">
      <div className="flex justify-between w-full">
        {/* Back Button */}
        <button
          className={clsx(
            "bottom_black_back_btn",
            active === 0 && subStep === 0 && "opacity-50 cursor-not-allowed",
            active > 0 && "hover:bg-gray-200"
          )}
          onClick={handleBack}
          disabled={active === 0 && subStep === 0}
        >
          <Image src={Back} alt="Back" />
          <p>Back</p>
        </button>

        {/* Continue Button */}
        <button
          className={clsx(
            "bottom_black_next_btn",
            active === 10 && "opacity-50 cursor-not-allowed",
            active < 10 && "hover:bg-blue-200"
          )}
          onClick={handleContinue}
          disabled={active === 10}
        >
          <p>Continue</p>
          <Image src={Continue} alt="Continue" />
        </button>
      </div>
    </footer>
  );
};

export default Bottom;
