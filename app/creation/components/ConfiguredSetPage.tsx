"use client";
import React, { useState } from "react";
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

const funnelStages = [
  { name: "Awareness", icon: speaker, status: "In progress", statusIsActive: true },
  { name: "Consideration", icon: tablerzoomfilled, status: "Not started", statusIsActive: false },
  { name: "Conversion", icon: orangecredit, status: "Not started", statusIsActive: false },
];

const ConfiguredSetPage = () => {
  const [openItems, setOpenItems] = useState({
    Awareness: false,
    Consideration: false,
    Conversion: false,
  });

  // Individual currency states for each section and stage
  const [currencies, setCurrencies] = useState({
    Awareness: {
      top: "EUR",
      facebook: "EUR",
      instagram: "EUR",
      youtube: "EUR",
      tradeDesk: "EUR",
      quantcast: "EUR"
    },
    Consideration: {
      top: "EUR",
      facebook: "EUR",
      instagram: "EUR",
      youtube: "EUR",
      tradeDesk: "EUR",
      quantcast: "EUR"
    },
    Conversion: {
      top: "EUR",
      facebook: "EUR",
      instagram: "EUR",
      youtube: "EUR",
      tradeDesk: "EUR",
      quantcast: "EUR"
    }
  });

  // Budget states for each section and stage
  const [budgets, setBudgets] = useState({
    Awareness: {
      top: "",
      facebook: "",
      instagram: "",
      youtube: "",
      tradeDesk: "",
      quantcast: ""
    },
    Consideration: {
      top: "",
      facebook: "",
      instagram: "",
      youtube: "",
      tradeDesk: "",
      quantcast: ""
    },
    Conversion: {
      top: "",
      facebook: "",
      instagram: "",
      youtube: "",
      tradeDesk: "",
      quantcast: ""
    }
  });

  const [validatedStages, setValidatedStages] = useState({
    Awareness: false,
    Consideration: false,
    Conversion: false
  });

  const [results, setResults] = useState({
    Awareness: [],
    Consideration: [],
    Conversion: []
  });

  const toggleItem = (stage) => {
    setOpenItems((prev) => ({ ...prev, [stage]: !prev[stage] }));
  };

  const getCurrencySymbol = (currencyCode) => {
    switch(currencyCode) {
      case 'EUR':
        return '€';
      case 'USD':
        return '$';
      case 'GBP':
        return '£';
      default:
        return '€';
    }
  };

  const handleCurrencyChange = (stage, platform, event) => {
    setCurrencies(prev => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        [platform]: event.target.value
      }
    }));
  };

  const handleBudgetChange = (stage, platform, event) => {
    const value = event.target.value.replace(/^0+/, '');
    setBudgets(prev => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        [platform]: value
      }
    }));
  };

  const isButtonEnabled = (stage) => {
    const stageBudgets = budgets[stage];
    return Object.values(stageBudgets).some(budget => budget);
  };

  const handleValidateClick = (stage) => {
    setValidatedStages(prev => ({...prev, [stage]: true}));
    
    const newResults = [
      { platform: "Top", budget: budgets[stage].top, currency: currencies[stage].top },
      { platform: "Facebook", budget: budgets[stage].facebook, currency: currencies[stage].facebook },
      { platform: "Instagram", budget: budgets[stage].instagram, currency: currencies[stage].instagram },
      { platform: "YouTube", budget: budgets[stage].youtube, currency: currencies[stage].youtube },
      { platform: "TradeDesk", budget: budgets[stage].tradeDesk, currency: currencies[stage].tradeDesk },
      { platform: "Quantcast", budget: budgets[stage].quantcast, currency: currencies[stage].quantcast },
    ].filter(item => item.budget);

    setResults(prev => ({...prev, [stage]: newResults}));
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

          {openItems[stage.name] && (
            <>
              <div className='pt-4 bg-[#FCFCFC] rounded-lg cursor-pointer border px-6 border-[rgba(6,18,55,0.1)]'>
              <div className="flex mt-6 flex-col items-start gap-8">

           <div className="flex mb-8 justify-center gap-6">
         {/* top budget */}
         <div className="flex flex-col gap-4">
            
         <h2 className="text-center font-bold">What is your budget for this phase ?</h2>
           <div className="flex items-center justify-between px-4 w-[200px] h-[50px] border border-[#D0D5DD] rounded-[10px] bg-[#FFFFFF]">
             <p className="font-bold">{getCurrencySymbol(currencies[stage.name].top)}</p>
             <input 
               type="text" 
               className="w-full px-4 focus:outline-none"
               value={budgets[stage.name].top || '0'}
               onChange={(e) => handleBudgetChange(stage.name, 'top', e)}
             />
             <select 
               className="bg-white font-bold text-gray-700 py-1 px-3 rounded focus:outline-none cursor-pointer" 
               onChange={(e) => handleCurrencyChange(stage.name, 'top', e)}
               value={currencies[stage.name].top}
             >
               <option value="EUR">EUR</option>
               <option value="USD">USD</option>
               <option value="GBP">GBP</option>
             </select>
           </div>
        </div>

         <div className="flex items-start flex-col gap-4">
          <h2 className="text-center font-bold">Percentage</h2>
          <div className="flex items-center gap-4">

          <div className=" bg-[#FFFFFF] rounded-[10px] w-[62px] h-[50px] border border-[#D0D5DD] flex items-center px-4">
           <input className="text-base w-full focus:outline-none" type="text" />
           <div className="flex items-center gap-2">
           <p>0</p>
           <span> %</span>
           </div>
          </div>
         
          <p className="tracking-tight">of total budget</p>
         </div>
         </div>
        
           </div>

           <hr className="text-gray-200 w-full p-1"/>

          
          {/* Second row */}
          <div className="flex mb-8 items-center justify-center gap-3">
          
          {/* facebook */}
          <div className="flex items-start flex-col gap-2">
           <div className="flex rounded-[50px] bg-[#00A36C1A] border border-[#00A36C1A] w-[82px] h-[29px] items-center gap-2">
             <span className="text-[#00A36C] pl-2">2 ad sets</span>

            </div>


            <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-[190px] h-[50px] rounded-[10px] items-center gap-2">
              <div className="flex justify-between w-full px-4 items-center">

              <div className="flex items-center gap-2">
                <Image src={facebook} className="size-5" alt="facebook" />
                <span>Facebook</span>
              </div>

              <Image src={down2} className="size-5" alt="arrow down" />

              </div>
            </div>

          </div>


  
          <div className="flex items-start flex-col gap-4">
            
         <h2 className="text-center font-bold">Budget</h2>
           <div className="flex items-center justify-between px-4 w-[200px] h-[50px] border border-[#D0D5DD] rounded-[10px] bg-[#FFFFFF]">
             <p className="font-bold">{getCurrencySymbol(currencies[stage.name].facebook)}</p>
             <input 
               type="text" 
               className="w-full px-4 focus:outline-none"
               value={budgets[stage.name].facebook || '0'}
               onChange={(e) => handleBudgetChange(stage.name, 'facebook', e)}
             />
             <select 
               className="bg-white font-bold text-gray-700 py-1 px-3 rounded focus:outline-none cursor-pointer" 
               onChange={(e) => handleCurrencyChange(stage.name, 'facebook', e)}
               value={currencies[stage.name].facebook}
             >
               <option value="EUR">EUR</option>
               <option value="USD">USD</option>
               <option value="GBP">GBP</option>
             </select>
           </div>
        </div>


        <div className="flex items-start flex-col gap-3">
          <h2 className="text-center font-bold">Percentage</h2>
          <div className="flex items-center gap-4">

          <div className=" bg-[#FFFFFF] rounded-[10px] w-[62px] h-[50px] border border-[#D0D5DD] flex items-center px-4">
           <input className="text-base w-full focus:outline-none" type="text" />
           <div className="flex items-center gap-2">
           <p>0</p>
           <span> %</span>
           </div>
          </div>
         
          <p className="whitespace-nowrap tracking-tight">of {stage.name} budget</p>
           
           {/* switch */}
           <div className="flex items-center gap-2">

           <label
  htmlFor="AcceptConditions"
  className="relative inline-block h-6 w-12 cursor-pointer rounded-full bg-gray-300 transition [-webkit-tap-highlight-color:_transparent] has-[:checked]:bg-blue-500 peer-checked:bg-blue-500"
>
  <input type="checkbox" id="AcceptConditions" className="peer sr-only" />

  <span
    className="absolute inset-y-0 left-0 w-6 h-6 rounded-full bg-white transition-transform duration-200 transform peer-checked:translate-x-6"
    ></span>
</label>
<p className="text-[#061237] text-sm font-semibold overflow-hidden text-ellipsis whitespace-nowrap tracking-tighter">Auto-split budget across ad sets</p>
    </div>

            
         </div>
         </div>


         </div>

         <hr className="text-gray-200 w-full p-1"/>


        {/* Third row */}
        <div className="flex mb-8 justify-center items-center gap-3">
          
          {/* Instagram */}
          
             
            <div className="flex mt-10 bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-[190px] h-[50px] rounded-[10px] items-center gap-2">
              <div className="flex justify-between w-full px-4">

              <div className="flex items-center gap-2">
                <Image src={instagram} className="size-5" alt="instagram" />
                <span>Instagram</span>
              </div>

              <Image src={down2} className="size-5" alt="arrow down" />

              </div>
            </div>

  
          <div className="flex items-start flex-col gap-4">
            
         <h2 className="text-center font-bold">Budget</h2>
           <div className="flex items-center justify-between px-4 w-[200px] h-[50px] border border-[#D0D5DD] rounded-[10px] bg-[#FFFFFF]">
             <p className="font-bold">{getCurrencySymbol(currencies[stage.name].instagram)}</p>
             <input 
               type="text" 
               className="w-full px-4 focus:outline-none"
               value={budgets[stage.name].instagram || '0'}
               onChange={(e) => handleBudgetChange(stage.name, 'instagram', e)}
             />
             <select 
               className="bg-white font-bold text-gray-700 py-1 px-3 rounded focus:outline-none cursor-pointer" 
               onChange={(e) => handleCurrencyChange(stage.name, 'instagram', e)}
               value={currencies[stage.name].instagram}
             >
               <option value="EUR">EUR</option>
               <option value="USD">USD</option>
               <option value="GBP">GBP</option>
             </select>
           </div>
        </div>


        <div className="flex items-start flex-col gap-4">
          <h2 className="text-center font-bold">Percentage</h2>
          <div className="flex items-center gap-4">

          <div className=" bg-[#FFFFFF] rounded-[10px] w-[62px] h-[50px] border border-[#D0D5DD] flex items-center px-4">
           <input className="text-base w-full focus:outline-none" type="text" />
           <div className="flex items-center gap-2">
           <p>0</p>
           <span> %</span>
           </div>
          </div>
         
          <p className="tracking-tight">of {stage.name} budget</p>
        
            
         </div>
         </div>


         </div>

         <hr className="text-gray-200 w-full p-1"/>


         {/* Fourth row */}
         <div className="flex mb-8 justify-center items-center gap-3">
          
          {/* Youtube */}
           
            <div className="flex mt-10 bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-[190px] h-[50px] rounded-[10px] items-center gap-2">
              <div className="flex justify-between w-full px-4">

              <div className="flex items-center gap-2">
                <Image src={youtube} className="size-5" alt="youtube" />
                <span>Youtube</span>
              </div>

              <Image src={down2} className="size-5" alt="arrow down" />

              </div>
            </div>

  
          <div className="flex items-start flex-col gap-4">
            
         <h2 className="text-center font-bold">Budget</h2>
           <div className="flex items-center justify-between px-4 w-[200px] h-[50px] border border-[#D0D5DD] rounded-[10px] bg-[#FFFFFF]">
             <p className="font-bold">{getCurrencySymbol(currencies[stage.name].youtube)}</p>
             <input 
               type="text" 
               className="w-full px-4 focus:outline-none"
               value={budgets[stage.name].youtube || '0'}
               onChange={(e) => handleBudgetChange(stage.name, 'youtube', e)}
             />
             <select 
               className="bg-white font-bold text-gray-700 py-1 px-3 rounded focus:outline-none cursor-pointer" 
               onChange={(e) => handleCurrencyChange(stage.name, 'youtube', e)}
               value={currencies[stage.name].youtube}
             >
               <option value="EUR">EUR</option>
               <option value="USD">USD</option>
               <option value="GBP">GBP</option>
             </select>
           </div>
        </div>


        <div className="flex items-start flex-col gap-4">
          <h2 className="text-center font-bold">Percentage</h2>
          <div className="flex items-center gap-4">

          <div className=" bg-[#FFFFFF] rounded-[10px] w-[62px] h-[50px] border border-[#D0D5DD] flex items-center px-4">
           <input className="text-base w-full focus:outline-none" type="text" />
           <div className="flex items-center gap-2">
           <p>0</p>
           <span> %</span>
           </div>
          </div>
         
          <p className="tracking-tight">of {stage.name} budget</p>
        
            
         </div>
         </div>


         </div>

         <hr className="text-gray-200 w-full p-1"/>



         {/* Fifth row */}

         <div className="flex mb-8 justify-center items-center gap-3">
              
          {/* TradeDesk */}
          
             
             
            <div className="flex mt-10 bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-[190px] h-[50px] rounded-[10px] items-center gap-2">
              <div className="flex justify-between w-full px-4">

              <div className="flex items-center gap-2">
                <Image src={trade} className="size-5" alt="tradedesk" />
                <span>TradeDesk</span>
              </div>

              <Image src={down2} className="size-5" alt="arrow down" />

              </div>
            </div>

  
          <div className="flex items-start flex-col gap-4">
            
         <h2 className="text-center font-bold">Budget</h2>
           <div className="flex items-center justify-between px-4 w-[200px] h-[50px] border border-[#D0D5DD] rounded-[10px] bg-[#FFFFFF]">
             <p className="font-bold">{getCurrencySymbol(currencies[stage.name].tradeDesk)}</p>
             <input 
               type="text" 
               className="w-full px-4 focus:outline-none"
               value={budgets[stage.name].tradeDesk || '0'}
               onChange={(e) => handleBudgetChange(stage.name, 'tradeDesk', e)}
             />
             <select 
               className="bg-white font-bold text-gray-700 py-1 px-3 rounded focus:outline-none cursor-pointer" 
               onChange={(e) => handleCurrencyChange(stage.name, 'tradeDesk', e)}
               value={currencies[stage.name].tradeDesk}
             >
               <option value="EUR">EUR</option>
               <option value="USD">USD</option>
               <option value="GBP">GBP</option>
             </select>
           </div>
        </div>


        <div className="flex items-start flex-col gap-4">
          <h2 className="text-center font-bold">Percentage</h2>
          <div className="flex items-center gap-4">

          <div className=" bg-[#FFFFFF] rounded-[10px] w-[62px] h-[50px] border border-[#D0D5DD] flex items-center px-4">
           <input className="text-base w-full focus:outline-none" type="text" />
           <div className="flex items-center gap-2">
           <p>0</p>
           <span> %</span>
           </div>
          </div>
         
          <p className="tracking-tight">of {stage.name} budget</p>
        
            
         </div>
         </div>


         </div>

         <hr className="text-gray-200 w-full p-1"/>


         {/* Sixth row */}
         <div className="flex mb-8 justify-center items-center gap-3">
          
          {/* Quantcast */}
               
            <div className="flex mt-10 bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-[190px] h-[50px] rounded-[10px] items-center gap-2">
              <div className="flex justify-between w-full px-4">

              <div className="flex items-center gap-2">
                <Image src={quantcast} className="size-5" alt="quancast" />
                <span>Quantcast</span>
              </div>

              <Image src={down2} className="size-5" alt="arrow down" />

              </div>
            </div>

  
          <div className="flex items-start flex-col gap-4">
            
         <h2 className="text-center font-bold">Budget</h2>
           <div className="flex items-center justify-between px-4 w-[200px] h-[50px] border border-[#D0D5DD] rounded-[10px] bg-[#FFFFFF]">
             <p className="font-bold">{getCurrencySymbol(currencies[stage.name].quantcast)}</p>
             <input 
               type="text" 
               className="w-full px-4 focus:outline-none"
               value={budgets[stage.name].quantcast || '0'}
               onChange={(e) => handleBudgetChange(stage.name, 'quantcast', e)}
             />
             <select 
               className="bg-white font-bold text-gray-700 py-1 px-3 rounded focus:outline-none cursor-pointer" 
               onChange={(e) => handleCurrencyChange(stage.name, 'quantcast', e)}
               value={currencies[stage.name].quantcast}
             >
               <option value="EUR">EUR</option>
               <option value="USD">USD</option>
               <option value="GBP">GBP</option>
             </select>
           </div>
        </div>


        <div className="flex items-start flex-col gap-4">
          <h2 className="text-center font-bold">Percentage</h2>
          <div className="flex items-center gap-4">

          <div className=" bg-[#FFFFFF] rounded-[10px] w-[62px] h-[50px] border border-[#D0D5DD] flex items-center px-4">
           <input className="text-base w-full focus:outline-none" type="text" />
           <div className="flex items-center gap-2">
           <p>0</p>
           <span> %</span>
           </div>
          </div>
         
          <p className="tracking-tight">of {stage.name} budget</p>
        
            
         </div>
         </div>


         </div>

         <hr className="text-gray-200 w-full p-1"/>

       </div>
        
              <div className="flex w-full my-6 justify-end items-center">
                <Button
                  text={validatedStages[stage.name] ? "Edit" : "Validate"}
                  onClick={validatedStages[stage.name] ? 
                    () => setValidatedStages(prev => ({...prev, [stage.name]: false})) : 
                    () => handleValidateClick(stage.name)}
                  disabled={!isButtonEnabled(stage.name)}
                  variant="primary"
                  className="h-[52px] rounded-md px-6 py-2"
                />
              </div>

              {validatedStages[stage.name] && results[stage.name].length > 0 && (
                <div className="mt-6">
                  <h2 className="font-bold">Results:</h2>
                  <ul>
                    {results[stage.name].map((result, index) => (
                      <li key={index}>
                        {result.platform}: {result.budget} {getCurrencySymbol(result.currency)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ConfiguredSetPage;