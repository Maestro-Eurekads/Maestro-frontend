"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Edit, Trash, Eye } from "lucide-react";
import { useCampaigns } from "app/utils/CampaignsContext";
import { NoRecordFound, SVGLoaderFetch } from "components/Options";
import { getCurrencySymbol } from "components/data";

function FinanceTable({
  data, // Paginated data from FinanceView
  selectedRow,
  setSelectedRow,
  openEdit,
  setOpenEdit,
  openDelete,
  setOpenDelete,
  openView,
  setOpenView,
}) {
  const [expanded, setExpanded] = useState("");
  const { fetchingPO, clientCampaignData, loading } = useCampaigns();
  const [expandedPO, setExpandedPO] = useState(null);

  const toggleExpand = (po) => {
    setExpanded((prev) => (prev === po?.id ? "" : po?.id));
    setExpandedPO(po);
  };

  console.log('clientCampaignData-clientCampaignData', clientCampaignData)

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="py-[12px] px-[16px] text-left">PO Number</th>
          <th className="py-[12px] px-[16px] text-left">Total Budget</th>
          <th className="py-[12px] px-[16px] text-left">Assigned Budget</th>
          <th className="py-[12px] px-[16px] text-left">Assigned Media Plan</th>
          <th className="py-[12px] px-[16px] text-left">Available Budget</th>
          <th className="py-[12px] px-[16px] text-left whitespace-nowrap">PO Status</th>
          <th className="py-[12px] px-[16px] text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {fetchingPO || loading ? (
          <SVGLoaderFetch colSpan={7} text={"Loading client purchase orders"} />
        ) : data?.length === 0 ? (
          <NoRecordFound colSpan={7}>No Client Purchase Order!</NoRecordFound>
        ) : (
          data?.map((po, index) => {
            const currencySymbol = getCurrencySymbol(po?.PO_currency);
            const getTotalAssignedBudget = (assignedMediaPlans) => {
              return assignedMediaPlans?.reduce(
                (total, mp) => total + (mp?.amount || 0),
                0
              );
            };
            const totalAssignedBudget = getTotalAssignedBudget(
              po?.assigned_media_plans
            );
            const availableBudget = po?.PO_total_amount - totalAssignedBudget;
            return (
              <>
                <tr key={po?.id || index} className="border-b bg-white">
                  <td className="py-[12px] px-[16px]">
                    <div className="flex items-center">
                      <span className="font-medium">PO {po?.PO_number}</span>
                      <button
                        onClick={() => toggleExpand(po)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        {expanded === po?.id ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-[12px] px-[16px]">
                    {currencySymbol}
                    {Number(po?.PO_total_amount)?.toLocaleString()}
                  </td>
                  <td className="py-[12px] px-[16px]">
                    {currencySymbol}
                    {totalAssignedBudget?.toLocaleString()}
                  </td>
                  <td className="py-[12px] px-[16px] w-fit">
                    <div className="flex flex-wrap gap-2">
                      {po?.assigned_media_plans?.map((mp) => {
                        const m = clientCampaignData?.find(
                          (mm) => mm?.id === mp?.campaign?.id
                        );
                        if (!m) return null;
                        return (
                          <span
                            key={mp?.id}
                            className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                          >
                            {m?.media_plan_details?.plan_name}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-[12px] px-[16px]">
                    {currencySymbol}
                    {availableBudget?.toLocaleString()}
                  </td>
                  <td className="py-[12px] px-[16px]">
                    <span
                      className={`${po?.PO_status === "open"
                        ? "text-blue-400"
                        : po?.PO_status === "partially_paid"
                          ? "text-orange-400"
                          : "text-green-400"
                        } capitalize`}
                    >
                      {po?.PO_status?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-[12px] px-[16px]">
                    <div
                      className="flex space-x-2"
                      onClick={() => setSelectedRow(po)}
                    >
                      <button className="text-gray-500 hover:text-gray-700">
                        <Edit size={18} onClick={() => setOpenEdit(true)} />
                      </button>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setOpenDelete(true)}
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded === po?.id && (
                  <>
                    {expandedPO?.assigned_media_plans?.map((mp, index) => {
                      const currencySymbol = getCurrencySymbol(
                        expandedPO?.PO_currency
                      );
                      const m = clientCampaignData?.find(
                        (mm) => mm?.id === mp?.campaign?.id
                      );
                      if (!m) return null;
                      return (
                        <tr key={`${po?.id}-mp-${index}`}>
                          <td className="py-[12px] px-[16px]">
                            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                              {m?.media_plan_details?.plan_name}
                            </span>
                          </td>
                          <td className="py-[12px] px-[16px]"></td>
                          <td className="py-[12px] px-[16px]">
                            {currencySymbol}
                            {Number(mp?.amount)?.toLocaleString()}
                          </td>
                          <td className="py-[12px] px-[16px]"></td>
                          <td className="py-[12px] px-[16px]"></td>
                          <td className="py-[12px] px-[16px]"></td>
                          <td className="py-[12px] px-[16px]"></td>
                        </tr>
                      );
                    })}
                  </>
                )}
              </>
            );
          })
        )}
      </tbody>
    </table>
  );
}

export default FinanceTable;