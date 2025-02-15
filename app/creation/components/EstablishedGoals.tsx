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

export const EstablishedGoals = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);

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
              <h2 className="text-xl mb-4 text-[#181D27] font-[600]">
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
                      <Image
                        src={item.img}
                        layout="fill"
                        objectFit="cover"
                        alt={item.alt}
                      />
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
        <header className="max-w-[1080px] mt-[40px] mb-[32px]">
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
              <button role="tab" className="tab">
                Timeline view
              </button>
              <button
                role="tab"
                className="tab tab-active !bg-white !text-[#061237] !font-[600]"
              >
                Table view
              </button>
            </div>
          </div>
        </header>

        <div className="">
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
            <div className="overflow-x-auto max-w-[1080px] rounded-xl border border-[#E5E5E5]">
              <div className="rounded-xl">
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
                  <tbody>
                    {/* Row 1 */}
                    <tr className="py-6">
                      <td className="py-6 px-6 text-[15px]">
                        <span className="flex items-center gap-2 text-[#0866FF]">
                          <span className="relative w-[16px] h-[16px]">
                            <Image
                              src={facebook}
                              layout="fill"
                              objectFit="cover"
                              alt="Facebook Icon"
                            />
                          </span>
                          <span>Facebook</span>
                        </span>
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        Men 25+ Int. Sport
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        01/02/2024
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        01/03/2024
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">50,000</td>
                      <td className="py-6 px-6 whitespace-nowrap">10,000</td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        <input
                          type="text"
                          name=""
                          id=""
                          placeholder="Enter CPM"
                          className="bg-transparent border-none outline-none max-w-[76px]"
                        />
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">2 000 000</td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        <input
                          type="text"
                          name=""
                          id=""
                          placeholder="Enter Frequency"
                          className="bg-transparent border-none max-w-[116px] text-[15px] outline-none"
                        />
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">2 000 000</td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="py-6">
                      <td className="py-6 px-6 whitespace-nowrap">
                        <span className="flex items-center gap-2 text-[#E01389]">
                          <span className="relative w-[16px] h-[16px]">
                            <Image
                              src={instagram}
                              layout="fill"
                              objectFit="cover"
                              alt="Instagram Icon"
                            />
                          </span>
                          <span>Instagram</span>
                        </span>
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        Lookalike Buyers 90D
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        01/02/2024
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        01/03/2024
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">40,000</td>
                      <td className="py-6 px-6 whitespace-nowrap">8,000</td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        <input
                          type="text"
                          name=""
                          id=""
                          placeholder="Enter CPM"
                          className="bg-transparent border-none outline-none max-w-[76px]"
                        />
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">2 000 000</td>{" "}
                      <td className="py-6 px-6 whitespace-nowrap">
                        <input
                          type="text"
                          name=""
                          id=""
                          placeholder="Enter Frequency"
                          className="bg-transparent  max-w-[116px] text-[15px] border-none outline-none"
                        />
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">2 000 000</td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="py-6">
                      <td className="py-6 px-6 whitespace-nowrap">
                        <span className="flex items-center gap-2 text-[#FF0302]">
                          <span className="relative w-[16px] h-[16px]">
                            <Image
                              src={youtube}
                              layout="fill"
                              objectFit="cover"
                              alt="Youtube Icon"
                            />
                          </span>
                          <span>Youtube</span>
                        </span>
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        Men 25+ Int. Sport
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        01/02/2024
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        01/03/2024
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">60,000</td>
                      <td className="py-6 px-6 whitespace-nowrap">12,000</td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        <input
                          type="text"
                          name=""
                          id=""
                          placeholder="Enter CPM"
                          className="bg-transparent border-none outline-none max-w-[76px]"
                        />
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">2 000 000</td>{" "}
                      <td className="py-6 px-6 whitespace-nowrap">
                        <input
                          type="text"
                          name=""
                          id=""
                          placeholder="Enter Frequency"
                          className="bg-transparent max-w-[116px] text-[15px] borrder-none outline-none"
                        />
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">2 000 000</td>
                    </tr>

                    {/* Row 4 */}
                    <tr className="py-6">
                      <td className="py-6 px-6 whitespace-nowrap">
                        <span className="flex items-center gap-2 text-[#0099FA]">
                          <span className="relative w-[16px] h-[16px]">
                            <Image
                              src={tradedesk}
                              layout="fill"
                              objectFit="cover"
                              alt="TheTradeDesk Icon"
                            />
                          </span>
                          <span>TheTradeDesk</span>
                        </span>
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        {" "}
                        Lookalike Buyers 90D
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        01/02/2024
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        01/03/2024
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">60,000</td>
                      <td className="py-6 px-6 whitespace-nowrap">12,000</td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        <input
                          type="text"
                          name=""
                          id=""
                          placeholder="Enter CPM"
                          className="bg-transparent border-none outline-none max-w-[76px]"
                        />
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">2 000 000</td>{" "}
                      <td className="py-6 px-6 whitespace-nowrap">
                        <input
                          type="text"
                          name=""
                          id=""
                          placeholder="Enter Frequency"
                          className="bg-transparent max-w-[116px] text-[15px] border-none outline-none"
                        />
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">2 000 000</td>
                    </tr>

                    {/* Row 5 */}
                    <tr className="py-6">
                      <td className="py-6 px-6 whitespace-nowrap">
                        <span className="flex items-center gap-2 text-[#061237]">
                          <span className="relative w-[16px] h-[16px]">
                            <Image
                              src={quantcast}
                              layout="fill"
                              objectFit="cover"
                              alt="Quantcast Icon"
                            />
                          </span>
                          <span>Quantcast</span>
                        </span>
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        Men 25+ Int. Sport
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        01/02/2024
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        01/03/2024
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">60,000</td>
                      <td className="py-6 px-6 whitespace-nowrap">12,000</td>
                      <td className="py-6 px-6 whitespace-nowrap">
                        <input
                          type="text"
                          name=""
                          id=""
                          placeholder="Enter CPM"
                          className="bg-transparent border-none outline-none max-w-[76px]"
                        />
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">2 000 000</td>{" "}
                      <td className="py-6 px-6 whitespace-nowrap">
                        <input
                          type="text"
                          name=""
                          id=""
                          placeholder="Enter Frequency"
                          className="bg-transparent max-w-[116px] text-[15px] border-none outline-none"
                        />
                      </td>
                      <td className="py-6 px-6 whitespace-nowrap">2 000 000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <footer className="flex justify-end max-w-[992px]">
          <button className="btn btn-primary" onClick={handleOpenModal}>
            Validate
          </button>
        </footer>
      </section>
    </section>
  );
};
