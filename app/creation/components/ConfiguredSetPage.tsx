"use client";
import React, { useState } from "react";
import Image from "next/image";
import speaker from "../../../public/mdi_megaphone.svg";
import up from "../../../public/arrow-down.svg";
import down2 from "../../../public/arrow-down-2.svg";
import tablerzoomfilled from "../../../public/tabler_zoom-filled.svg";
import orangecredit from "../../../public/orangecredit-card.svg";
import ecurrencyeur from '../../../public/e_currency-eur.svg';
import facebook from '../../../public/facebook.svg';
import instagram from "../../../public/ig.svg"
import trade from "../../../public/TheTradeDesk.svg"
import youtube from "../../../public/youtube.svg"
import quantcast from "../../../public/quantcast.svg"
import Button from "./common/button";


const funnelStages = [
  {
    name: "Awareness",
    icon: speaker,
    status: "In progress",
    statusIsActive: true,
    platforms: {},
  },
  {
    name: "Consideration",
    icon: tablerzoomfilled,
    status: "Not started",
    statusIsActive: false,
    platforms: {},
  },
  {
    name: "Conversion",
    icon: orangecredit,
    status: "Not started",
    statusIsActive: false,
    platforms: {},
  },
];


const ConfiguredSetPage = () => {
  const [openItems, setOpenItems] = useState({ Awareness: false });
  
  // Toggle expand/collapse for a stage
  const toggleItem = (stage: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  return (
    <div className="mt-12 flex items-start flex-col gap-12 w-full ">
      {funnelStages.map((stage, index) => (
        <div key={index} className="w-full">
          {/* Stage Header */}
          <div
            className="flex items-center justify-between px-6 py-4 w-full bg-[#FCFCFC] border border-gray-300 rounded-lg cursor-pointer"
            onClick={() => toggleItem(stage.name)}
          >
            <div className="flex items-center gap-4">
              <Image src={stage.icon} alt={stage.name} />
              <p className="text-md font-semibold text-[#061237]">{stage.name}</p>
            </div>

            <div className="flex items-center gap-2">
              {stage.statusIsActive ? (
                <p className="text-[#3175FF] font-semibold text-base">{stage.status}</p>
              ) : (
                <p className="text-[#061237] opacity-50 text-base">Not started</p>
              )}
            </div>

            <div>
              {openItems[stage.name] ? <Image src={up} alt="collapse" /> : <Image src={down2} alt="expand" />}
            </div>
          </div>

          {/* Expanded Content */}
          {openItems[stage.name] && (
            <>
             <div className='mt-8 flex flex-row items-center gap-[16px] px-0 py-[24px] border-b border-[rgba(6,18,55,0.1)] box-border'>
              <div className="flex flex-col p-2">

            <p className="font-bold py-3 whitespace-nowrap">What is your budget for this phase ?</p>
				<div className="e_currency-eur">
					<div className='flex'>
						<Image src={ecurrencyeur} alt="e_currency-eur" />
						<h3>0</h3>
					</div>
					<div>
						EUR
					</div>
				</div>
        </div>

        {/* second */}

        <div className="flex flex-col">
 <p className="font-bold py-3">Percentage</p>

        <div className="flex items-center ">

   <div className="e_currency-eur !w-[62px]">
  
     <h3>0 %</h3>
      
       </div>

       <p className="text-[15px] pl-4 text-center whitespace-nowrap text-[#061237CC] leading-[20px]">
						of budget
					</p>
       </div> 
        </div>

        
			</div>

      <div className='flex flex-row mt-10 items-center gap-[16px] px-0 py-[24px] border-b border-[rgba(6,18,55,0.1)] box-border'>
            

            <div className="flex flex-col mb-4 p-2">
             <div className="bg-green-100 text-center border-2 border-green-300 rounded-full px-2 py-3">
             <p className="font-medium leading-[14px] text-[14px] text-[#00A36C]">2 ad sets</p>
             </div>

             <div className="bg-[#F9FAFB] border-2 border-gray-200 flex justify-center item-center text-[#061237] h-[50px] rounded-lg mt-6 px-6 py-4">
              <div className="flex items-center gap-2">
                <span><Image className="size-5" src={facebook} alt="facebook" /></span>  
                <h2>Facebook</h2>
              </div>

             </div>
            </div>




              <div className="flex flex-col">
                

            <p className="font-bold py-3">Budget</p>
				<div className="e_currency-eur">
					<div className='flex'>
						<Image src={ecurrencyeur} alt="e_currency-eur" />
						<h3>0</h3>
					</div>
					<div>
						EUR
					</div>
				</div>
        </div>

        {/* second */}

        <div className="flex flex-col">
 <p className="font-bold py-3">Percentage</p>

        <div className="flex items-center ">

   <div className="e_currency-eur !w-[62px]">
  
     <h3>0 %</h3>
      
       </div>

       <p className="text-[15px] pl-4 whitespace-nowrap text-center text-[#061237CC] leading-[20px]">
						of Awareness budget
					</p>

          <div className="ml-6">
            
          </div>
       </div> 
        </div>

        
			</div>


      <div className='flex flex-row mt-8 items-center gap-[16px] px-0 py-[24px] border-b border-[rgba(6,18,55,0.1)] box-border'>

            <div className="mt-12 p-2">
          <div className="bg-[#F9FAFB] border-2 border-gray-200 flex items-center text-[#061237] h-[50px] rounded-lg px-6 py-4">
              <div className="flex items-center gap-2">
                <span><Image className="size-5" src={instagram} alt="facebook" /></span>  
                <h2>Instagram</h2>
              </div>

             </div>
             </div>


              <div className="flex flex-col">

            <p className="font-bold py-3">Budget</p>
				<div className="e_currency-eur">
					<div className='flex'>
						<Image src={ecurrencyeur} alt="e_currency-eur" />
						<h3>0</h3>
					</div>
					<div>
						EUR
					</div>
				</div>
        </div>

        {/* second */}

        <div className="flex flex-col">
 <p className="font-bold py-3">Percentage</p>

        <div className="flex items-center ">

   <div className="e_currency-eur !w-[62px]">
  
     <h3>0 %</h3>
      
       </div>

       <p className="text-[15px] whitespace-nowrap pl-4 text-center leading-[20px]">
						of Awareness budget
					</p>
       </div> 
        </div>

        
			</div>




      <div className=' flex flex-row mt-8 items-center gap-[16px] px-0 py-[24px] border-b border-[rgba(6,18,55,0.1)] box-border'>

      <div className="mt-12 p-2">
          <div className="bg-[#F9FAFB] border-2 border-gray-200 flex items-center text-[#061237] h-[50px] rounded-lg px-6 py-4">
              <div className="flex items-center gap-2">
                <span><Image className="size-5" src={youtube} alt="facebook" /></span>  
                <h2>Youtube</h2>
              </div>

             </div>
             </div>


              <div className="flex flex-col">

            <p className="font-bold py-3">Budget</p>
				<div className="e_currency-eur">
					<div className='flex'>
						<Image src={ecurrencyeur} alt="e_currency-eur" />
						<h3>0</h3>
					</div>
					<div>
						EUR
					</div>
				</div>
        </div>

        {/* second */}

        <div className="flex flex-col">
 <p className="font-bold py-3">Percentage</p>

        <div className="flex items-center ">

   <div className="e_currency-eur !w-[62px]">
  
     <h3>0 %</h3>
      
       </div>

       <p className="text-[15px] whitespace-nowrap pl-4 text-center leading-[20px]">
						of Awareness budget
					</p>
       </div> 
        </div>

        
			</div>



      <div className=' flex flex-row mt-8 items-center gap-[16px] px-0 py-[24px] border-b border-[rgba(6,18,55,0.1)] box-border'>

      <div className="mt-12 p-2">
          <div className="bg-[#F9FAFB] border-2 border-gray-200 flex items-center text-[#061237] h-[50px] rounded-lg px-6 py-4">
              <div className="flex items-center gap-2">
                <span><Image className="size-5" src={trade} alt="facebook" /></span>  
                <h2>The TradeDesk</h2>
              </div>

             </div>
             </div>


              <div className="flex flex-col">

            <p className="font-bold py-3">Budget</p>
				<div className="e_currency-eur">
					<div className='flex'>
						<Image src={ecurrencyeur} alt="e_currency-eur" />
						<h3>0</h3>
					</div>
					<div>
						EUR
					</div>
				</div>
        </div>

        {/* second */}

        <div className="flex flex-col">
 <p className="font-bold py-3">Percentage</p>

        <div className="flex items-center ">

   <div className="e_currency-eur !w-[62px]">
  
     <h3>0 %</h3>
      
       </div>

       <p className="text-[15px] whitespace-nowrap pl-4 text-center leading-[20px]">
						of Awareness budget
					</p>
       </div> 
        </div>

        
			</div>




      <div className=' flex flex-row mt-8 items-center gap-[16px] px-0 py-[24px] border-b border-[rgba(6,18,55,0.1)] box-border'>


      <div className="mt-12 p-2">
          <div className="bg-[#F9FAFB] border-2 border-gray-200 flex items-center text-[#061237] h-[50px] rounded-lg px-6 py-4">
              <div className="flex items-center gap-2">
                <span><Image className="size-5" src={quantcast} alt="facebook" /></span>  
                <h2>Quantcast</h2>
              </div>

             </div>
             </div>


              <div className="flex flex-col">

            <p className="font-bold py-3">Budget</p>
				<div className="e_currency-eur">
					<div className='flex'>
						<Image src={ecurrencyeur} alt="e_currency-eur" />
						<h3>0</h3>
					</div>
					<div>
						EUR
					</div>
				</div>
        </div>

        {/* second */}

        <div className="flex flex-col">
 <p className="font-bold py-3">Percentage</p>

        <div className="flex items-center ">

   <div className="e_currency-eur !w-[62px]">
  
     <h3>0 %</h3>
      
       </div>

       <p className="text-[15px] whitespace-nowrap pl-4 text-center leading-[20px]">
						of Awareness budget
					</p>
       </div> 
        </div>

        
			</div>

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
        </div>
      ))}
    </div>
  );
};

export default ConfiguredSetPage;
