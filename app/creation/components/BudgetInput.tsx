import { useCampaigns } from "app/utils/CampaignsContext";
import { formatNumberWithCommas, getCurrencySymbol } from "components/data";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import Select from "react-select";

// Component to handle budget input and currency selection
function BudgetInput({
  selectedOption,
  handleBudgetEdit,
  selectCurrency,
  setSelectedOption,
}) {
  const { campaignFormData, setCampaignFormData } = useCampaigns();

  // Handle currency change from dropdown
  const handleCurrencyChange = (option) => {
    setSelectedOption(option);
    handleBudgetEdit("currency", option.value);
  };

  // Sync selected currency with campaign form data
  useEffect(() => {
    if (campaignFormData?.campaign_budget) {
      setSelectedOption({
        label: campaignFormData?.campaign_budget?.currency,
        value: campaignFormData?.campaign_budget?.currency,
      });
    }
  }, [campaignFormData, setSelectedOption]);

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
              const inputValue = e.target.value.replace(/,/g, "");
              const newBudget = Number(inputValue);
              if (/^\d*\.?\d*$/.test(newBudget.toString())) {
                handleBudgetEdit("amount", newBudget.toString());
              }
            }}
            aria-label="Budget amount input"
          />
        </div>
        <div className="w-[120px]">
          <Select
            placeholder="EUR"
            options={selectCurrency}
            onChange={handleCurrencyChange}
            value={selectedOption}
            defaultValue={{ label: "EUR", value: "EUR" }}
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
            aria-label="Currency selector"
          />
        </div>
      </div>
    </div>
  );
}

// Define PropTypes for type checking
BudgetInput.propTypes = {
  selectedOption: PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  handleBudgetEdit: PropTypes.func.isRequired,
  selectCurrency: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  setSelectedOption: PropTypes.func.isRequired,
};

export default BudgetInput;