import React, { useEffect, useState } from "react";
import facebook from "../../../public/facebook.svg";
import instagram from "../../../public/instagram.svg";
import youtube from "../../../public/youtube.svg";
import tradedesk from "../../../public/tradedesk.svg";
import quantcast from "../../../public/quantcast.svg";
import adset from "../../../public/adset_level.svg";
import channel from "../../../public/channel_level.svg";

import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import TableView from "./EstablishedGoals/TableView";
import ToggleSwitch from "./EstablishedGoals/ToggleSwitch";
import SetBudgetOverviewModel from "../../../components/Modals/SetBudgetOverviewModel";
import TimelineView from "./EstablishedGoals/TimelineView";
import Modal from "components/Modals/Modal";
import Image from "next/image";
import { useCampaigns } from "app/utils/CampaignsContext";

const channels = [
  {
    icon: facebook,
    name: "Facebook",
    color: "#0866FF",
    audience: "Men 25+ Int. Sport",
    startDate: "01/02/2024",
    endDate: "01/03/2024",
    audienceSize: 50000,
    budgetSize: "1,800 €",
    impressions: 2000000,
    reach: 2000000,
    hasChildren: true,
  },
  {
    icon: instagram,
    name: "Instagram",
    color: "#E01389",
    audience: "Lookalike Buyers 90D",
    startDate: "01/02/2024",
    endDate: "01/03/2024",
    audienceSize: 40000,
    budgetSize: 8000,
    impressions: 2000000,
    reach: 2000000,
    hasChildren: true,
  },
  {
    icon: youtube,
    name: "Youtube",
    color: "#FF0302",
    audience: "Men 25+ Int. Sport",
    startDate: "01/02/2024",
    endDate: "01/03/2024",
    audienceSize: 60000,
    budgetSize: 12000,
    impressions: 2000000,
    reach: 2000000,
    hasChildren: false,
  },
  {
    icon: tradedesk,
    name: "TheTradeDesk",
    color: "#0099FA",
    audience: "Lookalike Buyers 90D",
    startDate: "01/02/2024",
    endDate: "01/03/2024",
    audienceSize: 60000,
    budgetSize: 12000,
    impressions: 2000000,
    reach: 2000000,
    hasChildren: false,
  },
  {
    icon: quantcast,
    name: "Quantcast",
    color: "#061237",
    audience: "Men 25+ Int. Sport",
    startDate: "01/02/2024",
    endDate: "01/03/2024",
    audienceSize: 60000,
    budgetSize: 12000,
    impressions: 2000000,
    reach: 2000000,
    hasChildren: false,
  },
];

export const EstablishedGoals = () => {
  const [active, setActive] = useState("Timeline View");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  //   const [selectedGoal, setSelectedGoal] = useState("");
  const { setCampaignFormData, campaignFormData } = useCampaigns();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(()=>{
	if(campaignFormData){
		if(campaignFormData?.goal_level){
			setIsModalOpen(false)
		} else {
			setIsModalOpen(true)
		}
	}

  }, [campaignFormData])

  return (
    <div>
      <div className="creation_continer">
        <div className="flex justify-between ">
          <PageHeaderWrapper
            t1={"Establish your goals"}
            t2={
              "Define the KPIs for each phase, channel, and ad set. Use the Table View to input and customize"
            }
            t3={
              "your metrics, and switch to the Timeline View to visualize them across the campaign."
            }
          />

          <SetBudgetOverviewModel />
        </div>

        <div className="my-9">
          <ToggleSwitch active={active} setActive={setActive} />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      >
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

      {<TableView channels={channels} />}
    </div>
  );
};
