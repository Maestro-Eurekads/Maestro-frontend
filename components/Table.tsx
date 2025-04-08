import Image from "next/image";
import edit from "../public/ri-edit-line.svg";
import share from "../public/ri-share-box-line.svg";
import line from "../public/ri-file-copy-line.svg";
import ProgressBar from "./ProgressBar";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { FiLoader } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { NoRecordFound, SVGLoaderFetch } from "./Options";
import { useCampaignSelection } from "../app/utils/CampaignSelectionContext";
import { useState } from "react";
import Modal from "./Modals/Modal";
import { removeKeysRecursively } from "utils/removeID";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import { useActive } from "app/utils/ActiveContext";

const Table = () => {
  const { clientCampaignData, loading, setClientCampaignData } = useCampaigns();
  const { setSelectedCampaignId } = useCampaignSelection();
  const router = useRouter();
  const [openModal, setOpenModal] = useState("");
  const [selected, setSelected] = useState<any>({});
  const [duplicateName, setDuplicateName] = useState("");
  const [loadingg, setLoading] = useState(false);
  const { setActive } = useActive();

  const handleDuplicateAction = async (e: any) => {
    e.preventDefault();
    const clean_data = removeKeysRecursively(selected, [
      "id",
      "documentId",
      "createdAt",
      "publishedAt",
      "updatedAt",
    ]);
    const clientId = localStorage.getItem("selectedClient");
    setLoading(true);
    await axios
      .post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns?populate=*`,
        {
          data: {
            ...clean_data,
            media_plan_details: {
              ...clean_data?.media_plan_details,
              plan_name: duplicateName
                ? duplicateName
                : `${clean_data?.media_plan_details?.plan_name}-copy-${
                    selected?.copyCount + 1
                  }`,
            },
            client: clientId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      )
      .then((res) => {
        setClientCampaignData((prev) => [...prev, res?.data?.data]);
        setOpenModal("");
        setDuplicateName("");
        setSelected({});
        updateOrignalCmapignCount(
          selected?.documentId,
          selected?.copyCount + 1
        );
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const updateOrignalCmapignCount = async (id, count) => {
    await axios.put(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${id}`,
      {
        data: {
          copyCount: count,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
        },
      }
    );
  };

  return (
    <div className="table-container rounded-[8px] mt-[20px] overflow-x-scroll">
      <table>
        <thead>
          <tr>
            <th className="py-[12px] px-[16px]">Name</th>
            <th className="py-[12px] px-[16px]">Version</th>
            <th className="py-[12px] px-[16px]">Progress</th>
            <th className="py-[12px] px-[16px]">Status</th>
            <th className="py-[12px] px-[16px]">Budget</th>
            <th className="py-[12px] px-[16px] whitespace-nowrap">Made by</th>
            <th className="py-[12px] px-[16px] whitespace-nowrap">
              Approved by
            </th>
            <th className="py-[12px] px-[16px]">Actions</th>
          </tr>
        </thead>
        <tbody className="data-table-content">
          {loading ? (
            <SVGLoaderFetch colSpan={8} text={"Loading client campaigns"} />
          ) : clientCampaignData?.length === 0 ? (
            <NoRecordFound colSpan={8}>No Client campaigns!</NoRecordFound>
          ) : (
            clientCampaignData?.map((data) => (
              <tr
                key={data?.id}
                onClick={() => {
                  setSelectedCampaignId(data?.documentId); // ✅ Store ID in context
                }}
                className="cursor-pointer"
              >
                <td className="whitespace-nowrap py-[12px] px-[16px]">
                  {data?.media_plan_details?.plan_name} -{" "}
                  {data?.progress_percent < 100 ? "Running" : "Completed"}
                </td>
                <td className="py-[12px] px-[16px]">V9</td>
                <td className="py-[12px] px-[16px]">
                  <ProgressBar progress={data?.progress_percent || 0} />
                </td>
                <td className="py-[12px] px-[16px]">
                  <div className="approved">Approved</div>
                </td>
                <td className="py-[12px] px-[16px]">
                  {data?.budget_details?.value}{" "}
                  {!data?.budget_details?.currency?.includes("%") &&
                  data?.budget_details?.currency?.includes("EUR")
                    ? "€"
                    : ""}
                </td>
                <td className="py-[12px] px-[16px]">
                  <div className="flex items-center whitespace-nowrap gap-3">
                    <div className="view_content_table">MD</div>
                    {data?.responsible}
                  </div>
                </td>
                <td className="py-[12px] px-[16px]">
                  <div className="flex items-center whitespace-nowrap gap-3">
                    <div className="view_content_table">JB</div>
                    <p>{data?.media_plan_details?.internal_approver}</p>
                  </div>
                </td>
                <td className="py-[12px] px-[16px]">
                  <div className="flex gap-4">
                    <Image
                      src={edit}
                      alt="menu"
                      onClick={() => {
                        const activeStepFromPercentage = Math.ceil(
                          (data?.progress_percent * 9) / 100
                        );
                        setActive(
                          activeStepFromPercentage === 0
                            ? 1
                            : activeStepFromPercentage
                        );
                        router.push(`/creation?campaignId=${data?.documentId}`);
                      }}
                    />
                    <Image src={share} alt="menu" />
                    <Image
                      src={line}
                      alt="menu"
                      onClick={() => {
                        setOpenModal("copy");
                        setSelected(data);
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {openModal === "copy" && (
        <Modal isOpen={openModal === "copy"} onClose={() => setOpenModal("")}>
          <div className="bg-white shadow-md rounded-md w-[500px] p-4">
            <p className="text-center font-semibold text-[18px] mb-[14px]">
              Duplicate "{selected?.media_plan_details?.plan_name}"
            </p>
            <form onSubmit={handleDuplicateAction}>
              <label
                htmlFor=""
                className="font-medium flex items-center gap-[5px]"
              >
                New Media Plan Name{" "}
                <span className="text-[14px] text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md p-2 border my-[10px] outline-none"
                placeholder={`${selected?.media_plan_details?.plan_name}-copy`}
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
              />
              <div className="flex justify-between items-center w-full gap-[20px] mt-[10px]">
                <button
                  type="button"
                  className="w-full rounded-md border bg-slate-200 p-2 text-[16px] font-semibold h-[40px]"
                  onClick={() => setOpenModal("")}
                  disabled={loadingg}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full rounded-md border bg-blue-500 text-white p-2 text-[16px] font-semibold flex justify-center items-center  h-[40px]"
                  disabled={loadingg}
                >
                  {loadingg ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Duplicate"
                  )}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Table;
