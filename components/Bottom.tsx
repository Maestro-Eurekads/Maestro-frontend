import Image from "next/image";
import clsx from "clsx";
import Continue from "../public/arrow-back-outline.svg";
import Back from "../public/eva_arrow-back-outline.svg";
import { useActive } from "../app/utils/ActiveContext";

const Bottom = ({ setIsOpen }) => {
  const { active, setActive, subStep, setSubStep } = useActive();

  const handleBack = () => {
    if (subStep > 0) {
      // If there's a previous sub-step, go back within the same step
      setSubStep((prev) => prev - 1);
    } else {
      // Otherwise, move to the previous main step and reset subStep
      if (active === 8) {
        setSubStep(1); // Since active === 8 has two sub-steps, reset it to the last sub-step
      } else if (active === 7) {
        setSubStep(0); // Since active === 7 has only one sub-step, reset it
      } else {
        setSubStep(0); // Reset for steps that don’t use sub-steps
      }
      setActive((prev) => Math.max(0, prev - 1));
    }
  };

  const handleContinue = () => {
    if (active === 8 && subStep < 2) {
      // Only active === 8 has two sub-steps
      setSubStep((prev) => prev + 1);
    } else if (active === 7 && subStep === 0) {
      // Only active === 7 has one sub-step
      setSubStep(1);
    } else {
      // Reset subStep when moving to the next main step
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

        {active === 10 ?
          <button
            className={clsx(
              "bottom_black_next_btn hover:bg-blue-500",
            )}
            onClick={() => setIsOpen(true)}
          // disabled={active === 10}
          >
            <p>Comfirm</p>
            <Image src={Continue} alt="Continue" />
          </button> : <button
            className={clsx(
              "bottom_black_next_btn",
              active === 10 && "opacity-50 cursor-not-allowed",
              active < 10 && "hover:bg-blue-500"
            )}
            onClick={handleContinue}
            disabled={active === 10}
          >
            <p>Continue</p>
            <Image src={Continue} alt="Continue" />
          </button>}

      </div>
    </footer>
  );
};

export default Bottom;
