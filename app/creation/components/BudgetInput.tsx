import { useCampaigns } from "app/utils/CampaignsContext";
import { formatNumberWithCommas, getCurrencySymbol } from "components/data";
import React, { useEffect } from "react";
import Select from "react-select";

function BudgetInput({
  selectedOption,
  handleBudgetEdit,
  selectCurrency,
  setSelectedOption,
}) {
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  const handleCurrencyChange = (option) => {
    setSelectedOption(option);
    handleBudgetEdit("currency", option.value);
  };
  const calculateRemainingBudget = () => {
    const totalBudget = Number(campaignFormData?.campaign_budget?.amount) || 0;
    const subBudgets =
      campaignFormData?.channel_mix?.reduce((acc, stage) => {
        return acc + (Number(stage?.stage_budget?.fixed_value) || 0);
      }, 0) || 0;
    return totalBudget - subBudgets;
  };

  useEffect(() => {
    if (campaignFormData?.campaign_budget) {
      setSelectedOption({
        label: campaignFormData?.campaign_budget?.currency,
        value: campaignFormData?.campaign_budget?.currency,
      });
    }
  }, [campaignFormData]);

  return (
    <div className="flex flex-row items-center gap-[16px] px-0 bg-[#F9FAFB] border-[rgba(6,18,55,0.1)] box-border">
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
              const inputValue = e.target.value.replace(/,/g, ""); // Remove commas
              const newBudget = Number(inputValue);
              if (/^\d*\.?\d*$/.test(newBudget.toString())) {
                handleBudgetEdit("amount", newBudget.toString());
              }
            }}
          />
        </div>
        <div className="w-[120px]">
          <Select
            placeholder="EUR"
            options={selectCurrency}
            onChange={handleCurrencyChange}
            value={selectedOption}
            defaultValue={{label: "EUR", value: "EUR"}}
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
      {/* <div>
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
      </div> */}
    </div>
  );
}

export default BudgetInput;
