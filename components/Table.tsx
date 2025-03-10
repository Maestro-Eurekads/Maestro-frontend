import Image from "next/image";
import edit from "../public/ri-edit-line.svg";
import share from "../public/ri-share-box-line.svg";
import line from "../public/ri-file-copy-line.svg";
import ProgressBar from "./ProgressBar";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { FiLoader } from "react-icons/fi";
import { useRouter } from "next/navigation";

const Table = () => {
  const { loading, clientCampaignData } = useCampaigns();
  const router = useRouter();
  return (
    <div className="table-container mt-[20px] rounded-[8px] overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th className="py-[12px] px-[16px]">Name</th>
            <th className="py-[12px] px-[16px]">Version</th>
            <th className="py-[12px] px-[16px]">Progress</th>
            <th className="py-[12px] px-[16px]">Status</th>
            <th className="py-[12px] px-[16px]">Budget</th>
            <th className="py-[12px] px-[16px]">Made by</th>
            <th className="py-[12px] px-[16px]">Approved by</th>
            <th className="py-[12px] px-[16px]">Actions</th>
          </tr>
        </thead>
        <tbody className="data-table-content">
          {loading ? (
            <center className="flex items-center gap-2 my-2">
              <FiLoader className="animate-spin" size={20} />
              <p>Loading client campaigns</p>
            </center>
          ) : (
            <>
              {clientCampaignData?.map((data) => (
                <tr
                  key={data?.id}
                  onClick={() =>
                    router.push(`/creation?campaignId=${data?.documentId}`)
                  }
				  className="cursor-pointer"
                >
                  <td className="whitespace-nowrap py-[12px] px-[16px]">
                    {data?.media_plan_details?.plan_name} - Running
                  </td>
                  <td className="py-[12px] px-[16px]">V9</td>
                  <td className="py-[12px] px-[16px]">
                    <ProgressBar progress={100} />
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
                      Maxime Brevet
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
                      <Image src={edit} alt="menu" />
                      <Image src={share} alt="menu" />
                      <Image src={line} alt="menu" />
                    </div>
                  </td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
