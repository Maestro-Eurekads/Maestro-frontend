"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import speaker from "../../../public/mdi_megaphone.svg";
import up from "../../../public/arrow-down.svg";
import down2 from "../../../public/arrow-down-2.svg";
import orangecredit from "../../../public/orangecredit-card.svg";
import tablerzoomfilled from "../../../public/tabler_zoom-filled.svg";
import facebook from "../../../public/facebook.svg";
import ig from "../../../public/ig.svg";
import youtube from "../../../public/youtube.svg";
import TheTradeDesk from "../../../public/TheTradeDesk.svg";
import Quantcast from "../../../public/quantcast.svg";
import AdSetsFlow from "./common/AdSetsFlow";
import { useCampaigns } from "../../utils/CampaignsContext";
import { funnels, funnelStages } from "components/data";
import adset from "../../../public/adset_level.svg";
import channel from "../../../public/channel_level.svg";
import Modal from "components/Modals/Modal";

const DefineAdSetPage = () => {
  const [openItems, setOpenItems] = useState({});
  const [stageStatuses, setStageStatuses] = useState<Record<string, string>>(
    {}
  );
  const [hasInteracted, setHasInteracted] = useState<Record<string, boolean>>(
    {}
  );
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  const [step, setStep] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (campaignFormData) {
      if (campaignFormData?.goal_level) {
        setIsModalOpen(false);
      } else {
        setIsModalOpen(true);
      }
    }
  }, []);

  // Initialize statuses and interaction tracking
  useEffect(() => {
    if (campaignFormData?.funnel_stages) {
      const initialStatuses = campaignFormData.funnel_stages.reduce(
        (acc, stageName) => {
          acc[stageName] = "Not started";
          return acc;
        },
        {} as Record<string, string>
      );
      setStageStatuses(initialStatuses);

      const initialInteractions = campaignFormData.funnel_stages.reduce(
        (acc, stageName) => {
          acc[stageName] = false;
          return acc;
        },
        {} as Record<string, boolean>
      );
      setHasInteracted(initialInteractions);
    }
  }, [campaignFormData]);

  const toggleItem = (stage: string) => {
    setOpenItems((prev) => {
      const newOpenItems = { ...prev, [stage]: !prev[stage] };
      // Reset status to "Not started" when opening, regardless of previous state
      if (newOpenItems[stage] && !hasInteracted[stage]) {
        setStageStatuses((prev) => ({ ...prev, [stage]: "Not started" }));
      }
      return newOpenItems;
    });
  };

  const handleInteraction = (stageName: string) => {
    // Only update status to "In progress" when user has actually interacted
    setStageStatuses((prev) => ({ ...prev, [stageName]: "In progress" }));
    setHasInteracted((prev) => ({ ...prev, [stageName]: true }));
  };

  const handleValidate = (stageName: string) => {
    setStageStatuses((prev) => ({ ...prev, [stageName]: "Completed" }));
    setOpenItems((prev) => ({ ...prev, [stageName]: false }));
  };

  const resetInteraction = (stageName: string) => {
    setHasInteracted((prev) => ({ ...prev, [stageName]: false }));
    setStageStatuses((prev) => ({ ...prev, [stageName]: "Not started" }));
  };

  return (
    <div className="mt-12 flex items-start flex-col cursor-pointer mx-auto gap-12 w-full">
      {campaignFormData?.funnel_stages?.map((stageName, index) => {
        const stage = campaignFormData?.custom_funnels?.find(
          (s) => s.name === stageName
        );
        const funn = funnelStages?.find((f) => f.name === stageName);
        if (!stage) return null;

        const currentStatus = stageStatuses[stageName] || "Not started";
        const isCompleted = currentStatus === "Completed";
        const isInProgress = currentStatus === "In progress";

        return (
          <div key={index} className="w-full">
            <div
              className={`flex justify-between items-center p-6 gap-3 w-full h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] 
                ${
                  openItems[stage.name] ? "rounded-t-[10px]" : "rounded-[10px]"
                }`}
              onClick={() => toggleItem(stage.name)}
            >
              <div className="flex items-center gap-4">
                {funn?.icon &&
                  <Image
                    src={funn?.icon || "/placeholder.svg"}
                    alt={stage.name}
                    width={20}
                    height={20}
                  />
                }
                <p className="text-md font-semibold text-[#061237]">
                  {stage.name}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="text-green-500 font-semibold text-base">
                      Completed
                    </p>
                  </div>
                ) : isInProgress ? (
                  <p className="text-[#3175FF] font-semibold text-base">
                    In progress
                  </p>
                ) : (
                  <p className="text-[#061237] opacity-50 text-base">
                    Not started
                  </p>
                )}
              </div>

              <div>
                <Image
                  src={openItems[stage.name] ? up : down2}
                  alt={openItems[stage.name] ? "collapse" : "expand"}
                  width={24}
                  height={24}
                />
              </div>
            </div>
            {openItems[stage.name] && (
              <div
                className={`card_bucket_container_main_sub flex flex-col pb-6 w-full cursor-pointer min-h-[300px] overflow-x-scroll`}
              >
                <AdSetsFlow
                  stageName={stage.name}
                  onInteraction={() => handleInteraction(stage.name)}
                  onValidate={() => handleValidate(stage.name)}
                  isValidateDisabled={!hasInteracted[stage.name]}
                  onEditStart={() => resetInteraction(stage.name)}
                />
              </div>
            )}
          </div>
        );
      })}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {step === 1 && (
          <div className="card bg-base-100 w-[418px]">
            <form method="dialog" className="flex justify-between p-6 !pb-0">
              <span></span>
              <span className="w-[44px] h-[44px] grid place-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                  fill="none"
                >
                  <g clipPath="url(#clip0_1_23349)">
                    <rect
                      x="0.710938"
                      y="0.5"
                      width="24"
                      height="24"
                      rx="12"
                      fill="white"
                    />
                    <path
                      d="M12.7109 24.5C15.8935 24.5 18.9458 23.2357 21.1962 20.9853C23.4467 18.7348 24.7109 15.6826 24.7109 12.5C24.7109 9.3174 23.4467 6.26516 21.1962 4.01472C18.9458 1.76428 15.8935 0.5 12.7109 0.5C9.52834 0.5 6.47609 1.76428 4.22566 4.01472C1.97522 6.26516 0.710938 9.3174 0.710938 12.5C0.710938 15.6826 1.97522 18.7348 4.22566 20.9853C6.47609 23.2357 9.52834 24.5 12.7109 24.5ZM18.0078 10.2969L12.0078 16.2969C11.5672 16.7375 10.8547 16.7375 10.4188 16.2969L7.41875 13.2969C6.97813 12.8562 6.97813 12.1438 7.41875 11.7078C7.85938 11.2719 8.57188 11.2672 9.00781 11.7078L11.2109 13.9109L16.4141 8.70312C16.8547 8.2625 17.5672 8.2625 18.0031 8.70312C18.4391 9.14375 18.4438 9.85625 18.0031 10.2922L18.0078 10.2969Z"
                      fill="#0ABF7E"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1_23349">
                      <rect
                        x="0.710938"
                        y="0.5"
                        width="24"
                        height="24"
                        rx="12"
                        fill="white"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </span>
              <button className="self-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                  fill="none"
                >
                  <path
                    d="M18.7266 6.5L6.72656 18.5M6.72656 6.5L18.7266 18.5"
                    stroke="#717680"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>

            <div className="p-6 pb-0 text-center">
              <h2 className="text-xl mb-4 text-[#181D27] font-[500]">
                Congratulations on completing your media plan!
              </h2>
              <p className="text-[15px] font-[500] text-[#535862]">
                In this last step, we will take take of the numbers behind the
                structure. We will define the objectives and benchmarks for each
                phase, channel and ad set.
              </p>
            </div>

            <div className="card-title p-6">
              <button
                className="btn btn-primary w-full text-sm bg-[#3175FF]"
                onClick={() => setStep(2)}
              >
                Start setting goals
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3 w-[672px] bg-white p-6 rounded-[20px]">
            <form method="dialog" className="flex justify-between p-2 !pb-0">
              <span></span>
              <span className="w-[44px] h-[44px] grid place-items-center">
                <svg
                  width="45"
                  height="44"
                  viewBox="0 0 45 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="0.71"
                    y="0"
                    width="44"
                    height="44"
                    rx="22"
                    fill="#E8F6FF"
                  />
                  <mask
                    id="mask0"
                    style={{ maskType: "luminance" }}
                    maskUnits="userSpaceOnUse"
                    x="13"
                    y="14"
                    width="19"
                    height="16"
                  >
                    <path
                      d="M17.7044 25.7497H14.3711V14.9164H31.0378V25.7497H27.7044H17.7044Z"
                      fill="white"
                      stroke="white"
                      strokeWidth="1.667"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19.3711 21.1664V22.833"
                      stroke="black"
                      strokeWidth="1.667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22.7031 25.7497V28.2497"
                      stroke="white"
                      strokeWidth="1.667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22.7031 19.4997V22.8331M26.0365 17.8331V22.8331"
                      stroke="black"
                      strokeWidth="1.667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17.7031 29.0831H27.7031"
                      stroke="white"
                      strokeWidth="1.667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </mask>
                  <g mask="url(#mask0)">
                    <rect
                      x="12.71"
                      y="12"
                      width="20"
                      height="20"
                      fill="#3175FF"
                    />
                  </g>
                </svg>
              </span>

              <button className="self-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                  fill="none"
                >
                  <path
                    d="M18.7266 6.5L6.72656 18.5M6.72656 6.5L18.7266 18.5"
                    stroke="#717680"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>

            <div className="flex flex-col justify-center w-full">
              <h1 className=" font-general font-semibold text-[20px] leading-[27px] text-gray-900 text-center">
                Choose your goal level
              </h1>
              <p className="  font-general font-medium text-[16px] leading-[150%] text-gray-600 text-center">
                Define how you want to set your benchmarks and goals for your
                media plan.
              </p>
            </div>
            <section className="flex gap-6 mt-[20px]">
              {[
                {
                  img: channel,
                  alt: "Channel Level",
                  label: "Channel level",
                  description: `Input benchmarks and goals for each channel only. 
                The highest level of granularity focuses on channels across all phases.`,
                },
                {
                  img: adset,
                  alt: "Ad Set Level",
                  label: "Adset level",
                  description: `Input benchmarks and goals for individual ad sets within each channel.
                 This focuses on specific ad sets in each phase and channel.`,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="card bg-base-100 shadow p-2 rounded-[16px]"
                >
                  <div className="card-title relative w-full h-[135px]">
                    <figure className="relative w-full h-full rounded-[8px]">
                      <Image src={item.img} fill alt={item.alt} />
                    </figure>
                  </div>

                  <div className="">
                    <div className="p-2 text-center">
                      <h2 className="text-[16px] mb-4 text-[#181D27] font-[600]">
                        {item.label}
                      </h2>
                      <p className="text-[14px] font-[500] text-[#535862]">
                        {item.description}
                      </p>
                    </div>

                    <div className="">
                      <button
                        className="btn btn-primary w-full text-sm bg-[#3175FF]"
                        onClick={() => {
                          setCampaignFormData((prev) => ({
                            ...prev,
                            goal_level: item.label,
                          }));
                          handleCloseModal();
                        }}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DefineAdSetPage;
