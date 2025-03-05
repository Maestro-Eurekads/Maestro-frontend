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
              <div className='pt-8 bg-[#FCFCFC] rounded-lg cursor-pointer border px-6 border-[rgba(6,18,55,0.1)]'>
              <div className="flex mt-6 flex-col items-start gap-12">

           <div className="flex mb-8 justify-center gap-6">
         {/* top budget */}
         <div className="flex flex-col gap-4">
            
         <h2 className="text-center font-bold">What is your budget for this phase ?</h2>
           <div className="flex items-center justify-between px-4 w-[200px] h-[50px] border border-[#D0D5DD] rounded-[10px] bg-[#FFFFFF]">
            
             <div className="flex items-center gap-2">
               <p className="font-bold">€</p>
               <span>0</span>
             </div>

             <input type="text" className="w-full px-4 focus:outline-none" />
            
             <div className="flex items-center gap-2">
             <select className="bg-white font-bold text-gray-700 py-1 px-3 rounded focus:outline-none cursor-pointer">
            <option value="EUR" selected>EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            </select>
             </div>

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
         
          <p>of total budget</p>
         </div>
         </div>
        
           </div>

           <hr className="text-gray-200 w-full p-8"/>

          
          {/* Second row */}
          <div className="flex mb-8 items-center justify-center gap-2">
          
          {/* facebook */}
          <div className="flex items-start flex-col gap-4">
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
            
             <div className="flex items-center gap-2">
               <p className="font-bold">€</p>
               <span>0</span>
             </div>

             <input type="text" className="w-full px-4 focus:outline-none" />
            
             <div className="flex items-center gap-2">
             <select className="bg-white font-bold text-gray-700 py-1 px-3 rounded focus:outline-none cursor-pointer">
            <option value="EUR" selected>EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            </select>
             </div>

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
         
          <p>of total budget</p>
           
           {/* switch */}
           <div className="flex items-center gap-2">

           <label
  htmlFor="AcceptConditions"
  className="relative inline-block h-8 w-14 cursor-pointer rounded-full bg-gray-300 transition [-webkit-tap-highlight-color:_transparent] has-[:checked]:bg-blue-500"
>
  <input type="checkbox" id="AcceptConditions" className="peer sr-only" />

  <span
    className="absolute inset-y-0 start-0 m-1 size-6 rounded-full bg-white transition-all peer-checked:start-6"
    ></span>
</label>
<p className="text-[#061237] font-semibold">Auto-split budget across ad sets</p>
    </div>

            
         </div>
         </div>


         </div>

         <hr className="text-gray-200 w-full p-8"/>


        {/* Third row */}
        <div className="flex mb-8 justify-center items-center gap-2">
          
          {/* facebook */}
          
             

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
            
             <div className="flex items-center gap-2">
               <p className="font-bold">€</p>
               <span>0</span>
             </div>

             <input type="text" className="w-full px-4 focus:outline-none" />
            
             <div className="flex items-center gap-2">
             <select className="bg-white font-bold text-gray-700 py-1 px-3 rounded focus:outline-none cursor-pointer">
            <option value="EUR" selected>EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            </select>
             </div>

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
         
          <p>of total budget</p>
        
            
         </div>
         </div>


         </div>

         <hr className="text-gray-200 w-full p-8"/>


         {/* Fourth row */}
         <div className="flex mb-8 justify-center items-center gap-2">
          
          {/* facebook */}
           
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
            
             <div className="flex items-center gap-2">
               <p className="font-bold">€</p>
               <span>0</span>
             </div>

             <input type="text" className="w-full px-4 focus:outline-none" />
            
             <div className="flex items-center gap-2">
             <select className="bg-white font-bold text-gray-700 py-1 px-3 rounded focus:outline-none cursor-pointer">
            <option value="EUR" selected>EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            </select>
             </div>

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
         
          <p>of total budget</p>
        
            
         </div>
         </div>


         </div>

         <hr className="text-gray-200 w-full p-8"/>



         {/* Fifth row */}

         <div className="flex mb-8 justify-center items-center gap-2">
              
          {/* facebook */}
          
             
             
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
            
             <div className="flex items-center gap-2">
               <p className="font-bold">€</p>
               <span>0</span>
             </div>

             <input type="text" className="w-full px-4 focus:outline-none" />
            
             <div className="flex items-center gap-2">
             <select className="bg-white font-bold text-gray-700 py-1 px-3 rounded focus:outline-none cursor-pointer">
            <option value="EUR" selected>EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            </select>
             </div>

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
         
          <p>of total budget</p>
        
            
         </div>
         </div>


         </div>

         <hr className="text-gray-200 w-full p-8"/>


         {/* Sixth row */}
         <div className="flex mb-8 justify-center items-center gap-2">
          
          {/* facebook */}
               
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
            
             <div className="flex items-center gap-2">
               <p className="font-bold">€</p>
               <span>0</span>
             </div>

             <input type="text" className="w-full px-4 focus:outline-none" />
            
             <div className="flex items-center gap-2">
             <select className="bg-white font-bold text-gray-700 py-1 px-3 rounded focus:outline-none cursor-pointer">
            <option value="EUR" selected>EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            </select>
             </div>

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
         
          <p>of total budget</p>
        
            
         </div>
         </div>


         </div>

         <hr className="text-gray-200 w-full p-8"/>

       </div>
        
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



// Main container component


//    const ConfiguredSetPage = () => {
//     return (
//       <div className="flex mt-6 flex-col items-start  gap-12">

//           <div className="flex justify-center gap-6">
//         {/* top budget */}
//         <div className="flex flex-col gap-4">
            
//         <h2 className="text-center font-bold">What is your budget for this phase ?</h2>
//           <div className="flex items-center justify-between px-4 w-[200px] h-[50px] border border-[#D0D5DD] rounded-[10px] bg-[#FFFFFF]">
            
//             <div className="flex items-center gap-2">
//               <p className="font-bold">€</p>
//               <span>0</span>
//             </div>

//             <input type="text" className="w-full px-4 focus:outline-none" />
            
//             <div className="flex items-center gap-2">
//             <select className="bg-white font-bold text-gray-700 py-1 px-3 rounded focus:outline-none cursor-pointer">
//            <option value="EUR" selected>EUR</option>
//            <option value="USD">USD</option>
//            <option value="GBP">GBP</option>
//            </select>
//             </div>

//           </div>
//         </div>

//         <div className="flex items-start flex-col gap-4">
//          <h2 className="text-center font-bold">Percentage</h2>
//          <div className="flex items-center gap-4">

//          <div className=" bg-[#FFFFFF] rounded-[10px] w-[62px] h-[50px] border border-[#D0D5DD] flex items-center px-4">
//           <input className="text-base w-full focus:outline-none" type="text" />
//           <span>%</span>
//          </div>
         
//          <p>of total budget</p>
//         </div>
//         </div>
        
//           </div>
//           <hr className="border border-gray-100 w-full px-6"/>
//       </div>
//     )


// };

// export default ConfiguredSetPage;

