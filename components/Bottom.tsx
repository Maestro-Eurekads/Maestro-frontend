// components/Bottom.tsx
"use client";
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
  const { selectedObjectives, selectedFunnels } = useObjectives();
  const [triggerObjectiveError, setTriggerObjectiveError] = useState(false);
  const [triggerFunnelError, setTriggerFunnelError] = useState(false);

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
    // Check for objectives on step 1
    if (active === 1 && selectedObjectives.length === 0) {
      setTriggerObjectiveError(true);
      return; // Prevent navigation
    }

    // Check for funnels on step 2
    if (active === 2 && selectedFunnels.length === 0) {
      setTriggerFunnelError(true);
      return; // Prevent navigation
    }

    // Clear errors if proceeding
    setTriggerObjectiveError(false);
    setTriggerFunnelError(false);

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
      {triggerObjectiveError && (
        <AlertMain
          alert={{
            variant: 'error',
            message: 'Please select at least one campaign objective!',
            position: 'bottom-right',
          }}
        />
      )}
      {triggerFunnelError && (
        <AlertMain
          alert={{
            variant: 'error',
            message: 'Please select at least one funnel stage!',
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