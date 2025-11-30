"use client";
import { useState, useEffect } from "react";
import { useActive } from "../app/utils/ActiveContext";
import { useSearchParams } from "next/navigation";
import AlertMain from "./Alert/AlertMain";

const CreationFlow = ({ steps }) => {
  const { active, setActive, setSubStep } = useActive();
  const [hydrated, setHydrated] = useState(false);
  const [alert, setAlert] = useState(null);
  const query = useSearchParams();
  const cId = query.get("campaignId");

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  if (!hydrated) return null;

  return (
    <div id="Sidenavbar">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = active === stepNumber;
        const isCompleted = active > stepNumber;
        const stepColor = isActive
          ? "bg-blue-500 text-white"
          : isCompleted
            ? "bg-green-500 text-white"
            : "bg-gray-300 text-gray-700";
        const stepColors = isActive
          ? "SideBar_state_text_active"
          : isCompleted
            ? "SideBar_state_text_done"
            : "SideBar_state_text";

        return (
          <div
            className=" cursor-pointer"
            key={stepNumber}
            onClick={() => {
              if (stepNumber === 7 || stepNumber === 8) {
                setSubStep(0)
              }
              setActive(stepNumber);

            }}
            style={{
              display: stepNumber === 6 ? "none" : "flex"
            }}
          >
            {alert && <AlertMain alert={alert} />}
            <div className="SideBar__state__container">
              <div className={`${step?.sidecircle} ${stepColor}`}>
                {step?.img}
              </div>
              {stepNumber !== steps?.length && (
                <div
                  className={`${step.vl} ${active > stepNumber + 1
                      ? `${step?.vl_done}`
                      : active === stepNumber + 1
                        ? `${step?.vl_active}`
                        : ""
                    }`}
                />
              )}
            </div>
            <div className={`${step?.state_text}`}>
              <span className={`mb-2 SideBar_state_text ${stepColors}`}>
                {step?.title}
              </span>
              {isCompleted && step?.objective && (
                <div className="objective_step_text whitespace-wrap break-words">
                  {step?.objective}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CreationFlow;
