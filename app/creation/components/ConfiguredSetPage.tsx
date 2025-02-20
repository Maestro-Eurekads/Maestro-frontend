"use client";
import React, { useState } from "react";
import Image from "next/image";
import Button from "./common/button";

import speaker from "../../../public/mdi_megaphone.svg";
import up from "../../../public/arrow-down.svg";
import down2 from "../../../public/arrow-down-2.svg";
import tablerzoomfilled from "../../../public/tabler_zoom-filled.svg";
import orangecredit from "../../../public/orangecredit-card.svg";
import ecurrencyeur from "../../../public/e_currency-eur.svg";
import facebook from "../../../public/facebook.svg";
import instagram from "../../../public/ig.svg";
import trade from "../../../public/TheTradeDesk.svg";
import youtube from "../../../public/youtube.svg";
import quantcast from "../../../public/quantcast.svg";

const funnelStages = [
  { name: "Awareness", icon: speaker, status: "In progress", statusIsActive: true },
  { name: "Consideration", icon: tablerzoomfilled, status: "Not started", statusIsActive: false },
  { name: "Conversion", icon: orangecredit, status: "Not started", statusIsActive: false },
];

const PlatformBudget = ({ platform, currencyIcon, budget, percentage }) => (
  <div className='flex flex-row mt-8 items-center gap-[16px] px-0 py-[24px] border-b border-[rgba(6,18,55,0.1)] box-border'>
    <div className="mt-12 p-2">
      <div className="bg-[#F9FAFB] border-2 border-gray-200 flex items-center text-[#061237] h-[50px] rounded-lg px-6 py-4">
        <div className="flex items-center gap-2">
          <span>
            <Image className="size-5" src={currencyIcon} alt={platform} />
          </span>
          <h2>{platform}</h2>
        </div>
      </div>
    </div>
    <div className="flex flex-col">
      <p className="font-bold py-3">Budget</p>
      <div className="e_currency-eur">
        <div className='flex'>
          <Image src={ecurrencyeur} alt="e_currency-eur" />
          <input type="text" defaultValue="0 €" className="w-full focus:outline-none text-center px-4 py-2" />
          {/* <h3>{budget}</h3> */}
        </div>
        <div>EUR</div>
      </div>
    </div>
    <div className="flex flex-col">
      <p className="font-bold py-3">Percentage</p>
      <div className="flex items-center">
      <input type="text" defaultValue="0 %" className="e_currency-eur w-full text-center !max-w-[62px]" />

        <p className="text-[15px] whitespace-nowrap pl-4 text-center leading-[20px]">
          of Awareness budget
        </p>
      </div>
    </div>
  </div>
);

const ConfiguredSetPage = () => {
  const [openItems, setOpenItems] = useState({
    Awareness: false,
    Consideration: false,
    Conversion: false,
  });

  const toggleItem = (stage) => {
    setOpenItems((prev) => ({ ...prev, [stage]: !prev[stage] }));
  };

  return (
    <div className="mt-12 flex items-start flex-col gap-12 w-full">
      {funnelStages.map((stage, index) => (
        <div key={index} className="w-full">
          <div
            className="flex items-center justify-between px-6 py-4 w-full bg-[#FCFCFC] border border-gray-300 rounded-lg cursor-pointer"
            onClick={() => toggleItem(stage.name)}
          >
            <div className="flex items-center gap-4">
              <Image src={stage.icon} alt={stage.name} />
              <p className="text-md font-semibold text-[#061237]">{stage.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className={`font-semibold text-base ${stage.statusIsActive ? 'text-[#3175FF]' : 'text-[#061237] opacity-50'}`}>
                {stage.status}
              </p>
            </div>
            <div>
              {openItems[stage.name] ? (
                <Image src={up} alt="collapse" />
              ) : (
                <Image src={down2} alt="expand" />
              )}
            </div>
          </div>

          {openItems[stage.name] && stage.name === "Awareness" && (
            <>
              <div className='mt-8 flex flex-row items-center gap-[16px] px-0 py-[24px] border-b border-[rgba(6,18,55,0.1)] box-border'>
                <div className="flex flex-col p-2">
                  <p className="font-bold py-3 whitespace-nowrap">What is your budget for this phase?</p>
                  <div className="e_currency-eur">
                    <div className='flex items-center'>
                      <Image src={ecurrencyeur} alt="e_currency-eur" />
                      <input type="text" defaultValue="0 €" className="w-full focus:outline-none text-center px-4 py-2" />
                    </div>
                    <div>EUR</div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="font-bold py-3">Percentage</p>
                  <div className="flex items-center">
                    <input type="text" defaultValue="0 %" className="e_currency-eur text-center w-[62px]" />
                    <p className="text-[15px] pl-4 text-center whitespace-nowrap text-[#061237CC] leading-[20px]">
                      of budget
                    </p>
                  </div>
                </div>
              </div>

              {/* Render platform budgets with the "2 ad sets" badge on top of Facebook */}
              {["Facebook", "Instagram", "Youtube", "The TradeDesk", "Quantcast"].map((platform, idx) => {
                const platformIcons = {
                  Facebook: facebook,
                  Instagram: instagram,
                  Youtube: youtube,
                  "The TradeDesk": trade,
                  Quantcast: quantcast,
                };

                // For Facebook, wrap it in a relative container and add the badge
                if (platform === "Facebook") {
                  return (
                    <div key={idx} className="relative">
                      <div className="absolute top-7 left-0 z-10">
                        <div className="bg-green-100 h-[29x] text-center border-2 border-green-300 rounded-full px-6 py-2">
                          <p className="font-medium text-[12px] text-[#00A36C]">2 ad sets</p>
                        </div>
                      </div>
                      <PlatformBudget
                        platform={platform}
                        currencyIcon={platformIcons[platform]}
                        budget="0"
                        percentage="0"
                      />
                    </div>
                  );
                }
                return (
                  <PlatformBudget
                    key={idx}
                    platform={platform}
                    currencyIcon={platformIcons[platform]}
                    budget="0"
                    percentage="0"
                  />
                );
              })}

              <div className="flex mt-6 justify-end items-center">
                <Button
                  text="Validate"
                  onClick={() => alert("Validate")}
                  disabled
                  variant="primary"
                  className="h-[52px] rounded-md px-6 py-2"
                />
              </div>
            </>
          )}

          {openItems[stage.name] &&
            (stage.name === "Consideration" || stage.name === "Conversion") && (
              <div className="flex items-center justify-between p-8 w-full bg-[#FCFCFC] border border-gray-300 rounded-lg cursor-pointer"></div>
            )}
        </div>
      ))}
    </div>
  );
};

export default ConfiguredSetPage;
