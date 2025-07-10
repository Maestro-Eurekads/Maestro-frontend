import { useCampaigns } from "app/utils/CampaignsContext";
import { formatNumberWithCommas, getCurrencySymbol } from "components/data";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import Select from "react-select";

// Component to handle budget input and currency selection
function BudgetInput({
  selectedOption,
  handleBudgetEdit,
  selectCurrency,
  setSelectedOption,
}) {
  const { campaignFormData } = useCampaigns();
  const [inputValue, setInputValue] = useState("");



  // Sync input value with campaign form data
  useEffect(() => {
    if (campaignFormData?.campaign_budget?.amount) {
      setInputValue(formatNumberWithCommas(campaignFormData.campaign_budget.amount));
    } else {
      setInputValue("");
    }
  }, [campaignFormData?.campaign_budget?.amount]);

  // Sync selected currency with campaign form data
  useEffect(() => {
    if (campaignFormData?.campaign_budget?.currency) {
      setSelectedOption({
        label: campaignFormData.campaign_budget.currency,
        value: campaignFormData.campaign_budget.currency,
      });
    }
  }, [campaignFormData, setSelectedOption]);

  // Handle currency change from dropdown
  const handleCurrencyChange = (option) => {
    setSelectedOption(option);
    handleBudgetEdit("currency", option.value);
  };

  // Handle input change and validation
  const handleInputChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    // Allow only numbers and decimals
    if (/^\d*\.?\d*$/.test(rawValue)) {
      setInputValue(e.target.value);
      // Only update if not empty and is a valid number
      if (rawValue !== "" && !isNaN(Number(rawValue))) {
        handleBudgetEdit("amount", Number(rawValue).toString());
      } else {
        // If input is empty, clear the budget amount in form data
        handleBudgetEdit("amount", "");
      }
    }
  };

  return (
    <div className="flex flex-row items-center gap-[16px] px-0 bg-[#F9FAFB] border-[rgba(6,18,55,0.1)] box-border">
      <div className="e_currency-eur items-center">
        <div className="flex items-center">
          <p>{getCurrencySymbol(selectedOption.value)}</p>
          <input
            className="text-center outline-none w-[145px]"
            placeholder="Budget value"
            value={inputValue}
            onChange={handleInputChange}
            aria-label="Budget amount input"
            inputMode="decimal"
            autoComplete="off"
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