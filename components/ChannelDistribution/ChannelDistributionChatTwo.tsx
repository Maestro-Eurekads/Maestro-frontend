import Google from "../../public/Google.svg";
import facebook from "../../public/facebook.svg";
import ig from "../../public/ig.svg";
import quantcast from "../../public/quantcast.svg";
import youtube from "../../public/youtube.svg";
import tradedesk from "../../public/tradedesk.svg";
import Image from "next/image";
import ThreeValuesProgress from "../ThreeValuesProgress";
import { useCampaigns } from "app/utils/CampaignsContext";
import { getCurrencySymbol } from "components/data";

const platforms = [
  {
    img: <Image src={facebook} alt="facebook" />,
    name: "Facebook",
    amount: "4 200 €",
    values: [37, 23, 40],
  },
  {
    img: <Image src={ig} alt="facebook" />,
    name: "Instagram",
    amount: "3 500 €",
    values: [40, 30, 30],
  },
  {
    img: <Image src={youtube} alt="quantcast" />,
    name: "YouTube",
    amount: "5 000 €",
    values: [100, 0, 0],
  },
  {
    img: <Image src={tradedesk} alt="quantcast" />,
    name: "TheTradeDesk",
    amount: "2 800 €",
    values: [0, 35, 30],
  },
  {
    img: <Image src={quantcast} alt="quantcast" />,
    name: "Quantcast",
    amount: "3 200 €",
    values: [0, 28, 34],
  },
  {
    img: <Image src={Google} alt="Google" />,
    name: "Google",
    amount: "6 100 €",
    values: [0, 0, 100],
  },
];

const ChannelDistributionChatTwo = ({ channelData, currency }) => {
  const {campaignFormData} = useCampaigns()
  return (
    <div className="flex flex-col gap-[20px]">
      {channelData?.map((platform, index) => (
        <div key={index} className="flex flex-col gap-[10px]">
          {/* Platform Name & Amount */}
          <div className="flex justify-between items-center mt-[24px]">
            <div className="flex items-center gap-2">
              {/* <p>{platform.img}</p> */}
              <p>{platform.platform_name}</p>
            </div>
            <div className="w-[72px] h-[29px] flex flex-row justify-center items-center p-[5px] px-[12px] gap-[8px] bg-[#E8F6FF] border border-[rgba(49,117,255,0.1)] rounded-[50px]">
              <p className="font-semibold text-[14px] leading-[19px] text-[#3175FF] whitespace-nowrap">
                {platform.platform_budegt ?? 0} {" "} {platform?.platform_budegt > 0 && currency}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <ThreeValuesProgress
              values={platform?.stages_it_was_found?.map(
                (st) => st?.percentage ?? 0
              )}
              color={platform?.stages_it_was_found?.map((ch) =>
                ch?.stage_name === "Awareness"
                  ? "bg-[#3175FF]"
                  : ch?.stage_name === "Consideration"
                  ? "bg-[#00A36C]"
                  : ch?.stage_name === "Conversion"
                  ? "bg-[#FF9037]"
                  : "bg-[#F05406]"
              )}
              showpercent={false}
            />
          </div>

          {/* Legend */}
          <div className="flex  gap-[16px] items-center mt-[10px] flex-wrap">
            {platform?.stages_it_was_found?.map((platform, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-[12px] h-[12px] rounded-[4px]"
                  style={{
                    backgroundColor:
                      platform?.stage_name === "Awareness"
                        ? "#3175FF"
                        : platform?.stage_name === "Consideration"
                        ? "#00A36C"
                        : platform?.stage_name === "Conversion"
                        ? "#FF9037"
                        : "#F05406]",
                  }}
                ></div>
                <div className="flex items-center gap-[2px]">
                  <p className="font-medium text-[14px] leading-[19px] text-[rgba(6,18,55,0.8)]">
                    {platform?.stage_name}
                  </p>
                  <span className="font-semibold text-[16px] leading-[22px] text-[#061237]">
                    ({platform.percentage?.toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChannelDistributionChatTwo;
