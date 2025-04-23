import type React from "react";
import Button from "../common/button";
import { useEditing } from "app/utils/EditingContext";

interface SummarySectionProps {
  title: string;
  number: number;
  children: React.ReactNode;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  title,
  number,
  children,
}) => {
  const { midcapEditing, setMidcapEditing } = useEditing();
  return (
    <div className="p-6 bg-white flex flex-col rounded-lg shadow-md w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-blue-500 justify-center items-center w-6 h-6">
            <span className="text-white font-bold">{number}</span>
          </div>
          <h1 className="text-blue-500 font-semibold text-base">{title}</h1>
        </div>
        {midcapEditing?.step === title && midcapEditing?.isEditing ? (
          <>
          <div className="flex items-center gap-[15px]">
            <Button
              text="Confirm Changes"
              variant="primary"
              className="!w-[180px] !h-[40px] !rounded-[8px] !hover:ease-in-out"
            />
            <Button
              text="Cancel"
              variant="secondary"
              className="!w-[180px] !h-[40px] !rounded-[8px] !hover:ease-in-out"
              onClick={()=>setMidcapEditing({step:"", isEditing:false})}
            />
          </div>
          </>
        ) : (
          <Button
            text="Edit"
            variant="primary"
            className="!w-[85px] !h-[40px]"
            onClick={() => setMidcapEditing({ step: title, isEditing: true })}
          />
        )}
      </div>
      {children}
    </div>
  );
};
