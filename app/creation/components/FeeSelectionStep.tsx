"use client";

import React, { useEffect, useState } from "react";
import CampaignBudget from "./CampaignBudget";
import PageHeaderWrapper from "components/PageHeaderWapper";
import Image from "next/image";
import Selectstatus from "../../../public/Select-status.svg";
import { getCurrencySymbol } from "components/data";
import { useCampaigns } from "app/utils/CampaignsContext";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";

const feeOptions = [
  { label: "VAT", value: "vat", type: "percent" },
  {
    label: "Media Fee",
    value: "media_fee",
    type: "percent",
  },
  {
    label: "Admin Fee",
    value: "admin_fee",
    type: "percent",
  },
  {
    label: "Trafficking Fee",
    value: "trafficking_fee",
    type: "percent",
  },
  {
    label: "Platform Fee",
    value: "platform_fee",
    type: "percent",
  },
  { label: "Fixed Fee", value: "fixed_fee", type: "fixed" },
];

function FeeSelectionStep() {
  const [active, setActive] = useState(null);
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  const [selectedOption, setSelectedOption] = useState({
    value: "EUR",
    label: "EUR",
  });
  const [selectedFees, setSelectedFess] = useState([]);

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
  const handleBudgetEdit = (param: string, type: string) => {
    setCampaignFormData((prev: any) => ({
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
      // Gross Budget selected
      // Subtract all fees from gross amount
      const totalFees = fees.reduce(
        (total, fee) => total + Number.parseFloat(fee.amount),
        0
      );
      return (grossAmount - totalFees).toFixed(2);
    } else if (active === 2) {
      // Net Budget selected
      // Add all fees to net amount
      const totalFees = fees.reduce(
        (total, fee) => total + Number.parseFloat(fee.amount),
        0
      );
      return (grossAmount + totalFees).toFixed(2);
    }

    return "";
  };

  const handleAddFee = () => {
    if (!feeType || !feeAmount) {
      toast("Fee type and value is required", {
        style: {
          background: "red",
          color: "white",
        },
      });
      return;
    }

    let calculatedAmount = feeAmount;

    // If fee type is percentage, calculate the actual amount based on budget
    if (feeType.type === "percent") {
      const budgetAmount = Number.parseFloat(
        campaignFormData?.campaign_budget?.amount || "0"
      );
      calculatedAmount = (
        (budgetAmount * Number.parseFloat(feeAmount)) /
        100
      ).toFixed(2);
    }

    const totalFees = fees.reduce(
      (total, fee) => total + Number.parseFloat(fee.amount),
      0
    );

    const grossAmount = Number.parseFloat(
      campaignFormData?.campaign_budget?.amount || "0"
    );

    if (
      active === 1 &&
      totalFees + Number.parseFloat(calculatedAmount) > grossAmount
    ) {
      toast("Total fees cannot exceed the gross amount", {
        style: {
          background: "red",
          color: "white",
        },
      });
      return;
    }

    const newFee = {
      type: feeType.value,
      label: feeType.label,
      amount: calculatedAmount,
      isPercent: feeType.type === "percent",
      percentValue: feeType.type === "percent" ? feeAmount : null,
    };

    const updatedFees = [...fees, newFee];
    setFees(updatedFees);

    // Update campaignFormData with the new fee
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

    // Reset fee inputs
    setFeeType(null);
    setFeeAmount("");

    // Recalculate net amount
    setNetAmount(calculateNetAmount());
  };

  useEffect(() => {
    if (campaignFormData) {
      const feesData = campaignFormData?.campaign_budget?.budget_fees?.map(
        (bud: { fee_type: string; value: string }) => ({
          type: bud?.fee_type,
          label: feeOptions?.find((opt) => opt.value === bud?.fee_type)?.label,
          amount: bud?.value,
          isPercent:
            feeOptions?.find((opt) => opt.value === bud?.fee_type)?.type ===
            "percent",
          percentValue:
            feeOptions?.find((opt) => opt.value === bud?.fee_type)?.type ===
            "percent"
              ? bud?.value
              : null,
        })
      );
      console.log("fdjbfd", feesData);
      setFees(feesData);
    }
  }, [campaignFormData]);

  useEffect(() => {
    // Recalculate percentage-based fees when budget amount changes
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

      // Update campaignFormData with the recalculated fees
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

    setNetAmount(calculateNetAmount());
  }, [campaignFormData?.campaign_budget?.amount, active]);

  return (
    <div>
      {/* <Toaster /> */}
      <CampaignBudget />
      <div>
        <PageHeaderWrapper t4="Choose the type of budget you have" span={2} />
        <div className="mt-[24px] flex gap-5">
          {/* Top‑down Option */}
          <div
            className={`relative bg-white rounded-lg border p-4 w-[350px]`}
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

          {/* Bottom‑up Option */}
          <div
            className={`relative  bg-white rounded-lg border p-4 w-[350px]`}
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
              campaignFormData?.campaign_budget?.sub_budget_type === "net") && (
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
          <PageHeaderWrapper t4="Add the applicable fee(s)" span={3} />
        )}
        {active === 1 ? (
          <div className="space-y-8">
            <div className="flex w-[600px] justify-between mt-[24px] items-center">
              <p className="font-semibold text-[16px]">Media Gross Amount</p>
              <div className=" flex flex-row items-center gap-[16px] px-0 bg-[#F9FAFB] border-b border-[rgba(6,18,55,0.1)] box-border">
                <div className="e_currency-eur items-center">
                  <div className="flex items-center">
                    <p>
                      {getCurrencySymbol(
                        campaignFormData?.campaign_budget?.currency
                      )}
                    </p>
                    <input
                      className="text-center outline-none w-[145px]"
                      placeholder="Budget value"
                      value={
                        Number(
                          campaignFormData?.campaign_budget?.amount
                        )?.toLocaleString() || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*\.?\d*$/.test(value)) {
                          handleBudgetEdit("amount", value);
                        }
                      }}
                    />
                  </div>
                  <div className="w-[120px]">
                    <p>{campaignFormData?.campaign_budget?.currency}</p>
                  </div>
                </div>
              </div>
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
                  <div className="w-[120px]">
                    <p>{campaignFormData?.campaign_budget?.currency}</p>
                  </div>
                </div>
              </div>
              <p
                className="mt-[16px] text-[14px] text-[#3175FF] font-semibold cursor-pointer"
                onClick={handleAddFee}
              >
                Add fee
              </p>
              {fees.length > 0 && (
                <div className="mt-4 w-[600px]">
                  <p className="font-semibold text-[16px] mb-2">Added Fees:</p>
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

                            // Update campaignFormData after removing a fee
                            const budgetFees = updatedFees.map((fee) => ({
                              fee_type: fee.type,
                              value: fee.isPercent
                                ? fee.percentValue
                                : fee.amount,
                            }));

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
              <p className="font-semibold text-[16px]">Net Gross Amount</p>
              <div className=" flex flex-row items-center gap-[16px] px-0 bg-[#F9FAFB] border-b border-[rgba(6,18,55,0.1)] box-border">
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
                      value={netAmount}
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
                <p className="font-semibold text-[16px]">Media Net Amount</p>
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
                        placeholder="Budget value"
                        value={
                          Number(
                            campaignFormData?.campaign_budget?.amount
                          )?.toLocaleString() || ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*\.?\d*$/.test(value)) {
                            handleBudgetEdit("amount", value);
                          }
                        }}
                      />
                    </div>
                    <div className="w-[120px]">
                      <p>{campaignFormData?.campaign_budget?.currency}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex w-[600px] justify-between items-end gap-6">
                  <div className="w-full">
                    <p className="font-semibold text-[16px] mb-2">
                      Select Fee Type
                    </p>
                    <Select
                      placeholder="Select fee type"
                      options={[
                        { label: "VAT", value: "vat", type: "percent" },
                        {
                          label: "Media Fee",
                          value: "media_fee",
                          type: "percent",
                        },
                        {
                          label: "Admin Fee",
                          value: "admin_fee",
                          type: "percent",
                        },
                        {
                          label: "Trafficking Fee",
                          value: "trafficking_fee",
                          type: "percent",
                        },
                        {
                          label: "Platform Fee",
                          value: "platform_fee",
                          type: "percent",
                        },
                        {
                          label: "Fixed Fee",
                          value: "fixed_fee",
                          type: "fixed",
                        },
                      ]}
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
                        <p>{campaignFormData?.campaign_budget?.currency}</p>
                      </div>
                    )}
                  </div>
                </div>
                <p
                  className="mt-[16px] text-[15px] text-[#3175FF] font-semibold cursor-pointer"
                  onClick={handleAddFee}
                >
                  Add fee
                </p>
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

                              // Update campaignFormData after removing a fee
                              const budgetFees = updatedFees.map((fee) => ({
                                fee_type: fee.type,
                                value: fee.isPercent
                                  ? fee.percentValue
                                  : fee.amount,
                              }));

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
                        value={netAmount}
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
      </div>
    </div>
  );
}

export default FeeSelectionStep;
