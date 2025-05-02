"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import closefill from "../../../public/close-fill.svg";
import blueprofile from "../../../public/blueprofile.svg";
import blueBtn from "../../../public/blueBtn.svg";
import { MdOutlineCancel } from "react-icons/md";
import { CustomSelect } from "./CustomReactSelect";
import { Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "store/useStore";
import { FiLoader } from "react-icons/fi";
import useCampaignHook from "app/utils/useCampaignHook";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { useCampaigns } from "app/utils/CampaignsContext";
import { selectCurrency, statusOption } from "components/data";
import { getCreateClient } from "features/Client/clientSlice";

const AddFinanceModal = ({
  isOpen,
  setIsOpen,
  mode,
  selectedRow,
  setSelectedRow,
}: {
  isOpen: boolean;
  setIsOpen: any;
  mode?: string;
  selectedRow?: any;
  setSelectedRow?: any;
}) => {
  const [mediaPlans, setMediaPlans] = useState([]);
  const { fetchClientCampaign, fetchUserByType, fetchClientPOS } = useCampaignHook();
  const { setClientPOs, setFetchingPO } = useCampaigns();
  const [selected, setSelected] = useState("");
  const [poForm, setPoForm] = useState({
    client: "",
    client_responsible: "",
    financial_responsible: "",
    PO_number: 0,
    PO_currency: "",
    PO_total_amount: 0,
    PO_status: "open",
  });
  const [clientCampaigns, setClientCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingCam, setLoadingCam] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dispatch = useAppDispatch();

  const { getCreateClientData, getCreateClientIsLoading } = useAppSelector(
    (state) => state.client
  );
  const clients: any = getCreateClientData;

  const removeMP = (index) => {
    setMediaPlans((prev) => prev.filter((_, ind) => ind !== index));
  };

  const handleClose = () => {
    setPoForm({
      client: "",
      client_responsible: "",
      financial_responsible: "",
      PO_number: 0,
      PO_currency: "",
      PO_total_amount: 0,
      PO_status: "open",
    });
    setSelected("");
    setIsOpen(false);
    setClientCampaigns([]);
    setMediaPlans([]);
  };

  useEffect(() => {
    if (!poForm.client && selected) {
      toast("Please select a client", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
    }
  }, [poForm.client, selected]);

  useEffect(() => {
    if (selected || selectedRow) {
      setLoadingCam(true);
      fetchClientCampaign(selected || selectedRow?.client?.id)
        .then((res) => {
          const data = res?.data?.data;
          const newOption = data?.map((opt) => ({
            label: opt?.media_plan_details?.plan_name,
            value: opt?.id,
            budget: opt?.campaign_budget?.amount,
          }));
          setClientCampaigns(newOption);
        })
        .catch((err) => console.log(err))
        .finally(() => setLoadingCam(false));
    }
  }, [selected, selectedRow]);

  useEffect(() => {
    const fetchAgencyUsers = async () => {
      setLoadingUser(true);
      await fetchUserByType(
        "?filters[$or][0][user_type][$eq]=agency_approver&filters[$or][1][user_type][$eq]=agency_creator"
      )
        .then((res) => {
          const d = res?.data;
          const newOpt = d?.map((opt) => ({
            label: opt?.username,
            value: opt?.id,
          }));
          setUsers(newOpt);
        })
        .catch((err) => console.log(err))
        .finally(() => setLoadingUser(false));
    };
    fetchAgencyUsers();
  }, []);

  useEffect(() => {
    if (selectedRow) {
      setPoForm({
        client: selectedRow?.client?.id || "",
        client_responsible: selectedRow?.client_responsible?.id || "",
        financial_responsible: selectedRow?.financial_responsible?.id || "",
        PO_number: selectedRow?.PO_number || 0,
        PO_currency: selectedRow?.PO_currency || "",
        PO_total_amount: selectedRow?.PO_total_amount || 0,
        PO_status: selectedRow?.PO_status || "open",
      });

      const mp = selectedRow?.assigned_media_plans?.map((mp) => ({
        name: mp?.campaign?.id?.toString() || "",
        amount:
          mp?.amount_type === "total_po_amount_percent"
            ? mp?.percentage
            : mp?.amount || 0,
        type: mp?.amount_type || "",
        percentage: mp?.percentage || null,
      })) || [];
      setMediaPlans(mp);
    }
  }, [selectedRow]);

  const validateForm = () => {
    if (!poForm.client) {
      toast("Please select a client", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return false;
    }
    if (!poForm.client_responsible) {
      toast("Please select a Client Responsible person", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return false;
    }
    if (!poForm.financial_responsible) {
      toast("Please select a Financial Responsible person", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return false;
    }
    if (!poForm.PO_number || poForm.PO_number <= 0) {
      toast("Please enter a valid PO number", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return false;
    }
    if (!poForm.PO_currency) {
      toast("Please select a currency from the dropdown list", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return false;
    }
    if (!poForm.PO_total_amount || poForm.PO_total_amount <= 0) {
      toast("Please enter a valid total PO amount", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return false;
    }
    if (mediaPlans.length > 0) {
      for (const plan of mediaPlans) {
        if (!plan.name) {
          toast("Please select a media plan", {
            style: { background: "red", color: "white", textAlign: "center" },
            duration: 3000,
          });
          return false;
        }
        if (!plan.type) {
          toast("Please select an amount type", {
            style: { background: "red", color: "white", textAlign: "center" },
            duration: 3000,
          });
          return false;
        }
        if (!plan.amount && plan.amount !== 0) {
          toast("Please enter an amount for the media plan", {
            style: { background: "red", color: "white", textAlign: "center" },
            duration: 3000,
          });
          return false;
        }
      }
    }
    return true;
  };

  const checkPONumberExists = async (poNumber: number) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/purchase-orders?filters[PO_number][$eq]=${poNumber}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );
      return response.data.data.length > 0;
    } catch (err) {
      console.error("Error checking PO number:", err);
      return false;
    }
  };

  const addPOToDB = async () => {
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    try {
      const poExists = await checkPONumberExists(poForm.PO_number);
      if (poExists) {
        toast("PO number already exists. Please use a different number.", {
          style: { background: "red", color: "white", textAlign: "center" },
          duration: 3000,
        });
        return;
      }

      const payload = {
        data: {
          ...poForm,
          assigned_media_plans: mediaPlans?.map((mp) => ({
            campaign: mp?.name,
            amount:
              mp?.type === "total_po_amount_percent"
                ? (Number(mp?.amount) / 100) * Number(poForm?.PO_total_amount)
                : Number(mp?.amount),
            amount_type: mp?.type,
            percentage: mp?.type === "total_po_amount_percent" ? Number(mp?.amount) : null,
          })),
        },
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/purchase-orders?populate[0]=assigned_media_plans.campaign`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );

      const newPO = response.data.data;
      setClientPOs((prevPOs) => [newPO, ...(prevPOs || [])]);
      dispatch(getCreateClient());

      if (selected) {
        localStorage.setItem("selectedClient", selected);
      }

      if (setSelectedRow) {
        setSelectedRow({
          ...newPO,
          client: { id: poForm.client },
          client_responsible: { id: poForm.client_responsible },
          financial_responsible: { id: poForm.financial_responsible },
          PO_number: poForm.PO_number,
          PO_currency: poForm.PO_currency,
          PO_total_amount: poForm.PO_total_amount,
          PO_status: poForm.PO_status,
          assigned_media_plans: mediaPlans?.map((mp) => ({
            campaign: { id: mp?.name },
            amount:
              mp?.type === "total_po_amount_percent"
                ? (Number(mp?.amount) / 100) * Number(poForm?.PO_total_amount)
                : Number(mp?.amount),
            amount_type: mp?.type,
            percentage: mp?.type === "total_po_amount_percent" ? Number(mp?.amount) : null,
          })),
        });
      }

      toast("Purchase Order created successfully!", {
        style: { background: "green", color: "white", textAlign: "center" },
        duration: 3000,
      });

      handleClose();
      fetchClientPOS(poForm.client).then((res) => {
        setClientPOs(res?.data?.data || []);
      });
    } catch (err) {
      console.error("Error creating PO:", err);
      const errorMessage =
        err?.response?.data?.error?.message || "An unexpected error occurred";
      if (errorMessage.includes("This attribute must be unique")) {
        toast("PO number already exists. Please use a different number.", {
          style: { background: "red", color: "white", textAlign: "center" },
          duration: 3000,
        });
      } else {
        toast(`Error: ${errorMessage}`, {
          style: { background: "red", color: "white", textAlign: "center" },
          duration: 3000,
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const updatePOInDB = async () => {
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/purchase-orders/${selectedRow?.documentId}`,
        {
          data: {
            ...poForm,
            assigned_media_plans: mediaPlans?.map((mp) => ({
              campaign: mp?.name,
              amount:
                mp?.type === "total_po_amount_percent"
                  ? (Number(mp?.amount) / 100) * Number(poForm?.PO_total_amount)
                  : Number(mp?.amount),
              amount_type: mp?.type,
              percentage: mp?.type === "total_po_amount_percent" ? Number(mp?.amount) : null,
            })),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );

      toast("Purchase Order updated successfully!", {
        style: { background: "green", color: "white", textAlign: "center" },
        duration: 3000,
      });
      handleClose();
      setFetchingPO(true);
      fetchClientPOS(selectedRow?.client?.id)
        .then((res) => {
          localStorage.setItem("selectedClient", selectedRow?.client?.id);
          setClientPOs(res?.data?.data || []);
        })
        .finally(() => setFetchingPO(false));
    } catch (err) {
      console.error("Error updating PO:", err);
      toast("Error updating Purchase Order", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative z-50">
      <Toaster />
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
                  <h3>{mode === "edit" ? "Edit" : "Add"} purchase order</h3>
                </div>
              </div>
              <button className="text-gray-500 hover:text-gray-800" onClick={handleClose}>
                <Image src={closefill} alt="menu" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex items-start gap-3 w-full">
                <div className="w-1/2">
                  <label htmlFor="" className="block mb-2">
                    Client Name
                  </label>
                  {getCreateClientIsLoading ? (
                    <div className="flex items-center gap-2">
                      <FiLoader className="animate-spin" />
                      <p>Loading clients...</p>
                    </div>
                  ) : (
                    clients?.data && (
                      <CustomSelect
                        options={clients?.data?.map((c) => ({
                          label: c?.client_name,
                          value: c?.id,
                        }))}
                        className="min-w-[150px] z-[20]"
                        placeholder="Select client"
                        value={clients?.data
                          ?.map((c) => ({
                            label: c?.client_name,
                            value: c?.id,
                          }))
                          ?.find((op) => op?.value === poForm?.client)}
                        onChange={(value: { label: string; value: string } | null) => {
                          if (value) {
                            setSelected(value.value);
                            setPoForm((prev) => ({
                              ...prev,
                              client: value.value,
                            }));
                          }
                        }}
                        isDisabled={mode === "edit"}
                      />
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
                      value={users?.find((uu) => uu?.value === poForm?.client_responsible)}
                      onChange={(value: { label: string; value: string } | null) => {
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
                    value={users?.find((uu) => uu?.value === poForm?.financial_responsible)}
                    onChange={(value: { label: string; value: string } | null) => {
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
                        PO_number: Number(value) || 0,
                      }));
                    }}
                    disabled={mode === "edit"}
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="">PO Currency</label>
                  <CustomSelect
                    className="mt-2"
                    placeholder="Select currency"
                    options={selectCurrency}
                    onChange={(value: { label: string; value: string } | null) => {
                      if (value) {
                        setPoForm((prev) => ({
                          ...prev,
                          PO_currency: value.value,
                        }));
                      }
                    }}
                    value={selectCurrency?.find((curr) => curr?.value === poForm?.PO_currency)}
                  />
                </div>
              </div>
              <div className="flex items-start gap-3 w-full mt-3">
                <div className="w-1/2 mt-3">
                  <label htmlFor="">PO Total Amount</label>
                  <input
                    type="text"
                    placeholder="PO Total Amount"
                    className="w-full border rounded-md p-[6px] mt-2 outline-none"
                    value={
                      (poForm.PO_total_amount > 0 &&
                        poForm.PO_total_amount?.toLocaleString()) ||
                      ""
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setPoForm((prev) => ({
                        ...prev,
                        PO_total_amount: Number(value) || 0,
                      }));
                    }}
                  />
                </div>
                {mode === "edit" && (
                  <div className="w-1/2 mt-3">
                    <label htmlFor="">PO Status</label>
                    <CustomSelect
                      className="mt-2"
                      placeholder="Select status"
                      options={statusOption}
                      value={statusOption?.find((opt) => opt?.value === poForm?.PO_status)}
                      onChange={(value: { label: string; value: string } | null) => {
                        if (value) {
                          setPoForm((prev) => ({
                            ...prev,
                            PO_status: value.value,
                          }));
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold my-3">Assigned Media Plan</p>

                {mediaPlans?.length > 0 && (
                  <div className="space-y-3">
                    {mediaPlans?.map((plan, index) => (
                      <div key={index}>
                        {loadingCam ? (
                          <div className="shrink-0 flex items-center gap-2">
                            <FiLoader className="animate-spin" />
                            <p>Loading client plans...</p>
                          </div>
                        ) : (
                          <div className="flex gap-3 items-center">
                            <CustomSelect
                              placeholder="Select media plan"
                              className="rounded-3xl"
                              options={clientCampaigns.filter(
                                (campaign) =>
                                  !mediaPlans.some((plan) => plan?.name === campaign?.value)
                              )}
                              value={
                                clientCampaigns?.find((cc) => cc.value === mediaPlans[index]?.name) || null
                              }
                              onChange={(value: { label: string; value: string; budget: string } | null) => {
                                if (value) {
                                  setMediaPlans((prev) => {
                                    const newPlans = [...prev];
                                    newPlans[index] = {
                                      ...newPlans[index],
                                      name: value.value,
                                    };
                                    if (plan?.type && plan?.type === "total_po_amount") {
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
                                { label: "Total PO amount", value: "total_po_amount" },
                                { label: "Fixed amount", value: "fixed_amount" },
                                {
                                  label: "Percentage of PO total amount",
                                  value: "total_po_amount_percent",
                                },
                              ]}
                              value={{
                                value: plan?.type,
                                label:
                                  plan?.type === "total_po_amount"
                                    ? "Total PO amount"
                                    : plan?.type === "fixed_amount"
                                    ? "Fixed amount"
                                    : plan?.type === "total_po_amount_percent"
                                    ? "Percentage of PO total amount"
                                    : "",
                              }}
                              onChange={(value: { label: string; value: string } | null) => {
                                if (value) {
                                  if (value?.value === "total_po_amount") {
                                    setMediaPlans(() => {
                                      const newPlans = [];
                                      newPlans[0] = {
                                        ...mediaPlans[index],
                                        amount: poForm?.PO_total_amount,
                                        type: value.value,
                                      };
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
                            <div className="relative shrink-0">
                              <input
                                type="text"
                                placeholder={
                                  plan?.type === "total_po_amount_percent"
                                    ? "Enter percentage"
                                    : "Enter amount"
                                }
                                className="w-full border rounded-md p-[6px] outline-none"
                                value={(plan?.amount > 0 && plan?.amount?.toLocaleString()) || ""}
                                disabled={plan?.type === "total_po_amount"}
                                onChange={(e) => {
                                  const inputValue = Number(e.target.value.replace(/\D/g, ""));
                                  const totalAssignedAmount = mediaPlans.reduce((acc, p, i) => {
                                    if (i !== index && p?.amount > 0) {
                                      if (p?.type !== "total_po_amount_percent") {
                                        return acc + Number(p?.amount);
                                      } else if (p?.type === "total_po_amount_percent") {
                                        return (
                                          acc +
                                          (Number(p?.amount) / 100) * Number(poForm?.PO_total_amount)
                                        );
                                      }
                                    }
                                    return acc;
                                  }, 0);

                                  if (plan?.type === "total_po_amount_percent") {
                                    if (
                                      (inputValue / 100) * Number(poForm?.PO_total_amount) +
                                      totalAssignedAmount <= poForm?.PO_total_amount
                                    ) {
                                      setMediaPlans((prev) => {
                                        const newPlans = [...prev];
                                        newPlans[index].amount = inputValue;
                                        return newPlans;
                                      });
                                    } else {
                                      toast(
                                        "The total assigned amount cannot exceed the PO total amount.",
                                        {
                                          style: {
                                            background: "red",
                                            color: "white",
                                            textAlign: "center",
                                          },
                                          duration: 3000,
                                        }
                                      );
                                    }
                                  } else {
                                    if (inputValue + totalAssignedAmount <= poForm?.PO_total_amount) {
                                      setMediaPlans((prev) => {
                                        const newPlans = [...prev];
                                        newPlans[index].amount = inputValue;
                                        return newPlans;
                                      });
                                    } else {
                                      toast(
                                        "The total assigned amount cannot exceed the PO total amount.",
                                        {
                                          style: {
                                            background: "red",
                                            color: "white",
                                            textAlign: "center",
                                          },
                                          duration: 3000,
                                        }
                                      );
                                    }
                                  }
                                }}
                                max={plan?.type === "total_po_amount_percent" ? 100 : ""}
                              />
                              {plan?.type === "total_po_amount_percent" && (
                                <p className="absolute right-2 top-2">%</p>
                              )}
                            </div>
                            <Trash2
                              color="red"
                              className="shrink-0 cursor-pointer"
                              size={16}
                              onClick={() => removeMP(index)}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    {!loadingCam && (
                      <div className="flex justify-end mr-7">
                        <p className="text-slate-500 text-[14px]">
                          Non-assigned Budget:{" "}
                          {poForm?.PO_total_amount
                            ? Math.max(
                                0,
                                poForm.PO_total_amount -
                                  mediaPlans.reduce((acc, plan) => {
                                    if (plan?.amount > 0) {
                                      if (plan?.type !== "total_po_amount_percent") {
                                        return acc + Number(plan?.amount);
                                      } else if (plan?.type === "total_po_amount_percent") {
                                        return (
                                          acc +
                                          (Number(plan?.amount) / 100) * Number(poForm?.PO_total_amount)
                                        );
                                      }
                                    }
                                    return acc;
                                  }, 0)
                              )
                            : 0}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div
                  className="bg-white w-fit flex items-center gap-2 cursor-pointer text-[14px] shadow-lg px-3 py-1 rounded-2xl mt-[20px]"
                  onClick={() => {
                    const totalAssignedAmount = mediaPlans?.reduce((acc, plan) => {
                      if (plan?.amount > 0) {
                        if (plan?.type !== "total_po_amount_percent") {
                          return acc + Number(plan?.amount);
                        } else if (plan?.type === "total_po_amount_percent") {
                          return acc + (Number(plan?.amount) / 100) * Number(poForm?.PO_total_amount);
                        }
                      }
                      return acc;
                    }, 0);

                    if (mediaPlans?.some((mp) => mp?.type === "total_po_amount")) {
                      toast(
                        "You have a plan that is set to total PO amount, please remove it or change the amount type, before adding a new plan.",
                        {
                          style: { background: "red", color: "white", textAlign: "center" },
                          duration: 3000,
                        }
                      );
                    } else if (poForm?.PO_total_amount > 0) {
                      if (totalAssignedAmount >= poForm?.PO_total_amount) {
                        toast(
                          "The total assigned amount cannot exceed the PO total amount.",
                          {
                            style: { background: "red", color: "white", textAlign: "center" },
                            duration: 3000,
                          }
                        );
                      } else if (
                        mediaPlans.length > 0 &&
                        mediaPlans?.some((plan) => !plan?.name || !plan?.type || !plan?.amount)
                      ) {
                        toast(
                          "Please fill all fields of the previous media plan before adding a new one.",
                          {
                            style: { background: "red", color: "white", textAlign: "center" },
                            duration: 3000,
                          }
                        );
                      } else {
                        setMediaPlans((prev) => [...prev, {}]);
                      }
                    } else {
                      toast(
                        "Please enter a valid PO total amount before assigning media plans.",
                        {
                          style: { background: "red", color: "white", textAlign: "center" },
                          duration: 3000,
                        }
                      );
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
                <button
                  className="btn_model_active whitespace-nowrap"
                  disabled={uploading}
                  onClick={mode === "edit" ? updatePOInDB : addPOToDB}
                >
                  {uploading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    `${mode === "edit" ? "Update" : "Create"} PO`
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