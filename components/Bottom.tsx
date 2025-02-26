// Bottom.tsx
import Image from 'next/image';
import clsx from 'clsx';
import Continue from '../public/arrow-back-outline.svg';
import Back from '../public/eva_arrow-back-outline.svg';
import { useActive } from '../app/utils/ActiveContext';
import AlertMain from '../components/Alert/AlertMain';
import { useState } from 'react';
import { useObjectives } from '../app/utils/useObjectives';

interface BottomProps {
  setIsOpen: (isOpen: boolean) => void;
}

const Bottom = ({ setIsOpen }: BottomProps) => {
  const { active, setActive, subStep, setSubStep } = useActive();
  const { selectedObjectives } = useObjectives();
  const [triggerError, setTriggerError] = useState(false);

  const handleBack = () => {
    if (subStep > 0) {
      setSubStep((prev) => prev - 1);
    } else {
      if (active === 8) {
        setSubStep(1);
      } else if (active === 7) {
        setSubStep(0);
      } else {
        setSubStep(0);
      }
      setActive((prev) => Math.max(0, prev - 1));
    }
  };

  const handleContinue = () => {
    // Check if at least one objective is selected when on the campaign objective step (assuming active === 0 or adjust as needed)
    if (active === 1 && selectedObjectives.length === 0) {
      setTriggerError(true);
      return; // Prevent navigation
    }

    setTriggerError(false); // Clear error if proceeding

    if (active === 8 && subStep < 2) {
      setSubStep((prev) => prev + 1);
    } else if (active === 7 && subStep === 0) {
      setSubStep(1);
    } else {
      setSubStep(0);
      setActive((prev) => Math.min(10, prev + 1));
    }
  };

  return (
    <footer id="footer" className="w-full">
      {triggerError && (
        <AlertMain
          alert={{
            variant: 'error',
            message: 'Please select exactly one campaign objective!',
            position: 'bottom-right',
          }}
        />
      )}
      <div className="flex justify-between w-full">
        {/* Back Button */}
        <button
          className={clsx(
            'bottom_black_back_btn',
            active === 0 && subStep === 0 && 'opacity-50 cursor-not-allowed',
            active > 0 && 'hover:bg-gray-200'
          )}
          onClick={handleBack}
          disabled={active === 0 && subStep === 0}
        >
          <Image src={Back} alt="Back" />
          <p>Back</p>
        </button>

        {/* Continue Button */}
        {active === 10 ? (
          <button
            className={clsx('bottom_black_next_btn hover:bg-blue-500')}
            onClick={() => setIsOpen(true)}
          >
            <p>Confirm</p>
            <Image src={Continue} alt="Continue" />
          </button>
        ) : (
          <button
            className={clsx(
              'bottom_black_next_btn',
              active === 10 && 'opacity-50 cursor-not-allowed',
              active < 10 && 'hover:bg-blue-500'
            )}
            onClick={handleContinue}
            disabled={active === 10}
          >
            <p>Continue</p>
            <Image src={Continue} alt="Continue" />
          </button>
        )}
      </div>
    </footer>
  );
};

export default Bottom;