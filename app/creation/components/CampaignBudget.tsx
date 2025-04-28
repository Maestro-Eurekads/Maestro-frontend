import React, { useEffect, useState } from "react";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import Topdown from "../../../public/Top-down.svg";
import backdown from "../../../public/back-down.svg";
import Selectstatus from "../../../public/Select-status.svg";
import ecurrencyeur from "../../../public/e_currency-eur.svg";
import Image from "next/image";
import Input from "components/Input";
import Select from "react-select";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useComments } from "app/utils/CommentProvider";
import { useEditing } from "app/utils/EditingContext";
import { formatNumberWithCommas } from "components/data";

const CampaignBudget = () => {
  const [active, setActive] = useState(null);
  const { setIsDrawerOpen, setClose } = useComments();
  const { isEditing, setIsEditing } = useEditing();

  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
    setIsEditing(true);
  }, []);

  const [selectedOption, setSelectedOption] = useState({
    value: "EUR",
    label: "EUR",
  });

  const { campaignFormData, setCampaignFormData } = useCampaigns();

  // Clicking Top‑down: set active without auto-opening any details.
  const handleTopDownClick = () => {
    setActive(1);
  };

  // Clicking Bottom‑up: set active without auto-opening any details.
  const handleBottomUpClick = () => {
    setActive(2);
  };

  const selectCurrency = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "GBP", label: "GBP" },
    { value: "NGN", label: "NGN" },
    { value: "JPY", label: "JPY" },
    { value: "CAD", label: "CAD" },
  ];

  const handleCurrencyChange = (option) => {
    if (!isEditing) return;
    setSelectedOption(option);
    handleBudgetEdit("currency", option.value);
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      NGN: "₦",
      JPY: "¥",
      CAD: "$",
    };
    return symbols[currency] || "";
  };

  const handleBudgetEdit = (param: string, type: string) => {
    if (!isEditing) return;
    setCampaignFormData((prev) => ({
      ...prev,
      campaign_budget: {
        ...prev?.campaign_budget,
        [param]: type?.toString(),
      },
    }));
  };

  const calculateRemainingBudget = () => {
    const totalBudget = Number(campaignFormData?.campaign_budget?.amount) || 0;
    const subBudgets =
      campaignFormData?.channel_mix?.reduce((acc, stage) => {
        return acc + (Number(stage?.stage_budget?.fixed_value) || 0);
      }, 0) || 0;
    return totalBudget - subBudgets;
  };

  return (
    <div>
      <div className="flex justify-between">
        <PageHeaderWrapper
          t1="Allocate your campaign budget"
          t2="Decide whether to allocate your budget by channel or ad set. First, enter an overall campaign budget if applicable."
          t3="Then, distribute it across channels and ad sets."
          t4="Choose how to set your campaign budget"
          span={1}
        />
      </div>

      <div className="mt-[24px] flex gap-5">
        {/* Top‑down Option */}
        <div
          className={`relative ${
            active === 1
              ? "top_and_bottom_down_container_active"
              : "top_and_bottom_down_container"
          }`}
          onClick={() => {
            if (!isEditing) return;
            handleTopDownClick();
            handleBudgetEdit("budget_type", "top_down");
          }}
        >
          <div className="flex items-start gap-2">
            {active === 2 ? (
              <Image
                src={backdown}
                alt="backdown"
                className="rotate-180 transform"
              />
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
          className={`relative ${
            active === 2
              ? "top_and_bottom_down_container_active"
              : "top_and_bottom_down_container"
          }`}
          onClick={() => {
            if (!isEditing) return;
            handleBottomUpClick();
            handleBudgetEdit("budget_type", "bottom_up");
          }}
        >
          <div className="flex items-start gap-2">
            {active === 2 ? (
              <Image
                src={Topdown}
                alt="Topdown"
                className="rotate-180 transform"
              />
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

      {/* Only show the 12,000 EUR section when an option is active */}
      {active && (
        <div className="mt-[24px] flex flex-row items-center gap-[16px] px-0 py-[24px] bg-[#F9FAFB] border-b border-[rgba(6,18,55,0.1)] box-border">
          <div className="e_currency-eur items-center">
            <div className="flex items-center">
              <p>{getCurrencySymbol(selectedOption.value)}</p>
              <input
                className="text-center outline-none w-[145px]"
                placeholder="Budget value"
                value={
                  formatNumberWithCommas(
                    campaignFormData?.campaign_budget?.amount
                  ) || ""
                }
                onChange={(e) => {
                  if (!isEditing) return;
                  const inputValue = e.target.value.replace(/,/g, ""); // Remove commas
                  const newBudget = Number(inputValue);
                  if (/^\d*\.?\d*$/.test(newBudget.toString())) {
                    handleBudgetEdit("amount", newBudget.toString());
                  }
                }}
                disabled={!isEditing}
              />
            </div>
            <div className="w-[120px]">
              <Select
                placeholder="EUR"
                options={selectCurrency}
                onChange={handleCurrencyChange}
                defaultValue={{ value: "EUR", label: "EUR" }}
                isDisabled={!isEditing}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    border: "none",
                    background: "none",
                    outline: "none",
                    padding: "0",
                  }),
                  indicatorSeparator: (provided) => ({
                    ...provided,
                    display: "none",
                  }),
                  indicatorsContainer: (provided) => ({
                    ...provided,
                    scale: "0.7",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    padding: "5px",
                    outline: "none",
                    fontSize: "14px",
                  }),
                  valueContainer: (provided) => ({
                    ...provided,
                    padding: 0,
                  }),
                }}
              />
            </div>
          </div>
          <div>
            <p
              className={`font-[600] text-[15px] leading-[20px] ${
                Number(calculateRemainingBudget()) < 1
                  ? "text-red-500"
                  : "text-[#00A36C]"
              }`}
            >
              Remaining budget:{" "}
              {Number(campaignFormData?.campaign_budget?.amount) > 0
                ? getCurrencySymbol(
                    campaignFormData?.campaign_budget?.currency ||
                      selectedOption?.value
                  )
                : ""}
              {Number(calculateRemainingBudget())?.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignBudget;
