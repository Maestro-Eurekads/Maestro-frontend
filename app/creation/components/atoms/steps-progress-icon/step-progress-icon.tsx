import { IconType } from "react-icons";

interface StepsIconProps {
  Icon: IconType;
  status: string;
}

const StepIcons = ({ Icon, status }: StepsIconProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "bg-app-success";
      case "ongoing":
        return "bg-app-primary";
      case "pending":
        return "bg-app-gray";
      default:
        return "bg-app-gray";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <span
        className={`flex ${getStatusColor()} w-[24px] h-[24px] rounded-full justify-center items-center`}
      >
        <Icon className="text-sm text-white" />
      </span>
      {/* {!isLast && <div className="w-[2px] bg-app-gray "></div>} */}
    </div>
  );
};

export default StepIcons;
