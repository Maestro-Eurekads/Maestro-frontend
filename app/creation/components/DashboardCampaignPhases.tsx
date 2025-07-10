"use client";

const DashboardCampaignPhases = ({ campaignPhases }) => {



  return (
    <div className="campaign_phases_container_two flex flex-col gap-[28px]">
      {campaignPhases?.map((phase, index) => {
        return (
          <div key={index} className="flex items-center gap-2">
            <div
              className={`w-[12px] h-[12px] rounded-[4px]`}
              style={{ backgroundColor: phase.color }}
            ></div>
            <div className="flex items-center gap-[2px]">
              <p className="font-medium text-[16px] leading-[22px] flex items-center text-[rgba(6,18,55,0.8)]">
                {phase?.name}
              </p>
              <span className="font-semibold text-[16px] leading-[22px] flex items-center text-[#061237]">
                ({Number(phase?.percentage) ? Math.round(Number(phase.percentage)) : 0}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCampaignPhases;