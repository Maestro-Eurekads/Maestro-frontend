"use client";
import React, { useState, createContext, useContext } from "react";
import Image from "next/image";
import Button from "./common/button";
import speaker from "../../../public/mdi_megaphone.svg";
import up from "../../../public/arrow-down.svg";
import down2 from "../../../public/arrow-down-2.svg";
import tablerzoomfilled from "../../../public/tabler_zoom-filled.svg";
import orangecredit from "../../../public/orangecredit-card.svg";
import facebook from "../../../public/facebook.svg";
import instagram from "../../../public/ig.svg";
import trade from "../../../public/TheTradeDesk.svg";
import youtube from "../../../public/youtube.svg";
import quantcast from "../../../public/quantcast.svg";

// Step 1: Create Currency Context
const CurrencyContext = createContext();

// Step 2: Currency Provider Component
const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState("EUR"); // Default currency

  // Map currency codes to their symbols
  const currencySymbols = {
    EUR: "€",
    USD: "$",
    GBP: "£",
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencySymbols }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Step 3: Custom Hook to Use Currency Context
const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

// Step 4: Currency Selector Component
const CurrencySelector = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      className="bg-white font-bold text-gray-700 py-1 px-3 rounded focus:outline-none cursor-pointer"
    >
      <option value="EUR">EUR</option>
      <option value="USD">USD</option>
      <option value="GBP">GBP</option>
    </select>
  );
};

// Step 5: Main ConfiguredSetPage Component
const ConfiguredSetPage = () => {
  const [openItems, setOpenItems] = useState({
    Awareness: false,
    Consideration: false,
    Conversion: false,
  });

  const toggleItem = (stage) => {
    setOpenItems((prev) => ({ ...prev, [stage]: !prev[stage] }));
  };

  const funnelStages = [
    { name: "Awareness", icon: speaker, status: "In progress", statusIsActive: true },
    { name: "Consideration", icon: tablerzoomfilled, status: "Not started", statusIsActive: false },
    { name: "Conversion", icon: orangecredit, status: "Not started", statusIsActive: false },
  ];

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
              <div className="pt-8 bg-[#FCFCFC] rounded-lg cursor-pointer border px-6 border-[rgba(6,18,55,0.1)]">
                <div className="flex mt-6 flex-col items-start gap-12">
                  {/* Top Budget Section */}
                  <div className="flex mb-8 justify-center gap-6">
                    <div className="flex flex-col gap-4">
                      <h2 className="text-center font-bold">What is your budget for this phase?</h2>
                      <div className="flex items-center justify-between px-4 w-[200px] h-[50px] border border-[#D0D5DD] rounded-[10px] bg-[#FFFFFF]">
                        <div className="flex items-center gap-2">
                          <CurrencySymbol />
                          <span>0</span>
                        </div>
                        <input type="text" className="w-full px-4 focus:outline-none" />
                        <div className="flex items-center gap-2">
                          <CurrencySelector />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start flex-col gap-4">
                      <h2 className="text-center font-bold">Percentage</h2>
                      <div className="flex items-center gap-4">
                        <div className="bg-[#FFFFFF] rounded-[10px] w-[62px] h-[50px] border border-[#D0D5DD] flex items-center px-4">
                          <input className="text-base w-full focus:outline-none" type="text" />
                          <div className="flex items-center gap-2">
                            <p>0</p>
                            <span>%</span>
                          </div>
                        </div>
                        <p>of total budget</p>
                      </div>
                    </div>
                  </div>

                  <hr className="text-gray-200 w-full p-8" />

                  {/* Facebook Section */}
                  <PlatformSection platform="Facebook" icon={facebook} />

                  <hr className="text-gray-200 w-full p-8" />

                  {/* Instagram Section */}
                  <PlatformSection platform="Instagram" icon={instagram} />

                  <hr className="text-gray-200 w-full p-8" />

                  {/* YouTube Section */}
                  <PlatformSection platform="YouTube" icon={youtube} />

                  <hr className="text-gray-200 w-full p-8" />

                  {/* TradeDesk Section */}
                  <PlatformSection platform="TradeDesk" icon={trade} />

                  <hr className="text-gray-200 w-full p-8" />

                  {/* Quantcast Section */}
                  <PlatformSection platform="Quantcast" icon={quantcast} />

                  <hr className="text-gray-200 w-full p-8" />

                  {/* Validate Button */}
                  <div className="flex w-full my-6 justify-end items-center">
                    <Button
                      text="Validate"
                      onClick={() => alert("Validate")}
                      disabled
                      variant="primary"
                      className="h-[52px] rounded-md px-6 py-2"
                    />
                  </div>
                </div>
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

// Step 6: Currency Symbol Component
const CurrencySymbol = () => {
  const { currency, currencySymbols } = useCurrency();
  return <p className="font-bold">{currencySymbols[currency]}</p>;
};

// Step 7: Platform Section Component
const PlatformSection = ({ platform, icon }) => {
  return (
    <div className="flex mb-8 justify-center items-center gap-2">
      <div className="flex mt-10 bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-[190px] h-[50px] rounded-[10px] items-center gap-2">
        <div className="flex justify-between w-full px-4">
          <div className="flex items-center gap-2">
            <Image src={icon} className="size-5" alt={platform} />
            <span>{platform}</span>
          </div>
          <Image src={down2} className="size-5" alt="arrow down" />
        </div>
      </div>

      <div className="flex items-start flex-col gap-4">
        <h2 className="text-center font-bold">Budget</h2>
        <div className="flex items-center justify-between px-4 w-[200px] h-[50px] border border-[#D0D5DD] rounded-[10px] bg-[#FFFFFF]">
          <div className="flex items-center gap-2">
            <CurrencySymbol />
            <span>0</span>
          </div>
          <input type="text" className="w-full px-4 focus:outline-none" />
          <div className="flex items-center gap-2">
            <CurrencySelector />
          </div>
        </div>
      </div>

      <div className="flex items-start flex-col gap-4">
        <h2 className="text-center font-bold">Percentage</h2>
        <div className="flex items-center gap-4">
          <div className="bg-[#FFFFFF] rounded-[10px] w-[62px] h-[50px] border border-[#D0D5DD] flex items-center px-4">
            <input className="text-base w-full focus:outline-none" type="text" />
            <div className="flex items-center gap-2">
              <p>0</p>
              <span>%</span>
            </div>
          </div>
          <p>of total budget</p>
        </div>
      </div>
    </div>
  );
};

// Step 8: Wrap ConfiguredSetPage with CurrencyProvider
const App = () => (
  <CurrencyProvider>
    <ConfiguredSetPage />
  </CurrencyProvider>
);

export default App;