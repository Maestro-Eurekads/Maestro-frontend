"use client";

import React, { useEffect, useState } from "react";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import Topdown from "../../../public/Top-down.svg";
import backdown from "../../../public/back-down.svg";
import Selectstatus from "../../../public/Select-status.svg";
import Image from "next/image";
import Select from "react-select";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useComments } from "app/utils/CommentProvider";
import { useEditing } from "app/utils/EditingContext";
import { formatNumberWithCommas } from "components/data";
import FeeSelectionStep from "./FeeSelectionStep";
import { SVGLoader } from "components/SVGLoader";
import BudgetInput from "./BudgetInput";
import adset from "../../../public/adset_level.svg";
import channel from "../../../public/channel_level.svg";
import toast from "react-hot-toast";
import ConfigureAdSetsAndBudget from "./ ConfigureadSetsAndbudget";

const CampaignBudget = () => {
  const [budgetStyle, setBudgetStyle] = useState("");
  const [step, setStep] = useState(0);
  const { setIsDrawerOpen, setClose } = useComments();
  const { isEditing, setIsEditing } = useEditing();
  const [loading, setLoading] = useState(false);
  const [netAmount, setNetAmount] = useState("");
  const [feeStepValidated, setFeeStepValidated] = useState(false);
  const [showLevelCards, setShowLevelCards] = useState(true);

  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
    setIsEditing(true);
  }, []);

  const [selectedOption, setSelectedOption] = useState({
    value: "EUR",
    label: "EUR",
  });

  const [feeType, setFeeType] = useState(null);
  const [feeAmount, setFeeAmount] = useState("");

  const { campaignFormData, setCampaignFormData, campaignData } = useCampaigns();

  

  const selectCurrency = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "GBP", label: "GBP" },
    { value: "NGN", label: "NGN" },
    { value: "JPY", label: "JPY" },
    { value: "CAD", label: "CAD" },
  ];

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

  const handleBudgetEdit = (param, type) => {
    if (!isEditing) return;
    setCampaignFormData((prev) => ({
      ...prev,
      campaign_budget: {
        ...prev?.campaign_budget,
        [param]: type?.toString(),
      },
    }));
    if (param === "budget_type") {
      setStep(1);
      setBudgetStyle(type);
      setFeeStepValidated(false);
      setShowLevelCards(true);
    }
  };

  const handleValidate = () => {
    if (!campaignFormData?.campaign_budget?.amount) {
      toast("Please set the overall campaign budget first", {
        style: { background: "red", color: "white" },
      });
      return false;
    }
    if (campaignFormData?.campaign_budget?.budget_fees?.length > 0 || (!feeType && !feeAmount)) {
      setFeeStepValidated(true);
      setStep(budgetStyle === "top_down" ? 2 : 3);
      return true;
    }
    if (feeType && !feeAmount) {
      toast("Please enter the fee amount", {
        style: { background: "red", color: "white" },
      });
      return false;
    }
    if (!feeType && feeAmount) {
      toast("Please select a fee type", {
        style: { background: "red", color: "white" },
      });
      return false;
    }
    setFeeStepValidated(true);
    setStep(budgetStyle === "top_down" ? 2 : 3);
    return true;
  };

  const handleEdit = () => {
    setFeeStepValidated(false);
    setStep(1);
    setFeeType(null);
    setFeeAmount("");
    setShowLevelCards(true);
  };

  useEffect(() => {
    if (campaignData?.campaign_budget) {
      setBudgetStyle(campaignData?.campaign_budget?.budget_type);
      setStep(0);
      if (campaignData?.campaign_budget?.sub_budget_type?.length > 0) {
        setStep(1);
      }
      if (campaignData?.campaign_budget?.budget_fees?.length > 0) {
        setFeeStepValidated(true);
        setStep(2);
      }
      if (campaignData?.campaign_budget?.level) {
        setStep(3);
        setShowLevelCards(false);
      }
    }
  }, [campaignData]);

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
          className={`relative cursor-pointer ${budgetStyle === "top_down"
            ? "top_and_bottom_down_container_active"
            : "top_and_bottom_down_container"
            }`}
          onClick={() => {
            handleBudgetEdit("budget_type", "top_down");
            setCampaignFormData((prev) => ({
              ...prev,
              campaign_budget: {
                ...prev.campaign_budget,
                level: "",
              },
            }));
          }}
        >
          <div className="flex items-start gap-2">
            {budgetStyle !== "top_down" ? (
              <Image
                src={backdown}
                alt="backdown"
                className="rotate-180 transform"
              />
            ) : (
              <Image
                src={Topdown}
                alt="Topdown"
                className={
                  budgetStyle === "top_down" ? "rotate-30 transform" : ""
                }
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
          {budgetStyle === "top_down" && (
            <div className="absolute right-2 top-2">
              <Image src={Selectstatus} alt="Selectstatus" />
            </div>
          )}
        </div>

        {/* Bottom‑up Option */}
        <div
          className={`relative cursor-pointer ${budgetStyle === "bottom_up"
            ? "top_and_bottom_down_container_active"
            : "top_and_bottom_down_container"
            }`}
          onClick={() => {
            handleBudgetEdit("budget_type", "bottom_up");
            setCampaignFormData((prev) => ({
              ...prev,
              campaign_budget: {
                ...prev.campaign_budget,
                level: "",
              },
            }));
          }}
        >
          <div className="flex items-start gap-2">
            {budgetStyle === "bottom_up" ? (
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
          {budgetStyle === "bottom_up" && (
            <div className="absolute right-2 top-2">
              <Image src={Selectstatus} alt="Selectstatus" />
            </div>
          )}
        </div>
      </div>

      {budgetStyle !== "" && budgetStyle === "top_down" && step > 0 && (
        <>
          <FeeSelectionStep
            num1={2}
            num2={3}
            isValidated={feeStepValidated}
            setIsValidated={setFeeStepValidated}
            netAmount={netAmount}
            setNetAmount={setNetAmount}
            feeType={feeType}
            setFeeType={setFeeType}
            feeAmount={feeAmount}
            setFeeAmount={setFeeAmount}
          />
          {campaignFormData?.campaign_budget?.sub_budget_type && (
            <div className="flex justify-end mt-[20px]">
              <button
                onClick={() => {
                  if (feeStepValidated) {
                    handleEdit();
                  } else if (handleValidate()) {
                    setFeeStepValidated(true);
                  }
                }}
                className={`flex items-center justify-center px-10 py-4 gap-2 w-[142px] h-[52px] rounded-lg text-white font-semibold text-[16px] leading-[22px] ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#3175FF] hover:bg-[#2563eb]"
                  }`}
                disabled={loading}
              >
                {loading ? (
                  <SVGLoader width={"24px"} height={"24px"} color={"#fff"} />
                ) : feeStepValidated ? (
                  "Edit"
                ) : (
                  "Validate"
                )}
              </button>
            </div>
          )}
        </>
      )}
      {budgetStyle !== "" && budgetStyle === "top_down" && step > 1 && (
        <>
          <PageHeaderWrapper
            t4="Choose granularity level"
            span={feeStepValidated ? 3 : 4}
          />
          {showLevelCards ? (
            <div className="flex flex-col gap-3 w-[672px] bg-white p-6 rounded-[20px] mt-[20px]">
              <form method="dialog" className="flex justify-center p-2 !pb-0">
                <span></span>
                <span className="w-[44px] h-[44px] grid place-items-center">
                  <svg
                    width="45"
                    height="44"
                    viewBox="0 0 45 44"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.71"
                      y="0"
                      width="44"
                      height="44"
                      rx="22"
                      fill="#E8F6FF"
                    />
                    <mask
                      id="mask0"
                      style={{ maskType: "luminance" }}
                      maskUnits="userSpaceOnUse"
                      x="13"
                      y="14"
                      width="19"
                      height="16"
                    >
                      <path
                        d="M17.7044 25.7497H14.3711V14.9164H31.0378V25.7497H27.7044H17.7044Z"
                        fill="white"
                        stroke="white"
                        strokeWidth="1.667"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19.3711 21.1664V22.833"
                        stroke="black"
                        strokeWidth="1.667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22.7031 25.7497V28.2497"
                        stroke="white"
                        strokeWidth="1.667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22.7031 19.4997V22.8331M26.0365 17.8331V22.8331"
                        stroke="black"
                        strokeWidth="1.667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17.7031 29.0831H27.7031"
                        stroke="white"
                        strokeWidth="1.667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </mask>
                    <g mask="url(#mask0)">
                      <rect
                        x="12.71"
                        y="12"
                        width="20"
                        height="20"
                        fill="#3175FF"
                      />
                    </g>
                  </svg>
                </span>
              </form>

              <div className="flex flex-col justify-center w-full">
                <h1 className=" font-general font-semibold text-[20px] leading-[27px] text-gray-900 text-center">
                  Choose your goal level
                </h1>
                <p className="  font-general font-medium text-[16px] leading-[150%] text-gray-600 text-center">
                  Define how you want to set your benchmarks and goals for your
                  media plan.
                </p>
              </div>
              <section className="flex gap-6 mt-[20px]">
                {[
                  {
                    img: channel,
                    alt: "Channel Level",
                    label: "Channel level",
                    description: `Input benchmarks and goals for each channel only. 
                  The highest level of granularity focuses on channels across all phases.`,
                  },
                  {
                    img: adset,
                    alt: "Ad Set Level",
                    label: "Adset level",
                    description: `Input benchmarks and goals for individual ad sets within each channel.
                   This focuses on specific ad sets in each phase and channel.`,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="card bg-base-100 shadow p-2 rounded-[16px]"
                  >
                    <div className="card-title relative w-full h-[135px]">
                      <figure className="relative w-full h-full rounded-[8px]">
                        <Image src={item.img} fill alt={item.alt} />
                      </figure>
                    </div>

                    <div className="">
                      <div className="p-2 text-center">
                        <h2 className="text-[16px] mb-4 text-[#181D27] font-[600]">
                          {item?.label}
                        </h2>
                        <p className="text-[14px] font-[500] text-[#535862]">
                          {item?.description}
                        </p>
                      </div>

                      <div className="">
                        <button
                          className="btn btn-primary w-full text-sm bg-[#3175FF]"
                          onClick={() => {
                            setStep(3);
                            setShowLevelCards(false);
                            setCampaignFormData((prev) => ({
                              ...prev,
                              campaign_budget: {
                                ...prev.campaign_budget,
                                level: item.label,
                              },
                            }));
                          }}
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          ) : (
            <div className="flex flex-col gap-3 w-[672px] bg-white p-6 rounded-[20px] mt-[20px]">
              <div className="flex justify-between items-center">
                <p className="text-[16px] font-semibold">
                  Selected Level: {campaignFormData?.campaign_budget?.level}
                </p>
                <button
                  className="btn btn-primary text-sm bg-[#3175FF]"
                  onClick={() => setShowLevelCards(true)}
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {budgetStyle !== "" && budgetStyle === "top_down" && step > 2 && (
        <>
          <ConfigureAdSetsAndBudget num={4} netAmount={netAmount} />
        </>
      )}
      {budgetStyle !== "" && budgetStyle === "bottom_up" && step > 0 && (
        <>
          <PageHeaderWrapper t4="Choose granularity level" span={2} />
          {showLevelCards ? (
            <div className="flex flex-col gap-3 w-[672px] bg-white p-6 rounded-[20px] mt-[20px]">
              <form method="dialog" className="flex justify-center p-2 !pb-0">
                <span></span>
                <span className="w-[44px] h-[44px] grid place-items-center">
                  <svg
                    width="45"
                    height="44"
                    viewBox="0 0 45 44"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.71"
                      y="0"
                      width="44"
                      height="44"
                      rx="22"
                      fill="#E8F6FF"
                    />
                    <mask
                      id="mask0"
                      style={{ maskType: "luminance" }}
                      maskUnits="userSpaceOnUse"
                      x="13"
                      y="14"
                      width="19"
                      height="16"
                    >
                      <path
                        d="M17.7044 25.7497H14.3711V14.9164H31.0378V25.7497H27.7044H17.7044Z"
                        fill="white"
                        stroke="white"
                        strokeWidth="1.667"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19.3711 21.1664V22.833"
                        stroke="black"
                        strokeWidth="1.667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22.7031 25.7497V28.2497"
                        stroke="white"
                        strokeWidth="1.667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22.7031 19.4997V22.8331M26.0365 17.8331V22.8331"
                        stroke="black"
                        strokeWidth="1.667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17.7031 29.0831H27.7031"
                        stroke="white"
                        strokeWidth="1.667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </mask>
                    <g mask="url(#mask0)">
                      <rect
                        x="12.71"
                        y="12"
                        width="20"
                        height="20"
                        fill="#3175FF"
                      />
                    </g>
                  </svg>
                </span>
              </form>

              <div className="flex flex-col justify-center w-full">
                <h1 className=" font-general font-semibold text-[20px] leading-[27px] text-gray-900 text-center">
                  Choose your goal level
                </h1>
                <p className="  font-general font-medium text-[16px] leading-[150%] text-gray-600 text-center">
                  Define how you want to set your benchmarks and goals for your
                  media plan.
                </p>
              </div>
              <section className="flex gap-6 mt-[20px]">
                {[
                  {
                    img: channel,
                    alt: "Channel Level",
                    label: "Channel level",
                    description: `Input benchmarks and goals for each channel only. 
                  The highest level of granularity focuses on channels across all phases.`,
                  },
                  {
                    img: adset,
                    alt: "Ad Set Level",
                    label: "Adset level",
                    description: `Input benchmarks and goals for individual ad sets within each channel.
                   This focuses on specific ad sets in each phase and channel.`,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="card bg-base-100 shadow p-2 rounded-[16px]"
                  >
                    <div className="card-title relative w-full h-[135px]">
                      <figure className="relative w-full h-full rounded-[8px]">
                        <Image src={item.img} fill alt={item.alt} />
                      </figure>
                    </div>

                    <div className="">
                      <div className="p-2 text-center">
                        <h2 className="text-[16px] mb-4 text-[#181D27] font-[600]">
                          {item.label}
                        </h2>
                        <p className="text-[14px] font-[500] text-[#535862]">
                          {item.description}
                        </p>
                      </div>

                      <div className="">
                        <button
                          className="btn btn-primary w-full text-sm bg-[#3175FF]"
                          onClick={() => {
                            setStep(2);
                            setShowLevelCards(false);
                            setCampaignFormData((prev) => ({
                              ...prev,
                              campaign_budget: {
                                ...prev.campaign_budget,
                                level: item.label,
                              },
                            }));
                          }}
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          ) : (
            <div className="flex flex-col gap-3 w-[672px] bg-white p-6 rounded-[20px] mt-[20px]">
              <div className="flex justify-between items-center">
                <p className="text-[16px] font-semibold">
                  Selected Level: {campaignFormData?.campaign_budget?.level}
                </p>
                <button
                  className="btn btn-primary text-sm bg-[#3175FF]"
                  onClick={() => setShowLevelCards(true)}
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {budgetStyle !== "" && budgetStyle === "bottom_up" && step > 1 && (
        <>
          <ConfigureAdSetsAndBudget num={3} netAmount={netAmount} />
          <FeeSelectionStep
            num1={4}
            num2={5}
            isValidated={feeStepValidated}
            setIsValidated={setFeeStepValidated}
            netAmount={netAmount}
            setNetAmount={setNetAmount}
            feeType={feeType}
            setFeeType={setFeeType}
            feeAmount={feeAmount}
            setFeeAmount={setFeeAmount}
          />
        </>
      )}
    </div>
  );
};

export default CampaignBudget;