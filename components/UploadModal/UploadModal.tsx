import Image from "next/image";
import React, { useEffect, useState } from "react";
import upload from "../../public/Featured icon.svg";
import icon from "../../public/Icon.svg";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { useCampaigns } from "app/utils/CampaignsContext";
import Link from "next/link";
import axios from "axios";
import { removeKeysRecursively } from "utils/removeID";
import { ca } from "date-fns/locale";

// Define the props interface for TypeScript
interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: string;
  channel: string;
  format: string;
  quantities: any;
  stageName: any;
  previews: any[];
}

// Make the modal controlled by passing isOpen and onClose props, plus additional props
const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  platform,
  channel,
  format,
  quantities,
  stageName,
  previews,
}) => {
  const handleCancel = () => {
    onClose();
  };

  const handleConfirm = () => {
    uploadFilesToStrapi();
  };

  const handleClose = () => {
    // Close the modal
    onClose();
  };

  const [uploads, setUploads] = useState([]);
  const [uploadBlobs, setUploadBlobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    campaignFormData,
    setCampaignFormData,
    updateCampaign,
    campaignData,
    getActiveCampaign,
  } = useCampaigns();

  const handleFileChange = (e, index) => {
    e.preventDefault();
    const file = e.target.files[0];
    console.log("here", file);
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      const maxSizeInMB = 10;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        toast("Invalid file type. Please upload a JPEG, PNG, or SVG file.");
        return;
      }

      if (file.size > maxSizeInBytes) {
        toast(
          `File size exceeds ${maxSizeInMB}MB. Please upload a smaller file.`
        );
        return;
      }

      // Let images me inserted at the position they come from
      setUploads((prevUploads) => {
        const updatedUploads = [...prevUploads];
        updatedUploads[index] = file;
        return updatedUploads;
      });
      // create an object URL blob so the user can preview the selected image
      const objectUrl = URL.createObjectURL(file);
      // Ensure the object URL is inserted at the correct index
      setUploadBlobs((prevBlobs) => {
        const updatedBlobs = [...prevBlobs];
        updatedBlobs[index] = objectUrl;
        return updatedBlobs;
      });
      e.target.files = null;
    }
  };

  const handleDelete = (index: number) => {
    setUploads((prevUploads) => {
      const updatedUploads = [...prevUploads];
      updatedUploads[index] = "";
      return updatedUploads;
    });

    setUploadBlobs((prevBlobs) => {
      const updatedBlobs = [...prevBlobs];
      updatedBlobs[index] = "";
      return updatedBlobs;
    });
  };

  const updateGlobalState = async (ids: string[]) => {
    const updatedChannelMix = [...(campaignFormData?.channel_mix || [])];

    // Restructure other previews in other platform's formats to their IDs
    updatedChannelMix.forEach((ch: any) => {
      Object.keys(ch).forEach((key) => {
        if (Array.isArray(ch[key])) {
          ch[key].forEach((platform: any) => {
            platform.format = platform.format.map((fo: any) => ({
              ...fo,
              num_of_visuals: fo?.num_of_visuals?.toString(),
              previews: fo?.previews?.map((p: { id: string }) => ({ id: p.id })),
            }));
          });
        }
      });
    });

    const stage = updatedChannelMix?.find(
      (ch: any) => ch?.funnel_stage === stageName
    );
    if (!stage) return;

    const platformKey = channel?.toLowerCase()?.replace(" ", "_");
    const platforms = stage[platformKey];
    if (!platforms) return;

    const targetPlatform = platforms?.find(
      (pl: any) => pl?.platform_name === platform
    );
    console.log("🚀 ~ updateGlobalState ~ targetPlatform:", targetPlatform);
    if (!targetPlatform) return;

    const targetFormatIndex = targetPlatform?.format?.findIndex(
      (fo: any) => fo?.format_type === format
    );
    console.log(
      "🚀 ~ updateGlobalState ~ targetFormatIndex:",
      targetFormatIndex
    );
    if (targetFormatIndex === -1 || targetFormatIndex === undefined) return;

    if(!targetPlatform?.format[targetFormatIndex]?.previews) {
    targetPlatform.format[targetFormatIndex] = {
      ...targetPlatform.format[targetFormatIndex],
      previews: Array.from(
      new Set([
        ...ids,
      ])
      )?.map((id) => ({
      id: id,
      })),
    };
  } else {
    targetPlatform.format[targetFormatIndex] = {
      ...targetPlatform.format[targetFormatIndex],
      previews: Array.from(
      new Set([
        ...ids,
        ...targetPlatform?.format[targetFormatIndex]?.previews?.map((p: { id: string }) => p.id),
      ])
      )?.map((id) => ({
      id: id,
      })),
    };
  }
    console.log(updatedChannelMix);
    const updatedState = {
      ...campaignFormData,
      channel_mix: updatedChannelMix,
    };
    console.log("Updated State:", updatedState);
    await uploadUpdatedCampaignToStrapi(updatedState);
  };

  const uploadUpdatedCampaignToStrapi = async (data) => {
    const cleanData = removeKeysRecursively(
      campaignData,
      ["id", "documentId", "createdAt", "publishedAt", "updatedAt"],
      ["previews"]
    );
    await updateCampaign({
      ...cleanData,
      channel_mix: removeKeysRecursively(
        data?.channel_mix,
        [
          "isValidated",
          "formatValidated",
          "validatedStages",
          "documentId",
          "id"
        ],
        ["previews"]
      ),
    });
    await getActiveCampaign();
    setLoading(false);
    onClose();
  };

  const uploadFilesToStrapi = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      uploads.forEach((file, index) => {
        if (file) {
          formData.append(`files`, file);
        }
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload files to Strapi");
      }

      const uploadedFiles = await response.json();
      const uploadedFileIds = uploadedFiles.map((file) => file.id);
      await updateGlobalState(uploadedFileIds);
      // Update global state or perform further actions with the uploaded file IDs
      console.log("Uploaded file IDs:", uploadedFileIds);
      toast.success("Files uploaded successfully!");
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files. Please try again.");
      setLoading(false)
    } finally {
    }
  };

  useEffect(() => {
    if (previews && previews.length > 0) {
      const urls = previews.map((preview) => preview?.url);
      setUploadBlobs(urls);
    }
  }, []);

  // Don't render anything if the modal is not open
  if (!isOpen) return null;

  return (
    // Modal overlay - fixed position, centers content
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      {/* Modal container with scrolling */}
      <div className="relative bg-white w-full max-w-[771px] max-h-[90vh] rounded-[10px] shadow-md overflow-y-auto">
        {/* Modal content */}
        <div className="p-8 flex flex-col gap-4">
          <div
            className="absolute right-10 top-10 cursor-pointer"
            onClick={handleClose}
          >
            <Image src={icon} className="size-4" alt="x" />
          </div>

          <div className="flex flex-col items-center gap-4">
            <Image src={upload} alt="upload" />
            <h2 className="font-bold text-xl tracking-tighter">
              Upload your previews
            </h2>
            <h2 className="font-lighter text-balance text-md text-black">
              Upload the visuals for your selected formats. Each visual should
              have a corresponding preview.
            </h2>
          </div>

          {/* Visuals section */}
          <div className="flex flex-col mt-6 gap-4">
            <h2 className="font-bold text-xl text-center tracking-tighter">
              {format} ({platform} - {channel})
            </h2>

            <div className="flex justify-center gap-6 flex-wrap">
              {Array.from({ length: quantities }).map(
                (_, index) => {
                  if (uploadBlobs[index] && uploadBlobs[index] !== "") {
                    return (
                      <Link
                        href={uploadBlobs[index]}
                        target="_blank"
                        key={index}
                        className="relative w-[225px] h-[105px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                      >
                        <Image
                          src={uploadBlobs[index]}
                          alt={`Image ${index}`}
                          className="w-full h-full object-cover"
                          width={225}
                          height={225}
                          objectFit="cover"
                        />
                        {/* <div
                          className="absolute right-2 top-2 bg-red-500 w-[20px] h-[20px] rounded-full flex justify-center items-center cursor-pointer"
                          onClick={() => handleDelete(index)}
                        >
                          <Trash color="white" size={10} />
                        </div> */}
                      </Link>
                    );
                  }
                  return (
                    <div
                      key={index}
                      className="w-[225px] h-[105px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                    >
                        <label
                        className="flex flex-col items-center gap-2 text-center"
                        htmlFor={`upload${index}`}
                        >
                        <svg
                          width="16"
                          height="17"
                          viewBox="0 0 16 17"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                          d="M0.925781 14.8669H15.9258V16.5335H0.925781V14.8669ZM9.25911 3.89055V13.2002H7.59245V3.89055L2.53322 8.94978L1.35471 7.77128L8.42578 0.700195L15.4969 7.77128L14.3184 8.94978L9.25911 3.89055Z"
                          fill="#3175FF"
                          />
                        </svg>
                        <p className="text-md text-black font-lighter mt-2">
                          Upload visual {index + 1}
                        </p>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          id={`upload${index}`}
                          className="hidden"
                          onChange={(e) => handleFileChange(e, index)}
                        />
                        </label>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row w-full justify-between gap-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 w-full sm:w-1/2 h-[44px] rounded-[8px] font-bold bg-white border border-gray-200 border-solid hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 w-full sm:w-1/2 h-[44px] font-bold bg-blue-600 rounded-[8px] text-white hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <center>
                  <FaSpinner className="animate-spin" />
                </center>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
