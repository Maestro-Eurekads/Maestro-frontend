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

const AddFinanceModal = ({ isOpen, setIsOpen }) => {
  const [mediaPlans, setMediaPlans] = useState([]);
  const { fetchClientCampaign, fetchUserByType } = useCampaignHook();
  const [selected, setSelected] = useState("");
  const [selectedPlanBudget, setSelectedPlanBudget] = useState("");
  const [poForm, setPoForm] = useState({
    client: "",
    client_responsible: "",
    financial_responsible: "",
    PO_number: "",
    PO_currency: "",
    PO_total_amount: "",
    assigned_media_plan: [],
  });
  const [clientCampigns, setClientCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingCam, setLoadingCam] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);

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
    { value: "US Dollar (USD)", label: "US Dollar (USD)", sign: "$" },
    { value: "Euro (EUR)", label: "Euro (EUR)", sign: "€" },
    { value: "British Pound (GBP)", label: "British Pound (GBP)", sign: "£" },
    { value: "Nigerian Naira (NGN)", label: "Nigerian Naira (NGN)", sign: "₦" },
    { value: "Japanese Yen (JPY)", label: "Japanese Yen (JPY)", sign: "¥" },
    {
      value: "Canadian Dollar (CAD)",
      label: "Canadian Dollar (CAD)",
      sign: "C$",
    },
  ];

  const handleClose = () => {
    setPoForm({
      client: "",
      client_responsible: "",
      financial_responsible: "",
      PO_number: "",
      PO_currency: "",
      PO_total_amount: "",
      assigned_media_plan: [],
    });
    setSelected("");
    setIsOpen(false);
    setClientCampaigns([]);
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

  return (
    <div className="z-50">
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
                    value={poForm.PO_number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setPoForm((prev) => ({ ...prev, PO_number: value }));
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
                  value={poForm.PO_total_amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setPoForm((prev) => ({ ...prev, PO_total_amount: value }));
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
                      {mediaPlans.map((plan, index) => (
                        <div key={index} className="flex gap-3 items-center">
                          {loadingCam ? (
                            <div className="shrink-0 flex items-center gap-2">
                              <FiLoader className="animate-spin" />
                              <p>Loading client plans...</p>
                            </div>
                          ) : (
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
                                  setSelectedPlanBudget(value.budget);
                                }
                              }}
                            />
                          )}
                          <CustomSelect
                            placeholder="Select amount"
                            className="rounded-3xl"
                            options={[
                              {
                                label: "Total PO amount",
                                value: "total_po_amount",
                              },
                              { label: "Fixed amount", value: "fixed_amount" },
                              {
                                label: "Percentage of PO total amount",
                                value: "total_po_amount_percent",
                              },
                            ]}
                            onChange={(
                              value: { label: string; value: string } | null
                            ) => {
                              if (value) {
                                if (value?.value === "total_po_amount") {
                                  setMediaPlans((prev) => {
                                    const newPlans = [...prev];
                                    newPlans[index].amount = selectedPlanBudget;
                                    newPlans[index].type = value.value;
                                    return newPlans;
                                  });
                                } else {
                                  setMediaPlans((prev) => {
                                    const newPlans = [...prev];
                                    newPlans[index].amount = "";
                                    newPlans[index].type = value.value;
                                    return newPlans;
                                  });
                                }
                              }
                            }}
                          />
                          <input
                            type="text"
                            placeholder={
                              plan?.type === "total_po_amount_percent"
                                ? "Enter percentage"
                                : "Enter amount"
                            }
                            className="w-full border rounded-md p-[6px] outline-none"
                            value={plan?.amount}
                            disabled={
                              plan?.type === "total_po_amount" ? true : false
                            }
                            onChange={(e) => {
                              setMediaPlans((prev) => {
                                const newPlans = [...prev];
                                newPlans[index].amount = e.target.value;
                                return newPlans;
                              });
                            }}
                            max={
                              plan?.type === "total_po_amount_percent"
                                ? 100
                                : ""
                            }
                          />
                          <Trash2
                            color="red"
                            className="shrink-0 cursor-pointer"
                            size={16}
                            onClick={() => removeMP(index)}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div
                  className="bg-white w-fit flex items-center gap-2 cursor-pointer text-[14px] shadow-lg px-3 py-1 rounded-2xl mt-[20px]"
                  onClick={() => {
                    setMediaPlans((prev) => [...prev, {}]);
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
                <button className="btn_model_active whitespace-nowrap">
                  Create PO
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
