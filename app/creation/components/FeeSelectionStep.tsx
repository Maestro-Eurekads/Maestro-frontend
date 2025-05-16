"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Selectstatus from "../../../public/Select-status.svg";
import { formatNumberWithCommas, getCurrencySymbol } from "components/data";
import { useCampaigns } from "app/utils/CampaignsContext";
import Select from "react-select";
import toast from "react-hot-toast";
import PageHeaderWrapper from "components/PageHeaderWapper";
import BudgetInput from "./BudgetInput";
import PropTypes from "prop-types";

const feeOptions = [
  { label: "VAT", value: "vat", type: "percent" },
  { label: "Media Fee", value: "media_fee", type: "percent" },
  { label: "Admin Fee", value: "admin_fee", type: "percent" },
  { label: "Trafficking Fee", value: "trafficking_fee", type: "percent" },
  { label: "Platform Fee", value: "platform_fee", type: "percent" },
  { label: "Fixed Fee", value: "fixed_fee", type: "fixed" },
];

function FeeSelectionStep({
  num1,
  num2,
  isValidated,
  setIsValidated,
  netAmount,
  setNetAmount,
  feeType,
  setFeeType,
  feeAmount,
  setFeeAmount,
}) {
  const [active, setActive] = useState(null);
  const [showSelection, setShowSelection] = useState(true);
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  const [selectedOption, setSelectedOption] = useState({
    value: "EUR",
    label: "EUR",
  });
  const [fees, setFees] = useState([]);

  const selectCurrency = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "GBP", label: "GBP" },
    { value: "NGN", label: "NGN" },
    { value: "JPY", label: "JPY" },
    { value: "CAD", label: "CAD" },
  ];

  const handleBudgetEdit = (param, type) => {
    setCampaignFormData((prev) => ({
      ...prev,
      campaign_budget: {
        ...prev?.campaign_budget,
        [param]: type?.toString(),
      },
    }));
  };

  const calculateNetAmount = () => {
    if (!campaignFormData?.campaign_budget?.amount) return "";

    const grossAmount = Number.parseFloat(
      campaignFormData?.campaign_budget?.amount
    );

    const totalFees = fees.reduce(
      (total, fee) => total + Number.parseFloat(fee.amount),
      0
    );

    if (active === 1) {
      return (grossAmount - totalFees).toFixed(2);
    } else if (active === 2) {
      return (grossAmount - totalFees).toFixed(2);
    }

    return "";
  };

  const updateNetAmount = (
    feesList = fees,
    budget = campaignFormData?.campaign_budget?.amount
  ) => {
    const budgetAmount = parseFloat(budget || "0");
    const totalFees = feesList.reduce(
      (total, fee) => total + parseFloat(fee.amount),
      0
    );

    const net = (budgetAmount - totalFees).toFixed(2);

    setNetAmount(net);
  };

  const handleAddFee = () => {
    if (!campaignFormData?.campaign_budget?.amount) {
      toast("Please set the overall campaign budget first", {
        style: { background: "red", color: "white" },
      });
      return;
    }
    if (!feeType || !feeAmount) {
      toast("Fee type and value is required", {
        style: { background: "red", color: "white" },
      });
      return;
    }

    const budgetAmount = parseFloat(
      campaignFormData?.campaign_budget?.amount || "0"
    );
    const feeValue = parseFloat(feeAmount);

    if (feeType.type === "percent" && feeValue > 100) {
      toast("Percentage cannot exceed 100", {
        style: { background: "red", color: "white" },
      });
      return;
    }

    let calculatedAmount =
      feeType.type === "percent" ? (budgetAmount * feeValue) / 100 : feeValue;

    const duplicate = fees.find((fee) => fee.type === feeType.value);
    if (duplicate) {
      toast(`${feeType.label} has already been added.`, {
        style: { background: "orange", color: "white" },
      });
      return;
    }

    const newTotalFees =
      fees.reduce((total, fee) => total + parseFloat(fee.amount), 0) +
      calculatedAmount;

    if (newTotalFees > budgetAmount) {
      toast("Total fees cannot exceed the gross amount", {
        style: { background: "red", color: "white" },
      });
      return;
    }

    const newFee = {
      type: feeType.value,
      label: feeType.label,
      amount: calculatedAmount.toFixed(2),
      isPercent: feeType.type === "percent",
      percentValue: feeType.type === "percent" ? feeAmount : null,
    };

    const updatedFees = [...fees, newFee];
    setFees(updatedFees);

    const budgetFees = updatedFees.map((fee) => ({
      fee_type: fee.type,
      value: fee.amount,
      isPercent: fee.isPercent,
      percentValue: fee.percentValue,
    }));

    setCampaignFormData((prev) => ({
      ...prev,
      campaign_budget: {
        ...prev?.campaign_budget,
        budget_fees: budgetFees,
      },
    }));

    updateNetAmount(updatedFees);
    setFeeType(null);
    setFeeAmount("");
  };

  useEffect(() => {
    if (campaignFormData) {
      const feesData = campaignFormData?.campaign_budget?.budget_fees?.map(
        (bud) => ({
          type: bud?.fee_type,
          label: feeOptions?.find((opt) => opt.value === bud?.fee_type)?.label,
          amount: bud?.value,
          isPercent:
            feeOptions?.find((opt) => opt.value === bud?.fee_type)?.type ===
            "percent",
          percentValue:
            feeOptions?.find((opt) => opt.value === bud?.fee_type)?.type ===
            "percent"
              ? bud?.percentValue
              : null,
        })
      );
      setFees(feesData || []);
      if (campaignFormData?.campaign_budget?.sub_budget_type === "net") {
        setActive(2);
      } else if (
        campaignFormData?.campaign_budget?.sub_budget_type === "gross"
      ) {
        setActive(1);
      }
    }
  }, [campaignFormData]);

  useEffect(() => {
    if (fees?.some((fee) => fee?.isPercent)) {
      const budgetAmount = Number.parseFloat(
        campaignFormData?.campaign_budget?.amount || "0"
      );

      const updatedFees = fees?.map((fee) => {
        if (fee?.isPercent) {
          const calculatedAmount = (
            (budgetAmount * Number.parseFloat(fee?.percentValue)) /
            100
          ).toFixed(2);
          return { ...fee, amount: calculatedAmount };
        }
        return fee;
      });

      setFees(updatedFees);

      const budgetFees = updatedFees.map((fee) => ({
        fee_type: fee.type,
        value: fee.amount,
        percentValue: fee?.percentValue,
        isPercent: fee?.isPercent,
      }));
      updateNetAmount(updatedFees);

      setCampaignFormData((prev) => ({
        ...prev,
        campaign_budget: {
          ...prev?.campaign_budget,
          budget_fees: budgetFees,
        },
      }));
    }
  }, [campaignFormData?.campaign_budget?.amount, active]);

  const calculateRemainingBudget = () => {
    const totalBudget = Number(netAmount) > 0 
      ? parseFloat(netAmount) 
      : parseFloat(campaignFormData?.campaign_budget?.amount);
      
    const totalFees = fees.reduce((total, fee) => total + Number(fee.amount), 0);
    const adjustedBudget = totalBudget - totalFees;

    const subBudgets = campaignFormData?.channel_mix?.reduce((acc, stage) => {
      return acc + (Number(stage?.stage_budget?.fixed_value) || 0);
    }, 0) || 0;

    const remainingBudget = adjustedBudget - subBudgets;
    return remainingBudget > 0 ? remainingBudget : 0;
  };

  const handleEditClick = () => {
    setShowSelection(true);
    setIsValidated(false);
    setFeeType(null);
    setFeeAmount("");
  };

  return (
    <>
      <div className="relative">
        {campaignFormData?.campaign_budget?.sub_budget_type && (
          <div className="fixed top-0 left-0 right-0 bg-white shadow-md p-2 z-50 border-b border-gray-100">
            <div className="flex items-center justify-between max-w-[1200px] mx-auto">
              <div className="flex items-center gap-4">
                <p className="font-semibold text-[15px]">
                  Total Budget: {getCurrencySymbol(selectedOption.value)}
                  {Number(netAmount) > 0
                    ? netAmount
                    : isNaN(
                        parseInt(campaignFormData?.campaign_budget?.amount)
                      )
                    ? ""
                    : parseInt(
                        campaignFormData?.campaign_budget?.amount
                      ).toLocaleString()}
                </p>
              </div>
              <p
                className={`font-[600] text-[15px] leading-[20px] ${
                  Number(calculateRemainingBudget()) < 1
                    ? "text-red-500"
                    : "text-[#00A36C]"
                }`}
              >
                Remaining budget: {getCurrencySymbol(selectedOption.value)}
                {Number(calculateRemainingBudget()).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <div className="pt-[72px]">
          <PageHeaderWrapper
            t4="Choose the type of budget you have"
            span={num1}
          />
          {!isValidated ? (
            <>
              {showSelection ? (
                <div className="mt-[24px] flex gap-5">
                  <div
                    className="relative bg-white rounded-lg border p-4 w-[350px] cursor-pointer"
                    onClick={() => {
                      setActive(1);
                      setCampaignFormData((prev) => ({
                        ...prev,
                        campaign_budget: {
                          ...prev?.campaign_budget,
                          sub_budget_type: "gross",
                          level: "channel",
                        },
                      }));
                      setShowSelection(false);
                    }}
                    role="button"
                    aria-label="Select Gross Media Budget (Channel Level)"
                  >
                    <div className="flex items-start gap-2">
                      <div>
                        <h3 className="font-semibold whitespace-nowrap text-[15px] leading-[175%] flex items-center text-[#061237]">
                          Gross Media Budget (Channel Level)
                        </h3>
                      </div>
                    </div>
                    {(active === 1 ||
                      campaignFormData?.campaign_budget?.sub_budget_type ===
                        "gross") && (
                      <div className="absolute right-2 top-2">
                        <Image
                          src={Selectstatus || "/placeholder.svg"}
                          alt="Select status icon"
                        />
                      </div>
                    )}
                  </div>

                  <div
                    className="relative bg-white rounded-lg border p-4 w-[350px] cursor-pointer"
                    onClick={() => {
                      setActive(2);
                      setCampaignFormData((prev) => ({
                        ...prev,
                        campaign_budget: {
                          ...prev?.campaign_budget,
                          sub_budget_type: "net",
                          level: "adset",
                        },
                      }));
                      setShowSelection(false);
                    }}
                    role="button"
                    aria-label="Select Net Media Budget (Adset Level)"
                  >
                    <div className="flex items-start gap-2">
                      <div>
                        <h3 className="font-semibold whitespace-nowrap text-[15px] leading-[175%] flex items-center text-[#061237]">
                          Net Media Budget (Adset Level)
                        </h3>
                      </div>
                    </div>
                    {(active === 2 ||
                      campaignFormData?.campaign_budget?.sub_budget_type ===
                        "net") && (
                      <div className="absolute right-2 top-2">
                        <Image
                          src={Selectstatus || "/placeholder.svg"}
                          alt="Select status icon"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-[24px] flex items-center gap-4">
                  <p className="text-[16px] font-semibold">
                    Selected: {campaignFormData?.campaign_budget?.sub_budget_type} (
                    {campaignFormData?.campaign_budget?.level} Level)
                  </p>
                  <button
                    className="text-[14px] text-[#3175FF] font-semibold cursor-pointer"
                    onClick={handleEditClick}
                    aria-label="Edit budget type selection"
                  >
                    Edit
                  </button>
                </div>
              )}

              {active && (
                <PageHeaderWrapper t4="Add the applicable fee(s)" span={num2} />
              )}
              {active === 1 ? (
                <div className="space-y-8">
                  <div className="flex w-[600px] justify-between mt-[24px] items-center">
                    <p className="font-semibold text-[16px]">
                      Media Gross Amount
                    </p>
                    <BudgetInput
                      selectedOption={selectedOption}
                      setSelectedOption={setSelectedOption}
                      handleBudgetEdit={handleBudgetEdit}
                      selectCurrency={selectCurrency}
                    />
                  </div>
                  <div>
                    <div className="flex w-[600px] justify-between items-end gap-6">
                      <div className="w-full">
                        <p className="font-semibold text-[16px] mb-2">
                          Select Fee Type
                        </p>
                        <Select
                          placeholder="Select fee type"
                          options={feeOptions}
                          onChange={(option) => setFeeType(option)}
                          value={feeType}
                          className="w-full max-w-[300px]"
                          isClearable
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              border: "",
                              background: "white",
                              outline: "none",
                              padding: "5px 10px",
                              borderRadius: "10px",
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
                              fontSize: "14px",
                            }),
                            valueContainer: (provided) => ({
                              ...provided,
                              padding: 0,
                            }),
                          }}
                          aria-label="Fee type selector"
                        />
                      </div>
                      <div className="e_currency-eur items-center flex flex-col">
                        <div className="flex items-center">
                          <p>
                            {feeType?.type === "percent"
                              ? ""
                              : getCurrencySymbol(
                                  campaignFormData?.campaign_budget?.currency
                                )}
                          </p>
                          <input
                            className="text-center outline-none max-w-[205px]"
                            placeholder={
                              feeType?.type === "percent"
                                ? "Fee percentage"
                                : "Fee amount"
                            }
                            value={feeAmount}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*\.?\d*$/.test(value)) {
                                if (
                                  feeType?.type === "percent" &&
                                  Number(value) > 100
                                ) {
                                  toast("Percentage cannot exceed 100", {
                                    style: {
                                      background: "red",
                                      color: "white",
                                    },
                                  });
                                  return;
                                }
                                setFeeAmount(value);
                              }
                            }}
                            aria-label={
                              feeType?.type === "percent"
                                ? "Fee percentage input"
                                : "Fee amount input"
                            }
                          />
                          {feeType?.type === "percent" && <span>%</span>}
                        </div>
                        <button
                          className="mt-4 bg-blue-500 text-white px-2 py-1 rounded"
                          onClick={handleAddFee}
                          aria-label="Add fee"
                        >
                          Add fee
                        </button>
                      </div>
                    </div>
                    {fees.length > 0 && (
                      <div className="mt-4 w-[600px]">
                        <p className="font-semibold text-[16px] mb-2">
                          Added Fees:
                        </p>
                        {fees.map((fee, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded mb-2"
                          >
                            <span>{fee.label}</span>
                            <div className="flex items-center">
                              <span>
                                {getCurrencySymbol(
                                  campaignFormData?.campaign_budget?.currency
                                )}
                              </span>
                              <span>
                                {Number.parseFloat(fee.amount).toLocaleString()}
                              </span>
                              {fee.isPercent && (
                                <span className="ml-2 text-gray-500">
                                  ({fee.percentValue}%)
                                </span>
                              )}
                              <button
                                className="ml-4 text-red-500"
                                onClick={() => {
                                  const updatedFees = fees.filter(
                                    (_, i) => i !== index
                                  );
                                  setFees(updatedFees);

                                  const budgetFees = updatedFees.map((fee) => ({
                                    fee_type: fee.type,
                                    value: fee.amount,
                                    isPercent: fee.isPercent,
                                    percentValue: fee.percentValue,
                                  }));

                                  setCampaignFormData((prev) => ({
                                    ...prev,
                                    campaign_budget: {
                                      ...prev?.campaign_budget,
                                      budget_fees: budgetFees,
                                    },
                                  }));

                                  updateNetAmount(updatedFees);
                                }}
                                aria-label={`Remove ${fee.label} fee`}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex w-[600px] justify-between mt-[24px] items-center">
                    <p className="font-semibold text-[16px]">
                      Net Gross Amount
                    </p>
                    <div className="flex flex-row items-center gap-[16px] px-0 bg-[#F9FAFB] border-b border-[rgba(6,18,55,0.1)] box-border">
                      <div className="e_currency-eur items-center">
                        <div className="flex items-center">
                          <p>
                            {getCurrencySymbol(
                              campaignFormData?.campaign_budget?.currency
                            )}
                          </p>
                          <input
                            className="text-center outline-none w-[145px]"
                            placeholder="Gross amount"
                            value={
                              isNaN(Number(netAmount)) ||
                              Number(netAmount.toLocaleString()) <= 0
                                ? ""
                                : netAmount
                            }
                            readOnly
                            aria-label="Net gross amount (read-only)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                active === 2 && (
                  <div className="space-y-8">
                    <div className="flex w-[600px] justify-between mt-[24px] items-center">
                      <p className="font-semibold text-[16px]">
                        Media Net Amount
                      </p>
                      <BudgetInput
                        selectedOption={selectedOption}
                        setSelectedOption={setSelectedOption}
                        handleBudgetEdit={handleBudgetEdit}
                        selectCurrency={selectCurrency}
                      />
                    </div>
                    <div>
                      <div className="flex w-[600px] justify-between items-end gap-6">
                        <div className="w-full">
                          <p className="font-semibold text-[16px] mb-2">
                            Select Fee Type
                          </p>
                          <Select
                            placeholder="Select fee type"
                            options={feeOptions}
                            onChange={(option) => setFeeType(option)}
                            value={feeType}
                            className="w-full"
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                border: "",
                                background: "white",
                                outline: "none",
                                padding: "5px 10px",
                                borderRadius: "10px",
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
                                fontSize: "14px",
                              }),
                              valueContainer: (provided) => ({
                                ...provided,
                                padding: 0,
                              }),
                            }}
                            aria-label="Fee type selector"
                          />
                        </div>
                        <div className="e_currency-eur items-center flex flex-col">
                          <div className="flex items-center">
                            <p>
                              {feeType?.type === "percent"
                                ? ""
                                : getCurrencySymbol(
                                    campaignFormData?.campaign_budget?.currency
                                  )}
                            </p>
                            <input
                              className="text-center outline-none w-[145px]"
                              placeholder={
                                feeType?.type === "percent"
                                  ? "Fee percentage"
                                  : "Fee amount"
                              }
                              value={feeAmount}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*\.?\d*$/.test(value)) {
                                  setFeeAmount(value);
                                }
                              }}
                              aria-label={
                                feeType?.type === "percent"
                                  ? "Fee percentage input"
                                  : "Fee amount input"
                              }
                            />
                            {feeType?.type === "percent" && <span>%</span>}
                          </div>
                          <button
                            className="mt-4 bg-blue-500 text-white px-2 py-1 rounded"
                            onClick={handleAddFee}
                            aria-label="Add fee"
                          >
                            Add fee
                          </button>
                        </div>
                      </div>
                      {fees.length > 0 && (
                        <div className="mt-4 w-[600px]">
                          <p className="font-semibold text-[16px] mb-2">
                            Added Fees:
                          </p>
                          {fees.map((fee, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded mb-2"
                            >
                              <span>{fee.label}</span>
                              <div className="flex items-center">
                                <span>
                                  {getCurrencySymbol(
                                    campaignFormData?.campaign_budget?.currency
                                  )}
                                </span>
                                <span>
                                  {Number.parseFloat(
                                    fee.amount
                                  ).toLocaleString()}
                                </span>
                                {fee.isPercent && (
                                  <span className="ml-2 text-gray-500">
                                    ({fee.percentValue}%)
                                  </span>
                                )}
                                <button
                                  className="ml-4 text-red-500"
                                  onClick={() => {
                                    const updatedFees = fees.filter(
                                      (_, i) => i !== index
                                    );
                                    setFees(updatedFees);
                                    const budgetFees = updatedFees.map(
                                      (fee) => ({
                                        fee_type: fee.type,
                                        value: fee.isPercent
                                          ? fee.percentValue
                                          : fee.amount,
                                        isPercent: fee.isPercent,
                                        percentValue: fee.percentValue,
                                      })
                                    );
                                    setCampaignFormData((prev) => ({
                                      ...prev,
                                      campaign_budget: {
                                        ...prev?.campaign_budget,
                                        budget_fees: budgetFees,
                                      },
                                    }));

                                    updateNetAmount(updatedFees);
                                  }}
                                  aria-label={`Remove ${fee.label} fee`}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex w-[600px] justify-between mt-[24px] items-center">
                      <p className="font-semibold text-[16px]">Gross Amount</p>
                      <div className="flex flex-row items-center gap-[16px] px-0 bg-[#F9FAFB] border-b border-[rgba(6,18,55,0.1)] box-border">
                        <div className="e_currency-eur items-center">
                          <div className="flex items-center">
                            <p>
                              {getCurrencySymbol(
                                campaignFormData?.campaign_budget?.currency
                              )}
                            </p>
                            <input
                              className="text-center outline-none w-[145px]"
                              placeholder="Gross amount"
                              value={
                                isNaN(Number(netAmount)) ||
                                Number(netAmount.toLocaleString()) <= 0
                                  ? ""
                                  : netAmount
                              }
                              readOnly
                              aria-label="Gross amount (read-only)"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg w-[600px] mt-6">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-[16px] font-semibold">
                  Budget Type: {campaignFormData?.campaign_budget?.sub_budget_type} (
                  {campaignFormData?.campaign_budget?.level} Level)
                </h3>
                <button
                  className="text-[14px] text-[#3175FF] font-semibold cursor-pointer"
                  onClick={handleEditClick}
                  aria-label="Edit budget type selection"
                >
                  Edit
                </button>
              </div>
              <p className="text-[14px] mb-2">
                Total Net Amount:{" "}
                <strong>
                  {netAmount} {getCurrencySymbol(selectedOption.value)}
                </strong>
              </p>
              <p className="text-[14px] mb-2">Fees:</p>
              <ul className="list-disc ml-5 text-[14px]">
                {fees.map((fee, index) => (
                  <li key={index}>
                    {fee.label}: {fee.amount} {getCurrencySymbol(selectedOption.value)}
                    {fee.isPercent && ` (${fee.percentValue}%)`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

FeeSelectionStep.propTypes = {
  num1: PropTypes.number.isRequired,
  num2: PropTypes.number.isRequired,
  isValidated: PropTypes.bool.isRequired,
  setIsValidated: PropTypes.func.isRequired,
  netAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  setNetAmount: PropTypes.func.isRequired,
  feeType: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
    type: PropTypes.string,
  }),
  setFeeType: PropTypes.func.isRequired,
  feeAmount: PropTypes.string.isRequired,
  setFeeAmount: PropTypes.func.isRequired,
};

export default FeeSelectionStep;