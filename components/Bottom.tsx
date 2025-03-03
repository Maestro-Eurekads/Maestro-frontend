"use client";
import Image from 'next/image';
import clsx from 'clsx';
import Continue from '../public/arrow-back-outline.svg';
import Back from '../public/eva_arrow-back-outline.svg';
import { useActive } from '../app/utils/ActiveContext';
import AlertMain from '../components/Alert/AlertMain';
import { useState, useEffect } from 'react';
import { useObjectives } from '../app/utils/useObjectives';

interface BottomProps {
  setIsOpen: (isOpen: boolean) => void;
}

const Bottom = ({ setIsOpen }: BottomProps) => {
  const { active, setActive, subStep, setSubStep } = useActive();
  const { selectedObjectives, selectedFunnels } = useObjectives();
  const [triggerObjectiveError, setTriggerObjectiveError] = useState(false);
  const [triggerFunnelError, setTriggerFunnelError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Hide alerts after a few seconds
  useEffect(() => {
    if (triggerObjectiveError || triggerFunnelError) {
      const timer = setTimeout(() => {
        setTriggerObjectiveError(false);
        setTriggerFunnelError(false);
      }, 3000); // Hides alert after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [triggerObjectiveError, triggerFunnelError]);

  const handleBack = () => {
    if (subStep > 0) {
      setSubStep((prev) => prev - 1);
    } else {
      if (active === 8) {
        setSubStep(1);
      } else {
        setSubStep(0);
      }
      setActive((prev) => Math.max(0, prev - 1));
    }
  };

  const handleContinue = () => {
    let hasError = false;

    // Show error only once when conditions are met
    if (active === 1 && selectedObjectives.length === 0) {
      setTriggerObjectiveError(true);
      hasError = true;
    }

    if (active === 2 && selectedFunnels.length === 0) {
      setTriggerFunnelError(true);
      hasError = true;
    }

    if (hasError) return; // Stop further execution if there’s an error

    // Clear errors and proceed
    setTriggerObjectiveError(false);
    setTriggerFunnelError(false);

    if (active === 8 && subStep < 2) {
      setSubStep((prev) => prev + 1);
    } else {
      setSubStep(0);
      setActive((prev) => Math.min(10, prev + 1));
    }
  };

  return (
    <footer id="footer" className="w-full">
      {/* Show alert only when needed */}
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
        {active === 0 ?
          <div /> :
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
        }
        {/* Continue Button */}
        {active === 10 ? (
          <button
            className="bottom_black_next_btn hover:bg-blue-500"
            onClick={() => setIsOpen(true)}
          >
            <p>Confirm</p>
            <Image src={Continue} alt="Continue" />
          </button>
        ) : (
          <button
            className={clsx(
              "bottom_black_next_btn whitespace-nowrap",
              active === 10 && "opacity-50 cursor-not-allowed",
              active < 10 && "hover:bg-blue-500"
            )}
            onClick={handleContinue}
            disabled={active === 10}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <p>
              {active === 0
                ? "Start Creating"
                : isHovered
                  ? "Next Step"
                  : "Continue"}
            </p>
            <Image src={Continue} alt="Continue" />
          </button>
        )}
      </div>
    </footer>
  );
};

export default Bottom;
