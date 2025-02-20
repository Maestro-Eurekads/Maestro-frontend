import React, {useState} from 'react'
import PageHeaderWrapper from '../../../components/PageHeaderWapper';
import Topdown from '../../../public/Top-down.svg';
import Selectstatus from '../../../public/Select-status.svg';
import backdown from '../../../public/back-down.svg';
import ecurrencyeur from '../../../public/e_currency-eur.svg';
import Image from 'next/image';
import PlatformSpending from '../../../components/PlatformSpending';
import Router from 'next/router';
import ConfigureAdSetsAndBudget from './ ConfigureadSetsAndbudget';

const CampaignBudget = () => {
  const [active, setActive] = useState(null);
  const [show, setShow] = useState(false)
  // Clicking Top‑down: set active without auto-opening any details.
  const handleTopDownClick = () => {
    setActive(1);
  };

  // Clicking Bottom‑up: set active without auto-opening any details.
  const handleBottomUpClick = () => {
    setActive(2);
  };



  return (
    <div>
      
      <PageHeaderWrapper
        t1='Allocate your campaign budget'
        t2='Decide whether to allocate your budget by channel or ad set. First, enter an overall campaign budget if applicable.'
        t3='Then, distribute it across channels and ad sets.'
        t4='Choose how to set your campaign budget'
        span={1}
      
      
      />


<div className="mt-[24px] flex gap-5">
        {/* Top‑down Option */}
        <div
          className={
            active === 1
              ? "top_and_bottom_down_container_active relative"
              : "top_and_bottom_down_container relative"
          }
          onClick={handleTopDownClick}
        >
          <div className="flex items-start gap-2">
            {active === 2 ? (
              <Image src={backdown} alt="backdown" className="rotate-180 transform" />
            ) : (
              <Image
                src={Topdown}
                alt="Topdown"
                className={active === 1 ? "rotate-30 transform" : ""}
              />
            )}
            <div>
              <h3 className="font-semibold whitespace-nowrap text-[15px] leading-[175%] flex items-center text-[#061237]">
                Top‑down
              </h3>
              <p className="font-medium whitespace-nowrap text-[13px] leading-[175%] flex items-center text-[rgba(6,18,55,0.8)]">
                Ideal if you have a fixed overall budget.
              </p>
            </div>
          </div>
          {active === 1 && (
            <div className="absolute right-2 top-2">
              <Image src={Selectstatus} alt="Selectstatus" />
            </div>
          )}
        </div>

        {/* Bottom‑up Option */}
        <div
          className={
            active === 2
              ? "top_and_bottom_down_container_active relative"
              : "top_and_bottom_down_container relative"
          }
          onClick={handleBottomUpClick}
        >
          <div className="flex items-start gap-2">
            {active === 2 ? (
              <Image src={Topdown} alt="Topdown" className="rotate-180 transform" />
            ) : (
              <Image src={backdown} alt="backdown" />
            )}
            <div>
              <h3 className="font-semibold whitespace-nowrap text-[15px] leading-[175%] flex items-center text-[#061237]">
                Bottom‑up
              </h3>
              <p className="font-medium whitespace-nowrap text-[13px] leading-[175%] flex items-center text-[rgba(6,18,55,0.8)]">
                Perfect for precise control over spending.
              </p>
            </div>
          </div>
          {active === 2 && (
            <div className="absolute right-2 top-2">
              <Image src={Selectstatus} alt="Selectstatus" />
            </div>
          )}
        </div>
      </div>


       {/* Only show the 12,000 EUR section when an option is active */}
       {active && (
        <div className="mt-[24px] flex flex-row items-center gap-[16px] px-0 py-[24px] bg-[#F9FAFB] border-b border-[rgba(6,18,55,0.1)] box-border">
          <div className="e_currency-eur">
            <div className="flex">
              <Image src={ecurrencyeur} alt="e_currency-eur" />
              <h3>12,000,00</h3>
            </div>
            <div>EUR</div>
          </div>
          <div>
            <p className="font-[600] text-[15px] leading-[20px] text-[#00A36C]">
              Remaining budget: 12 000
            </p>
          </div>
        </div>
      )}


    </div>
  )
}

export default CampaignBudget
