"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import closefill from "../../../public/close-fill.svg";
import blueprofile from "../../../public/blueprofile.svg";
import blueBtn from "../../../public/blueBtn.svg";
import { MdOutlineCancel } from "react-icons/md";
import { CustomSelect } from "./CustomReactSelect";
import { Trash2 } from "lucide-react";
import { useAppSelector } from "store/useStore";
import { FiLoader } from "react-icons/fi";
import useCampaignHook from "app/utils/useCampaignHook";
import { set } from "date-fns";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const AddFinanceModal = ({ isOpen, setIsOpen }) => {
  const [mediaPlans, setMediaPlans] = useState([]);
  const { fetchClientCampaign, fetchUserByType } = useCampaignHook();
  const [selected, setSelected] = useState("");
  const [selectedPlanBudget, setSelectedPlanBudget] = useState({});
  const [poForm, setPoForm] = useState({
    client: "",
    client_responsible: "",
    financial_responsible: "",
    PO_number: 0,
    PO_currency: "",
    PO_total_amount: 0,
  });
  const [clientCampigns, setClientCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingCam, setLoadingCam] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { getCreateClientData, getCreateClientIsLoading } = useAppSelector(
    (state) => state.client
  );
  const clients: any = getCreateClientData;

  const removeMP = (index) => {
    setMediaPlans((prev) => {
      const filtered = prev?.filter((_, ind) => ind !== index);
      return filtered;
    });
  };

  const selectCurrency = [
    { value: "USD", label: "US Dollar (USD)", sign: "$" },
    { value: "EUR", label: "Euro (EUR)", sign: "€" },
    { value: "GBP", label: "British Pound (GBP)", sign: "£" },
    { value: "NGN", label: "Nigerian Naira (NGN)", sign: "₦" },
    { value: "JPY", label: "Japanese Yen (JPY)", sign: "¥" },
    { value: "CAD", label: "Canadian Dollar (CAD)", sign: "C$" },
  ];

  const handleClose = () => {
    setPoForm({
      client: "",
      client_responsible: "",
      financial_responsible: "",
      PO_number: 0,
      PO_currency: "",
      PO_total_amount: 0,
    });
    setSelected("");
    setIsOpen(false);
    setClientCampaigns([]);
    setMediaPlans([]);
  };

  useEffect(() => {
    if (selected) {
      setLoadingCam(true);
      fetchClientCampaign(selected)
        .then((res) => {
          const data = res?.data?.data;
          const newOption = data?.map((opt) => ({
            label: opt?.media_plan_details?.plan_name,
            value: opt?.id,
            budget: opt?.campaign_budget?.amount,
          }));
          // console.log(newOption)
          setClientCampaigns(newOption);
        })
        .catch((err) => console.log(err))
        .finally(() => {
          setLoadingCam(false);
        });
    }
  }, [selected]);

  useEffect(() => {
    const fetchAgencyUsers = async () => {
      setLoadingUser(true);
      await fetchUserByType(
        "?filters[$or][0][user_type][$eq]=agency_approver&filters[$or][1][user_type][$eq]=agency_creator"
      )
        .then((res) => {
          const d = res?.data;
          // console.log("🚀 ~ .then ~ d:", d);
          const newOpt = d?.map((opt) => ({
            label: opt?.username,
            value: opt?.id,
          }));
          setUsers(newOpt);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoadingUser(false);
        });
    };
    fetchAgencyUsers();
  }, []);

  const addPOToDB = async () => {
    setUploading(true);
    await axios
      .post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/purchase-orders`, {
        data: {
          ...poForm,
          assigned_media_plans: mediaPlans?.map((mp) => ({
            campaign: mp?.name,
            amount: Number(mp?.amount),
            amount_type: mp?.type,
          })),
        },
      }, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`
        }
      })
      .then((res) => {
        handleClose();
      })
      .catch((err) => {
        console.log("err", err);
      })
      .finally(() => {
        setUploading(false);
      });
  };

  return (
    <div className="z-50">
      <Toaster/>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col w-[700px] bg-white rounded-[32px] max-h-[90vh]">
            <div className="w-full flex justify-end px-5 pt-5"></div>

            <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-[32px]">
              <div className="flex items-center gap-5">
                <div className="madel_profile">
                  <Image src={blueprofile} alt="menu" />
                </div>
                <div className="madel_profile_text_container">
                  <h3>Add purchase order</h3>
                </div>
              </div>
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={handleClose}
              >
                <Image src={closefill} alt="menu" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex items-start gap-3 w-full">
                <div className="w-1/2">
                  <label htmlFor="" className="block mb-2">
                    Client Name
                  </label>
                  {getCreateClientIsLoading === true ? (
                    <div className="flex items-center gap-2">
                      <FiLoader className="animate-spin" />
                      <p>Loading clients...</p>
                    </div>
                  ) : (
                    clients?.data && (
                      <>
                        <CustomSelect
                          options={clients?.data?.map((c) => ({
                            label: c?.client_name,
                            value: c?.id,
                          }))}
                          className="min-w-[150px] z-[20]"
                          placeholder="Select client"
                          onChange={(
                            value: { label: string; value: string } | null
                          ) => {
                            if (value) {
                              setSelected(value.value);
                              setPoForm((prev) => ({
                                ...prev,
                                client: value.value,
                              }));
                            }
                          }}
                        />
                      </>
                    )
                  )}
                </div>
                <div className="w-1/2">
                  <label htmlFor="">Client Responsible</label>
                  {loadingUser ? (
                    <div className="shrink-0 flex items-center gap-2">
                      <FiLoader className="animate-spin" />
                      <p>Loading users...</p>
                    </div>
                  ) : (
                    <CustomSelect
                      className="mt-2"
                      placeholder="Select responsible"
                      options={users}
                      onChange={(
                        value: { label: string; value: string } | null
                      ) => {
                        if (value) {
                          setPoForm((prev) => ({
                            ...prev,
                            client_responsible: value.value,
                          }));
                        }
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="w-1/2 mt-3">
                <label htmlFor="">Financial Responsible</label>
                {loadingUser ? (
                  <div className="shrink-0 flex items-center gap-2">
                    <FiLoader className="animate-spin" />
                    <p>Loading users...</p>
                  </div>
                ) : (
                  <CustomSelect
                    className="mt-2"
                    placeholder="Select responsible"
                    options={users}
                    onChange={(
                      value: { label: string; value: string } | null
                    ) => {
                      if (value) {
                        setPoForm((prev) => ({
                          ...prev,
                          financial_responsible: value.value,
                        }));
                      }
                    }}
                  />
                )}
              </div>
              <div className="flex items-start gap-3 w-full mt-3">
                <div className="w-1/2">
                  <label htmlFor="">PO Number</label>
                  <input
                    type="text"
                    placeholder="PO Number"
                    className="w-full border rounded-md p-[6px] mt-2 outline-none"
                    value={poForm.PO_number || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setPoForm((prev) => ({
                        ...prev,
                        PO_number: Number(value),
                      }));
                    }}
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="">PO Currency</label>
                  <CustomSelect
                    className="mt-2"
                    placeholder="Select currency"
                    options={selectCurrency}
                    onChange={(
                      value: { label: string; value: string } | null
                    ) => {
                      if (value) {
                        setPoForm((prev) => ({
                          ...prev,
                          PO_currency: value.value,
                        }));
                      }
                    }}
                  />
                </div>
              </div>
              <div className="w-1/2 mt-3">
                <label htmlFor="">PO Total Amount</label>
                <input
                  type="text"
                  placeholder="PO Total Amount"
                  className="w-full border rounded-md p-[6px] mt-2 outline-none"
                  value={poForm.PO_total_amount > 0 && poForm.PO_total_amount?.toLocaleString() || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setPoForm((prev) => ({
                      ...prev,
                      PO_total_amount: Number(value),
                    }));
                  }}
                  // readOnly={}
                />
              </div>
              <div>
                <p className="font-semibold my-3">Assigned Media Plan</p>

                {mediaPlans?.length > 0 && (
                  <>
                    {/* <p className="mb-[20px] font-semibold">
                      Media Plans Linked
                    </p> */}
                    <div className="space-y-3">
                      {mediaPlans.map((plan, index) => {
                        console.log("plan", plan);
                        return (
                          <div key={index} className="">
                            {loadingCam ? (
                              <div className="shrink-0 flex items-center gap-2">
                                <FiLoader className="animate-spin" />
                                <p>Loading client plans...</p>
                              </div>
                            ) : (
                              <>
                                <div className="flex gap-3 items-center">
                                  <CustomSelect
                                    placeholder="Select media plan"
                                    className="rounded-3xl"
                                    options={clientCampigns}
                                    onChange={(
                                      value: {
                                        label: string;
                                        value: string;
                                        budget: string;
                                      } | null
                                    ) => {
                                      if (value) {
                                        // setSelectedPlan(value.value);
                                        setSelectedPlanBudget((prev) => ({
                                          ...prev,
                                          [value.value]: value.budget,
                                        }));

                                        setMediaPlans((prev) => {
                                          const newPlans = [...prev];
                                          newPlans[index] = {
                                            ...newPlans[index],
                                            name: value.value,
                                          };

                                          if (
                                            plan?.type &&
                                            plan?.type === "total_po_amount"
                                          ) {
                                            newPlans[index].type = plan.type;
                                          }

                                          return newPlans;
                                        });
                                      }
                                    }}
                                  />
                                  <CustomSelect
                                    placeholder="Select amount"
                                    className="rounded-3xl"
                                    options={[
                                      {
                                        label: "Total PO amount",
                                        value: "total_po_amount",
                                      },
                                      {
                                        label: "Fixed amount",
                                        value: "fixed_amount",
                                      },
                                      {
                                        label: "Percentage of PO total amount",
                                        value: "total_po_amount_percent",
                                      },
                                    ]}
                                    onChange={(
                                      value: {
                                        label: string;
                                        value: string;
                                      } | null
                                    ) => {
                                      if (value) {
                                        // setSelectedType(value.value);
                                        if (
                                          value?.value === "total_po_amount"
                                        ) {
                                          setMediaPlans((prev) => {
                                            const newPlans = [...prev];
                                            newPlans[index].amount =
                                              selectedPlanBudget[
                                                Number(newPlans[index].name)
                                              ];
                                            newPlans[index].type = value.value;
                                            return newPlans;
                                          });
                                        } else {
                                          setMediaPlans((prev) => {
                                            const newPlans = [...prev];
                                            newPlans[index].amount = "";
                                            newPlans[index].budget =
                                              selectedPlanBudget[
                                                Number(newPlans[index].name)
                                              ];
                                            newPlans[index].type = value.value;
                                            return newPlans;
                                          });
                                        }
                                      }
                                    }}
                                  />
                                  <div className="relative shrink-0">
                                    <input
                                      type="text"
                                      placeholder={
                                        plan?.type === "total_po_amount_percent"
                                          ? "Enter percentage"
                                          : "Enter amount"
                                      }
                                      className="w-full border rounded-md p-[6px] outline-none"
                                      value={plan?.amount || ""}
                                      disabled={
                                        plan?.type === "total_po_amount"
                                          ? true
                                          : false
                                      }
                                      onChange={(e) => {
                                        setMediaPlans((prev) => {
                                          const newPlans = [...prev];
                                          if (
                                            Number(e.target.value) <=
                                            Number(plan?.budget)
                                          ) {
                                            newPlans[index].amount =
                                              e.target.value;
                                          }
                                          return newPlans;
                                        });
                                      }}
                                      max={
                                        plan?.type === "total_po_amount_percent"
                                          ? 100
                                          : ""
                                      }
                                    />
                                    {plan?.type ===
                                      "total_po_amount_percent" && (
                                      <p className="absolute right-2 top-2">
                                        %
                                      </p>
                                    )}
                                  </div>
                                  <Trash2
                                    color="red"
                                    className="shrink-0 cursor-pointer"
                                    size={16}
                                    onClick={() => removeMP(index)}
                                  />
                                </div>
                                {plan?.type &&
                                  plan?.type !== "total_po_amount" && (
                                    <div className="flex justify-end mr-7">
                                      <p className="text-slate-500 text-[14px]">
                                        Non-assigned Budget:{" "}
                                        {plan?.type === "fixed_amount"
                                          ? Number(plan?.budget) -
                                            Number(plan?.amount)
                                          : Number(plan?.budget) -
                                            (Number(plan?.amount) / 100) *
                                              Number(plan?.budget)}
                                      </p>
                                    </div>
                                  )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <div
                  className="bg-white w-fit flex items-center gap-2 cursor-pointer text-[14px] shadow-lg px-3 py-1 rounded-2xl mt-[20px]"
                  onClick={() => {
                    if(poForm?.PO_total_amount  > 0){
                      setMediaPlans((prev) => [...prev, {}]);
                    } else {
                      toast("Please enter a valid PO total amount before assigning media plans.", {
                        style: {
                          background: "red",
                          color: "white",
                          textAlign: "center"
                        },
                        duration: 2000
                      });
                    }
                  }}
                >
                  <Image src={blueBtn} alt="menu" width={14} height={14} />
                  <p className="text-blue-500">Assign Media Plan</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-white sticky bottom-0 z-10 flex justify-end rounded-b-[32px]">
              <div className="flex items-center gap-5">
                <button className="btn_model_outline" onClick={handleClose}>
                  Cancel
                </button>
                <button className="btn_model_active whitespace-nowrap" disabled={uploading} onClick={addPOToDB}>
                  {uploading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Create PO"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFinanceModal;
