"use client";

import React, { useEffect, useState } from "react";
import CampaignBudget from "./CampaignBudget";
import Image from "next/image";
import Selectstatus from "../../../public/Select-status.svg";
import { formatNumberWithCommas, getCurrencySymbol } from "components/data";
import { useCampaigns } from "app/utils/CampaignsContext";
import Select from "react-select";
import toast from "react-hot-toast";
import PageHeaderWrapper from "components/PageHeaderWapper";
import BudgetInput from "./BudgetInput";

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
}: {
  num1: number;
  num2: number;
  isValidated?: boolean;
}) {
  const [active, setActive] = useState(null);
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  const [selectedOption, setSelectedOption] = useState({
    value: "EUR",
    label: "EUR",
  });
  const [selectedFees, setSelectedFees] = useState([]);
  const [fees, setFees] = useState([]);
  const [feeType, setFeeType] = useState(null);
  const [feeAmount, setFeeAmount] = useState("");
  const [netAmount, setNetAmount] = useState("");

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

    if (active === 1) {
      const totalFees = fees.reduce(
        (total, fee) => total + Number.parseFloat(fee.amount),
        0
      );
      return (grossAmount - totalFees).toFixed(2);
    } else if (active === 2) {
      const totalFees = fees.reduce(
        (total, fee) => total + Number.parseFloat(fee.amount),
        0
      );
      return (grossAmount + totalFees).toFixed(2);
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

    const net =
      active === 1
        ? (budgetAmount - totalFees).toFixed(2)
        : (budgetAmount + totalFees).toFixed(2);

    setNetAmount(net);
  };

  const handleAddFee = () => {
    if (!feeType || !feeAmount) {
      toast("Fee type and value is required", {
        style: { background: "red", color: "white" },
      });
      return;
    }

    const budgetAmount = parseFloat(
      campaignFormData?.campaign_budget?.amount || "0"
    );
    console.log("🚀 ~ handleAddFee ~ budgetAmount:", budgetAmount);
    const feeValue = parseFloat(feeAmount);

    if (feeType.type === "percent" && feeValue > 100) {
      toast("Percentage cannot exceed 100", {
        style: { background: "red", color: "white" },
      });
      return;
    }

    let calculatedAmount =
      feeType.type === "percent" ? (budgetAmount * feeValue) / 100 : feeValue;

    // Prevent duplicate fee types
    const duplicate = fees.find((fee) => fee.type === feeType.value);
    if (duplicate) {
      toast(`${feeType.label} has already been added.`, {
        style: { background: "orange", color: "white" },
      });
      return;
    }

    // Check if total fees exceed budget in gross mode
    const newTotalFees =
      fees.reduce((total, fee) => total + parseFloat(fee.amount), 0) +
      calculatedAmount;

    if (active === 1 && newTotalFees > budgetAmount) {
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
    console.log("🚀 ~ handleAddFee ~ newFee:", newFee);

    const updatedFees = [...fees, newFee];
    setFees(updatedFees);

    const budgetFees = updatedFees.map((fee) => ({
      fee_type: fee.type,
      value: fee.amount,
      isPercent: fee.isPercent,
      percentValue: fee.percentValue,
    }));
    console.log("🚀 ~ budgetFees ~ budgetFees:", budgetFees);

    setCampaignFormData((prev) => ({
      ...prev,
      campaign_budget: {
        ...prev?.campaign_budget,
        budget_fees: budgetFees,
      },
    }));

    // Recalculate net amount correctly with updated fees
    const net =
      active === 1
        ? (budgetAmount - newTotalFees).toFixed(2)
        : (budgetAmount + newTotalFees).toFixed(2);

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
        value: fee.isPercent ? fee.percentValue : fee.amount,
      }));

      setCampaignFormData((prev) => ({
        ...prev,
        campaign_budget: {
          ...prev?.campaign_budget,
          budget_fees: budgetFees,
        },
      }));
    }

    updateNetAmount(fees);
  }, [campaignFormData?.campaign_budget?.amount, active]);

  const calculateRemainingBudget = () => {
    const totalBudget =
      Number(netAmount) > 0
        ? parseInt(netAmount)
        : parseInt(campaignFormData?.campaign_budget?.fixed_value);
    const subBudgets =
      campaignFormData?.channel_mix?.reduce((acc, stage) => {
        return acc + (Number(stage?.stage_budget?.fixed_value) || 0);
      }, 0) || 0;
    return totalBudget - subBudgets;
  };

  return (
    <>
      <div>
        <div>
          <PageHeaderWrapper
            t4="Choose the type of budget you have"
            span={num1}
          />
          {!isValidated ? (
            <>
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
                      },
                    }));
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div>
                      <h3 className="font-semibold whitespace-nowrap text-[15px] leading-[175%] flex items-center text-[#061237]">
                        Gross Media Budget
                      </h3>
                    </div>
                  </div>
                  {(active === 1 ||
                    campaignFormData?.campaign_budget?.sub_budget_type ===
                      "gross") && (
                    <div className="absolute right-2 top-2">
                      <Image
                        src={Selectstatus || "/placeholder.svg"}
                        alt="Selectstatus"
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
                      },
                    }));
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div>
                      <h3 className="font-semibold whitespace-nowrap text-[15px] leading-[175%] flex items-center text-[#061237]">
                        Net Media Budget
                      </h3>
                    </div>
                  </div>
                  {(active === 2 ||
                    campaignFormData?.campaign_budget?.sub_budget_type ===
                      "net") && (
                    <div className="absolute right-2 top-2">
                      <Image
                        src={Selectstatus || "/placeholder.svg"}
                        alt="Selectstatus"
                      />
                    </div>
                  )}
                </div>
              </div>
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
                        />
                      </div>
                      <div className="e_currency-eur items-center">
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
                          />
                          {feeType?.type === "percent" && <span>%</span>}
                        </div>
                        {feeType?.type !== "percent" && (
                          <div className="w-fit">
                            <p>{campaignFormData?.campaign_budget?.currency}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      className="mt-[16px] inline-block text-[14px] text-[#3175FF] font-semibold cursor-pointer"
                      onClick={handleAddFee}
                    >
                      Add fee
                    </span>
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

                                  // Recalculate netAmount after fee removal
                                  const budgetAmount = parseFloat(
                                    campaignFormData?.campaign_budget?.amount ||
                                      "0"
                                  );
                                  const totalFees = updatedFees.reduce(
                                    (total, fee) =>
                                      total + parseFloat(fee.amount),
                                    0
                                  );
                                  const newNetAmount =
                                    active === 1
                                      ? (budgetAmount - totalFees).toFixed(2)
                                      : (budgetAmount + totalFees).toFixed(2);

                                  updateNetAmount(updatedFees);
                                }}
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
                          />
                        </div>
                        <div className="w-[120px]">
                          <p>{campaignFormData?.campaign_budget?.currency}</p>
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
                          />
                        </div>
                        <div className="e_currency-eur items-center">
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
                            />
                            {feeType?.type === "percent" && <span>%</span>}
                          </div>
                          {feeType?.type !== "percent" && (
                            <div className="w-[120px]">
                              <p>
                                {campaignFormData?.campaign_budget?.currency}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <span
                        className="mt-[16px] inline-block text-[15px] text-[#3175FF] font-semibold cursor-pointer"
                        onClick={handleAddFee}
                      >
                        Add fee
                      </span>
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
                                      })
                                    );
                                    setCampaignFormData((prev) => ({
                                      ...prev,
                                      campaign_budget: {
                                        ...prev?.campaign_budget,
                                        budget_fees: budgetFees,
                                      },
                                    }));
                                  }}
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
                            />
                          </div>
                          <div className="w-[120px]">
                            <p>{campaignFormData?.campaign_budget?.currency}</p>
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
              <h3 className="text-[16px] font-semibold mb-2">Fee Summary</h3>
              <p className="text-[14px] mb-2">
                Budget Type:{" "}
                <strong>
                  {campaignFormData?.campaign_budget?.sub_budget_type}
                </strong>
              </p>
              <p className="text-[14px] mb-2">
                Total Net Amount:{" "}
                <strong>
                  {netAmount} {selectedOption.value}
                </strong>
              </p>
              <p className="text-[14px] mb-2">Fees:</p>
              <ul className="list-disc ml-5 text-[14px]">
                {fees.map((fee, index) => (
                  <li key={index}>
                    {fee.label}: {fee.amount} {selectedOption.value}
                    {fee.isPercent && ` (${fee.percentValue}%)`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {campaignFormData?.campaign_budget?.sub_budget_type && (
          <div className="flex flex-row items-center gap-[16px] px-0 bg-[#F9FAFB] border-[rgba(6,18,55,0.1)] box-border mt-[40px] w-full">
            <div className="e_currency-eur items-center justify-between w-[200px]">
              <div className="flex items-center gap-4">
                <p>{getCurrencySymbol(selectedOption.value)}</p>
                <p>
                  {Number(netAmount) > 0
                    ? netAmount
                    : isNaN(
                        parseInt(campaignFormData?.campaign_budget?.fixed_value)
                      )
                    ? ""
                    : parseInt(
                        campaignFormData?.campaign_budget?.fixed_value
                      ).toLocaleString()}
                </p>
              </div>
              <div className="mx-[20px]">
                <p>{selectedOption?.value}</p>
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
                {Number(netAmount) > 0
                  ? netAmount
                  : isNaN(
                      parseInt(campaignFormData?.campaign_budget?.fixed_value)
                    )
                  ? ""
                  : formatNumberWithCommas(
                      Number(
                        campaignFormData?.campaign_budget?.fixed_value
                      ).toLocaleString()
                    )}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default FeeSelectionStep;
