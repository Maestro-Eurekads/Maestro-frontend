"use client"

import React, { useState } from "react"
import CampaignBudget from "./CampaignBudget"
import PageHeaderWrapper from "components/PageHeaderWapper"
import Image from "next/image"
import Selectstatus from "../../../public/Select-status.svg"
import { getCurrencySymbol } from "components/data"
import { useCampaigns } from "app/utils/CampaignsContext"
import Select from "react-select"

function FeeSelectionStep() {
  const [active, setActive] = useState(null)
  const { campaignFormData, setCampaignFormData } = useCampaigns()
  const [selectedOption, setSelectedOption] = useState({
    value: "EUR",
    label: "EUR",
  })
  const [selectedFees, setSelectedFess] = useState([])

  const [fees, setFees] = useState([])
  const [feeType, setFeeType] = useState(null)
  const [feeAmount, setFeeAmount] = useState("")
  const [netAmount, setNetAmount] = useState("")

  const selectCurrency = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "GBP", label: "GBP" },
    { value: "NGN", label: "NGN" },
    { value: "JPY", label: "JPY" },
    { value: "CAD", label: "CAD" },
  ]
  const handleBudgetEdit = (param: string, type: string) => {
    setCampaignFormData((prev) => ({
      ...prev,
      campaign_budget: {
        ...prev?.campaign_budget,
        [param]: type?.toString(),
      },
    }))
  }
  const handleCurrencyChange = (option) => {
    setSelectedOption(option)
  }

  const calculateNetAmount = () => {
    if (!campaignFormData?.campaign_budget?.amount) return ""

    const grossAmount = Number.parseFloat(campaignFormData?.campaign_budget?.amount)

    if (active === 1) {
      // Gross Budget selected
      // Subtract all fees from gross amount
      const totalFees = fees.reduce((total, fee) => total + Number.parseFloat(fee.amount), 0)
      return (grossAmount - totalFees).toFixed(2)
    } else if (active === 2) {
      // Net Budget selected
      // Add all fees to net amount
      const totalFees = fees.reduce((total, fee) => total + Number.parseFloat(fee.amount), 0)
      return (grossAmount + totalFees).toFixed(2)
    }

    return ""
  }

  const handleAddFee = () => {
    if (!feeType || !feeAmount) return

    const newFee = {
      type: feeType.value,
      label: feeType.label,
      amount: feeAmount,
    }

    const updatedFees = [...fees, newFee]
    setFees(updatedFees)

    // Reset fee inputs
    setFeeType(null)
    setFeeAmount("")

    // Recalculate net amount
    setNetAmount(calculateNetAmount())
  }

  React.useEffect(() => {
    setNetAmount(calculateNetAmount())
  }, [fees, campaignFormData?.campaign_budget?.amount, active])

  return (
    <div>
      <CampaignBudget />
      <div>
        <PageHeaderWrapper t4="Choose the type of budget you have" span={2} />
        <div className="mt-[24px] flex gap-5">
          {/* Top‑down Option */}
          <div
            className={`relative bg-white rounded-lg border p-4 w-[350px]`}
            onClick={() => {
              setActive(1)
            }}
          >
            <div className="flex items-start gap-2">
              <div>
                <h3 className="font-semibold whitespace-nowrap text-[15px] leading-[175%] flex items-center text-[#061237]">
                  Gross Media Budget
                </h3>
              </div>
            </div>
            {active === 1 && (
              <div className="absolute right-2 top-2">
                <Image src={Selectstatus || "/placeholder.svg"} alt="Selectstatus" />
              </div>
            )}
          </div>

          {/* Bottom‑up Option */}
          <div
            className={`relative  bg-white rounded-lg border p-4 w-[350px]`}
            onClick={() => {
              setActive(2)
            }}
          >
            <div className="flex items-start gap-2">
              <div>
                <h3 className="font-semibold whitespace-nowrap text-[15px] leading-[175%] flex items-center text-[#061237]">
                  Net Media Budget
                </h3>
              </div>
            </div>
            {active === 2 && (
              <div className="absolute right-2 top-2">
                <Image src={Selectstatus || "/placeholder.svg"} alt="Selectstatus" />
              </div>
            )}
          </div>
        </div>
        {active && <PageHeaderWrapper t4="Add the applicable fee(s)" span={3} />}
        {active === 1 ? (
          <div className="space-y-8">
            <div className="flex w-[600px] justify-between mt-[24px] items-center">
              <p className="font-semibold text-[16px]">Media Gross Amount</p>
              <div className=" flex flex-row items-center gap-[16px] px-0 bg-[#F9FAFB] border-b border-[rgba(6,18,55,0.1)] box-border">
                <div className="e_currency-eur items-center">
                  <div className="flex items-center">
                    <p>{getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}</p>
                    <input
                      className="text-center outline-none w-[145px]"
                      placeholder="Budget value"
                      value={Number(campaignFormData?.campaign_budget?.amount)?.toLocaleString() || ""}
                      onChange={(e) => {
                        const value = e.target.value
                        if (/^\d*\.?\d*$/.test(value)) {
                          handleBudgetEdit("amount", value)
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
                  <p className="font-semibold text-[16px] mb-2">Select Fee Type</p>
                  <Select
                    placeholder="Select fee type"
                    options={[
                      { label: "VAT", value: "vat" },
                      { label: "Media Fee", value: "media_fee" },
                      { label: "Admin Fee", value: "admin_fee" },
                      { label: "Trafficking Fee", value: "trafficking_fee" },
                      { label: "Platform Fee", value: "platform_fee" },
                      { label: "Fixed Fee", value: "fixed_fee" },
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
                    <p>{getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}</p>
                    <input
                      className="text-center outline-none w-[145px]"
                      placeholder="Fee amount"
                      value={feeAmount}
                      onChange={(e) => {
                        const value = e.target.value
                        if (/^\d*\.?\d*$/.test(value)) {
                          setFeeAmount(value)
                        }
                      }}
                    />
                  </div>
                  <div className="w-[120px]">
                    <p>{campaignFormData?.campaign_budget?.currency}</p>
                  </div>
                </div>
              </div>
              <p className="mt-[16px] text-[14px] text-[#3175FF] font-semibold cursor-pointer" onClick={handleAddFee}>
                Add  fee
              </p>
              {fees.length > 0 && (
                <div className="mt-4 w-[600px]">
                  <p className="font-semibold text-[16px] mb-2">Added Fees:</p>
                  {fees.map((fee, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded mb-2">
                      <span>{fee.label}</span>
                      <div className="flex items-center">
                        <span>{getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}</span>
                        <span>{Number.parseFloat(fee.amount).toLocaleString()}</span>
                        <button
                          className="ml-4 text-red-500"
                          onClick={() => {
                            const updatedFees = fees.filter((_, i) => i !== index)
                            setFees(updatedFees)
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
                    <p>{getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}</p>
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
                      <p>{getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}</p>
                      <input
                        className="text-center outline-none w-[145px]"
                        placeholder="Budget value"
                        value={Number(campaignFormData?.campaign_budget?.amount)?.toLocaleString() || ""}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^\d*\.?\d*$/.test(value)) {
                            handleBudgetEdit("amount", value)
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
                    <p className="font-semibold text-[16px] mb-2">Select Fee Type</p>
                    <Select
                      placeholder="Select fee type"
                      options={[
                        { label: "VAT", value: "vat" },
                        { label: "Media Fee", value: "media_fee" },
                        { label: "Admin Fee", value: "admin_fee" },
                        { label: "Trafficking Fee", value: "trafficking_fee" },
                        { label: "Platform Fee", value: "platform_fee" },
                        { label: "Fixed Fee", value: "fixed_fee" },
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
                      <p>{getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}</p>
                      <input
                        className="text-center outline-none w-[145px]"
                        placeholder="Fee amount"
                        value={feeAmount}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^\d*\.?\d*$/.test(value)) {
                            setFeeAmount(value)
                          }
                        }}
                      />
                    </div>
                    <div className="w-[120px]">
                      <p>{campaignFormData?.campaign_budget?.currency}</p>
                    </div>
                  </div>
                </div>
                <p className="mt-[16px] text-[15px] text-[#3175FF] font-semibold cursor-pointer" onClick={handleAddFee}>
                  Add fee
                </p>
                {fees.length > 0 && (
                  <div className="mt-4 w-[600px]">
                    <p className="font-semibold text-[16px] mb-2">Added Fees:</p>
                    {fees.map((fee, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded mb-2">
                        <span>{fee.label}</span>
                        <div className="flex items-center">
                          <span>{getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}</span>
                          <span>{Number.parseFloat(fee.amount).toLocaleString()}</span>
                          <button
                            className="ml-4 text-red-500"
                            onClick={() => {
                              const updatedFees = fees.filter((_, i) => i !== index)
                              setFees(updatedFees)
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
                      <p>{getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}</p>
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
  )
}

export default FeeSelectionStep
