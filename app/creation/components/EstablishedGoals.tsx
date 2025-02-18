import React, { useState } from "react";
import Modal from "../../utils/components/Modal";
import adset from "../../../public/adset_level.svg";
import channel from "../../../public/channel_level.svg";
import facebook from "../../../public/facebook.svg";
import instagram from "../../../public/instagram.svg";
import youtube from "../../../public/youtube.svg";
import tradedesk from "../../../public/tradedesk.svg";
import quantcast from "../../../public/quantcast.svg";

import Image from "next/image";
import DateComponent from "./molecules/date-component/date-component";
import { DateRangeProvider } from "../../../src/date-range-context";

const channels = [
  {
    icon: facebook,
    name: "Facebook",
    color: "#0866FF",
    audience: "Men 25+ Int. Sport",
    startDate: "01/02/2024",
    endDate: "01/03/2024",
    audienceSize: 50000,
    budgetSize: 10000,
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [view, setView] = useState<"Table" | "Timeline">("Table");

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section className="pt-[40px]">
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
                className="btn btn-primary w-full text-sm"
                onClick={() => setStep(2)}
              >
                Start setting goals
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <main className="flex flex-col gap-3 w-[672px] bg-white p-6 rounded-[20px]">
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
            <header className="mb-6 text-center">
              <h2 className="text-[20px] font-[600] text-[#181D27] mb-3">
                Choose your goal level
              </h2>
              <p className="">
                Define how you want to set your benchmarks and goals for your
                media plan.
              </p>
            </header>
            <section className="flex gap-6 h-full">
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
                        className="btn btn-primary w-full text-sm"
                        onClick={() => setStep(1)}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </main>
        )}
      </Modal>

      <section className="flex flex-col gap-6">
        <header className="m-[40px] mb-[32px]">
          <div className="flex justify-between ">
            <div className="mb-5">
              <h2 className="text-[23px] font-[600] mb-3">
                Establish your goals
              </h2>
              <p className=" my-4 max-w-[793px] w-full">
                Define the KPIs for each phase, channel, and ad set. Use the
                Table View to input and customize your metrics, and switch to
                the Timeline View to visualize them across the campaign.
              </p>
            </div>
            <button
              className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
              style={{ border: "1px solid #3175FF" }}
              onClick={handleOpenModal}
            >
              See budget overview
            </button>
          </div>

          <div>
            <div
              role="tablist"
              className="tabs tabs-lg tabs-boxed bg-[#F5F5F5] !text-[16px] w-full max-w-[300px]"
            >
              <button
                role="tab"
                className={`tab ${view === "Timeline"
                  ? "tab-active !bg-white !text-[#061237] !font-[600]"
                  : ""
                  }`}
                onClick={() => setView("Timeline")}
              >
                Timeline view
              </button>
              <button
                role="tab"
                className={`tab ${view === "Table"
                  ? "tab-active !bg-white !text-[#061237] !font-[600]"
                  : ""
                  }`}
                onClick={() => setView("Table")}
              >
                Table view
              </button>
            </div>
          </div>
        </header>

        {view === "Table" && (
          <div className="  my-5 mx-[40px]">
            <section className="">
              <h1 className="text-[#061237] text-[18px] font-[600] mb-5 flex gap-2">
                <svg
                  width="23"
                  height="22"
                  viewBox="0 0 23 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.7096 7.33335H4.3763C3.89007 7.33335 3.42376 7.52651 3.07994 7.87032C2.73612 8.21414 2.54297 8.68046 2.54297 9.16669V12.8334C2.54297 13.3196 2.73612 13.7859 3.07994 14.1297C3.42376 14.4735 3.89007 14.6667 4.3763 14.6667H5.29297V18.3334C5.29297 18.5765 5.38955 18.8096 5.56145 18.9815C5.73336 19.1534 5.96652 19.25 6.20964 19.25H8.04297C8.28608 19.25 8.51924 19.1534 8.69115 18.9815C8.86306 18.8096 8.95964 18.5765 8.95964 18.3334V14.6667H11.7096L16.293 18.3334V3.66669L11.7096 7.33335ZM20.418 11C20.418 12.5675 19.538 13.9884 18.1263 14.6667V7.33335C19.5288 8.02085 20.418 9.44169 20.418 11Z"
                    fill="#3175FF"
                  />
                </svg>
                Awareness
              </h1>
              <div className=" rounded-xl border border-[#E5E5E5]">
                <div className="rounded-xl overflow-x-auto">
                  <table className="table">
                    {/* Table Head */}
                    <thead>
                      <tr className="">
                        <th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
                          Channel
                        </th>
                        <th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
                          Audience
                        </th>
                        <th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
                          Start Date
                        </th>
                        <th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
                          End Date
                        </th>
                        <th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
                          Audience Size
                        </th>
                        <th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
                          Budget Size (€)
                        </th>
                        <th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
                          CPM (€)
                        </th>
                        <th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
                          Impressions
                        </th>
                        <th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
                          Frequency
                        </th>
                        <th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
                          Reach
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="whitespace-nowrap">
                      {/* Row 1 */}
                      {channels.map((channel, index) => {
                        return (
                          <tr key={index} className="py-6">
                            <td className="py-6 px-6 text-[15px]">
                              <span className="flex items-center gap-2 text-[#0866FF]">
                                {channel.hasChildren && (
                                  <span>
                                    <svg
                                      width="17"
                                      height="16"
                                      viewBox="0 0 17 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M5.38021 6.66667L8.71354 10L12.0469 6.66667"
                                        stroke="#061237"
                                        strokeOpacity="0.8"
                                        strokeWidth="1.33333"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </span>
                                )}
                                <span className="relative w-[16px] h-[16px]">
                                  <Image
                                    src={channel.icon}
                                    fill
                                    alt="Facebook Icon"
                                  />
                                </span>
                                <span>{channel.name}</span>
                              </span>
                            </td>
                            <td className="py-6 px-6">{channel.audience}</td>
                            <td className="py-6 px-6">{channel.startDate}</td>
                            <td className="py-6 px-6">{channel.endDate}</td>
                            <td className="py-6 px-6">
                              {channel.audienceSize}
                            </td>
                            <td className="py-6 px-6">{channel.budgetSize}</td>
                            <td className="py-6 px-6">
                              <input
                                type="text"
                                name=""
                                id=""
                                placeholder="Enter CPM"
                                className="bg-transparent border-none outline-none w-full"
                              />
                            </td>
                            <td className="py-6 px-6">{channel.audience}</td>
                            <td className="py-6 px-6">
                              <input
                                type="text"
                                name=""
                                id=""
                                placeholder="Enter Frequency"
                                className="bg-transparent border-none outline-none w-full"
                              />
                            </td>
                            <td className="py-6 px-6">{channel.reach}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        )}

        {view === "Timeline" && (
          <DateRangeProvider>
            <div className="bg-white pt-2">
              <DateComponent />
            </div>

            <div className="ml-[82px]">
              <div className="mt-5 max-w-[732px] w-full flex items-center rounded-[10px] text-[17px] font-[500] bg-[#3175FF] text-white p-3 text-center">
                <div className="flex items-center justify-center gap-3 flex-1">
                  <span>
                    <svg
                      width="23"
                      height="22"
                      viewBox="0 0 23 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.7096 7.33335H4.3763C3.89007 7.33335 3.42376 7.52651 3.07994 7.87032C2.73612 8.21414 2.54297 8.68046 2.54297 9.16669V12.8334C2.54297 13.3196 2.73612 13.7859 3.07994 14.1297C3.42376 14.4735 3.89007 14.6667 4.3763 14.6667H5.29297V18.3334C5.29297 18.5765 5.38955 18.8096 5.56145 18.9815C5.73336 19.1534 5.96652 19.25 6.20964 19.25H8.04297C8.28608 19.25 8.51924 19.1534 8.69115 18.9815C8.86306 18.8096 8.95964 18.5765 8.95964 18.3334V14.6667H11.7096L16.293 18.3334V3.66669L11.7096 7.33335ZM20.418 11C20.418 12.5675 19.538 13.9884 18.1263 14.6667V7.33335C19.5288 8.02085 20.418 9.44169 20.418 11Z"
                        fill="#FFFFFF"
                      />
                    </svg>
                  </span>{" "}
                  <span>Awareness</span>{" "}
                  <span>
                    <svg
                      width="17"
                      height="16"
                      viewBox="0 0 17 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.38021 6.66667L8.71354 10L12.0469 6.66667"
                        stroke="#FFFFFF"
                        strokeOpacity="0.8"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
                <button className="justify-self-end px-3 py-[10px] text-[16px] font-[500] bg-white/25 rounded-[5px]">
                  6,000 €
                </button>
              </div>

              <div className="ml-[56px]">
                <div className="">
                  <div className="py-3 bg-[#0866FF33] text-[#0866FF] text-[15px] font-[500] border border-[#0866FF33] my-5 max-w-[284px] w-full rounded-[10px] flex items-center justify-between">
                    <span className="flex items-center gap-3 pl-3 ml-14">
                      <span className="relative w-[16px] h-[16px]">
                        <Image src={facebook} fill alt="Facebook" />
                      </span>
                      <span>Facebook</span>
                    </span>
                    <button className="bg-[#0866FF33]/5 py-2 px-[10px] rounded-[5px] mr-3">
                      1,800 €
                    </button>
                  </div>
                  <button className="bg-[#EBFEF4]/50 py-[10px] px-3 border border-[#00A36C1A] text-[#00A36C]/60 flex gap-2">
                    2 add sets
                    <span>
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.0417 9.83333L8.70833 6.5L5.375 9.83333"
                          stroke="#00A36C"
                          strokeWidth="1.33333"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  <div className="ml-[40px]">
                    <div className="overflow-x-auto max-w-[990px]">
                      <table className="table text-[#061237] border-collapse border-none">
                        {/* head */}
                        <thead className="!border-none">
                          <tr className="!border-none">
                            <th className="text-[#667085] text-[12px] font-[500] !border-none">
                              #
                            </th>
                            <th className="text-[#667085] text-[12px] font-[500] !border-none">
                              Type
                            </th>
                            <th className="text-[#667085] text-[12px] font-[500] !border-none">
                              Name
                            </th>
                            <th className="text-[#667085] text-[12px] font-[500] !border-none">
                              Audience Size
                            </th>
                            <th className="text-[#667085] text-[12px] font-[500] !border-none">
                              Budget
                            </th>
                            <th className="text-[#667085] text-[12px] font-[500] border-none !border-l rounded-md">
                              CPM
                            </th>
                            <th className="text-[#667085] text-[12px] font-[500] !border-none">
                              Impressions
                            </th>
                            <th className="text-[#667085] text-[12px] font-[500] !border-none">
                              Frequency
                            </th>
                            <th className="text-[#667085] text-[12px] font-[500] !border-none">
                              <button className="w-[18px] h-[18px] grid place-items-center bg-[#3175FF] text-white rounded-[5px]">
                                +
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="whitespace-nowrap !border-none">
                          {/* row 1 */}
                          <tr className="!border-none">
                            <td className="!border-none bg-transparent">1</td>
                            <td className="!border-none bg-transparent">
                              Broad
                            </td>
                            <td className="!border-none">
                              Spring sale Awareness
                            </td>
                            <td className="!border-none">100,000</td>
                            <td className="!border-none">5,000 €</td>
                            <td className="!border-none !border-l rounded-md">
                              50 €
                            </td>
                            <td className="!border-none">200,000</td>
                            <td className="!border-none">2.0</td>
                          </tr>
                          {/* row 2 */}
                          <tr className="hover !border-none">
                            <td className="!border-none">2</td>
                            <td className="!border-none">Lookalike</td>
                            <td className="!border-none">Facebook Awareness</td>
                            <td className="!border-none">80,000</td>
                            <td className="!border-none">4,000 €</td>
                            <td className="!border-none">55 €</td>
                            <td className="!border-none">160,000</td>
                            <td className="!border-none">2.1</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Instagram */}
                <div className="ml-[291px]">
                  <div className="py-3 bg-[#FEF1F8] text-[#E01389] text-[15px] font-[500] border border-[#E0138933] mt-5 mb-1 max-w-[371px] w-full rounded-[10px] flex items-center justify-between">
                    <span className="flex items-center gap-3 pl-3 mx-auto">
                      <span className="relative w-[16px] h-[16px]">
                        <Image src={instagram} fill alt="Instagram" />
                      </span>
                      <span>Instagram</span>
                    </span>
                    <button className="bg-[#0866FF33]/5 py-2 px-[10px] rounded-[5px] mr-3">
                      1,800 €
                    </button>
                  </div>
                  <button className="bg-[#EBFEF4]/50 py-[10px] px-3 border border-[#00A36C1A]/10 text-[#00A36C]/60 flex gap-2">
                    2 add sets
                    <span>
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.0417 9.83333L8.70833 6.5L5.375 9.83333"
                          stroke="#00A36C"
                          strokeWidth="1.33333"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                </div>

                {/* Youtube */}
                <div className="">
                  <div className="py-3 bg-[#FFF0F0] text-[#E01389] text-[15px] font-[500] border border-[#E0138933] mt-5 mb-1 max-w-[513px] w-full rounded-[10px] flex items-center justify-between">
                    <span className="flex items-center gap-3 pl-3 mx-auto">
                      <span className="relative w-[16px] h-[16px]">
                        <Image src={youtube} fill alt="Youtube" />
                      </span>
                      <span>Youtube</span>
                    </span>
                    <button className="bg-[#0866FF33]/5 py-2 px-[10px] rounded-[5px] mr-3">
                      1,200 €
                    </button>
                  </div>
                  <button className="bg-[#EBFEF4]/50 py-[10px] px-3 border border-[#00A36C1A]/10 text-[#00A36C]/60 flex gap-2">
                    1 add sets
                    <span>
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.0417 9.83333L8.70833 6.5L5.375 9.83333"
                          stroke="#00A36C"
                          strokeWidth="1.33333"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                </div>

                {/* The TradeDesk */}
                <div className="ml-[291px]">
                  <div className="py-3 bg-[#F0F9FF] text-[#0099FA] text-[15px] font-[500] border border-[#0099FA33] mt-5 mb-1 max-w-[371px] w-full rounded-[10px] flex items-center justify-between">
                    <span className="flex items-center gap-3 pl-3 mx-auto">
                      <span className="relative w-[16px] h-[16px]">
                        <Image src={tradedesk} fill alt="TheTradeDesk" />
                      </span>
                      <span>TheTradeDesk</span>
                    </span>
                    <button className="bg-[#0866FF33]/5 py-2 px-[10px] rounded-[5px] mr-3">
                      900 €
                    </button>
                  </div>
                  <button className="bg-[#EBFEF4]/50 py-2 px-3 border border-[#00A36C1A]/10 text-[#00A36C]/60 flex gap-2">
                    1 add sets
                    <span>
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.0417 9.83333L8.70833 6.5L5.375 9.83333"
                          stroke="#00A36C"
                          strokeWidth="1.33333"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </DateRangeProvider>
        )}
      </section>
    </section>
  );
};
