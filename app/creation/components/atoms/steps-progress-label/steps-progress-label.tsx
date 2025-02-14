"use client";

interface StepsProps {
  step: string;
  substep?: string;
  status: "success" | "ongoing" | "pending" | string;
}

const StepsProgressLabel = ({ step, substep, status }: StepsProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-app-success";
      case "ongoing":
        return "text-app-primary";
      case "pending":
        return "text-app-gray";
      default:
        return "text-app-gray";
    }
  };

  return (
    <div>
      <div className={`flex flex-col gap-y-2 ${getStatusColor()} min-h-[40px]`}>
        <div className="font-semibold text-[15px]">{step}</div>
        {substep && (
          <span className="font-medium bg-[#EBFEF4] text-[13px] rounded-[50px] py-1  px-3">
            {substep}
          </span>
        )}
      </div>
    </div>
  );
};

export default StepsProgressLabel;
