"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import uploadIcon from "../../public/Featured icon.svg";
import closeIcon from "../../public/Icon.svg";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { useCampaigns } from "app/utils/CampaignsContext";
import Link from "next/link";
import { removeKeysRecursively } from "utils/removeID";
import { renderUploadedFile } from "components/data";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: string;
  channel: string;
  format: string;
  quantities: number;
  stageName: string;
  previews: Array<{ id: string; url: string }>;
}

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
    if (uploads?.length < 1) {
      toast.error("Please upload the required file before submitting.");
      return;
    }

    uploadFilesToStrapi();
  };

  const handleClose = () => {
    // Close the modal
    onClose();
  };

  const { campaignFormData, updateCampaign, getActiveCampaign, campaignData } =
    useCampaigns();
  const [uploads, setUploads] = useState<Array<File | null>>([]);
  const [uploadBlobs, setUploadBlobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize uploadBlobs with existing previews
  useEffect(() => {
    if (previews && previews.length > 0) {
      setUploadBlobs(previews.map((preview) => preview.url));
      setUploads(previews.map(() => null)); // Initialize uploads to match previews
    } else {
      setUploadBlobs(Array(quantities).fill(""));
      setUploads(Array(quantities).fill(null));
    }
  }, [previews, quantities]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes =
      format === "Video"
        ? ["video/mp4", "video/mov"]
        : format === "Slideshow"
        ? [
            "application/pdf",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          ]
        : ["image/jpeg", "image/png", "image/jpg"];
    const maxSizeInMB = 10;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      if (format === "Video") {
        toast.error("Invalid file type. Please upload a MP4 or MOV file.");
      } else if (format === "Slideshow") {
        toast.error("Invalid file type. Please upload a PDF or PPTX file.");
        return;
      } else {
        toast.error(
          "Invalid file type. Please upload a JPEG, PNG, or JPG file."
        );
        return;
      }
    }

    if (file.size > maxSizeInBytes) {
      toast.error(
        `File size exceeds ${maxSizeInMB}MB. Please upload a smaller file.`
      );
      return;
    }

    setUploads((prev) => {
      const updated = [...prev];
      updated[index] = file;
      return updated;
    });

    const objectUrl = URL.createObjectURL(file);
    setUploadBlobs((prev) => {
      const updated = [...prev];
      updated[index] = objectUrl;
      return updated;
    });

    e.target.value = ""; // Reset input
  };

  const handleDelete = (index: number) => {
    setUploads((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });

    setUploadBlobs((prev) => {
      const updated = [...prev];
      updated[index] = "";
      return updated;
    });
  };

  const uploadFilesToStrapi = async () => {
    if (!uploads.some((file) => file)) {
      toast.error("No files selected for upload.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      uploads.forEach((file) => {
        if (file) formData.append("files", file);
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload files to Strapi");
      }

      const uploadedFiles = await response.json();
      const formattedFiles = uploadedFiles.map((file) => ({
        id: file.id.toString(),
        url: file.url,
      }));

      await updateGlobalState(formattedFiles);
      toast.success("Files uploaded successfully!");
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateGlobalState = async (
    uploadedFiles: Array<{ id: string; url: string }>
  ) => {
    const updatedChannelMix = [...campaignFormData.channel_mix];

    const stage = updatedChannelMix.find((ch) => ch.funnel_stage === stageName);
    if (!stage) throw new Error("Stage not found");

    const platformKey = channel.toLowerCase().replace(/\s+/g, "_");
    const platforms = stage[platformKey];
    if (!platforms) throw new Error("Platform key not found");

    const targetPlatform = platforms.find(
      (pl) => pl.platform_name === platform
    );
    if (!targetPlatform) throw new Error("Target platform ltx not found");

    const targetFormatIndex = targetPlatform.format.findIndex(
      (fo) => fo.format_type === format
    );
    if (targetFormatIndex === -1) throw new Error("Target format not found");

    // Merge new uploads with existing previews
    const existingPreviews =
      targetPlatform.format[targetFormatIndex].previews || [];
    const newPreviews = [...existingPreviews, ...uploadedFiles];

    targetPlatform.format[targetFormatIndex].previews = newPreviews;

    const updatedState = {
      ...campaignData,
      channel_mix: updatedChannelMix,
    };

    await uploadUpdatedCampaignToStrapi(updatedState);
  };

  const uploadUpdatedCampaignToStrapi = async (data: any) => {
    try {
      const cleanData = removeKeysRecursively(
        data,
        ["id", "documentId", "createdAt", "publishedAt", "updatedAt"],
        ["previews"]
      );
      await updateCampaign(cleanData);
      await getActiveCampaign();
      onClose();
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast.error("Failed to save campaign data.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="relative bg-white w-full max-w-[771px] max-h-[90vh] rounded-[10px] shadow-md overflow-y-auto">
        <div className="p-8 flex flex-col gap-4">
          <div
            className="absolute right-10 top-10 cursor-pointer"
            onClick={onClose}
          >
            <Image src={closeIcon} className="size-4" alt="Close" />
          </div>

          <div className="flex flex-col items-center gap-4">
            <Image src={uploadIcon} alt="Upload" />
            <h2 className="font-bold text-xl tracking-tighter">
              Upload your previews
            </h2>
            <p className="font-lighter text-balance text-md text-black">
              Upload the visuals for your selected formats. Each visual should
              have a corresponding preview.
            </p>
          </div>

          <div className="flex flex-col mt-6 gap-4">
            <h2 className="font-bold text-xl text-center tracking-tighter">
              {format} ({platform} - {channel})
            </h2>

            <div className="flex justify-center gap-6 flex-wrap">
              {Array.from({ length: quantities }).map((_, index) => (
                <div
                  key={index}
                  className="w-[225px] h-[105px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors relative"
                >
                  {uploadBlobs[index] ? (
                    <>
                      <div className="w-full h-full">
                        {renderUploadedFile(uploadBlobs, format, index)}
                      </div>
                      <button
                        className="absolute right-2 top-2 bg-red-500 w-[20px] h-[20px] rounded-full flex justify-center items-center cursor-pointer"
                        onClick={() => handleDelete(index)}
                      >
                        <Trash color="white" size={10} />
                      </button>
                    </>
                  ) : (
                    <label
                      className="flex flex-col items-center gap-2 text-center cursor-pointer"
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
                        accept={
                          format === "Video"
                            ? "video/mp4,video/mov"
                            : format === "Slideshow"
                            ? "application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                            : "image/jpeg,image/png,image/jpg"
                        }
                        // "image/jpeg,image/png,image/jpg,video/mp4,video/mov,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        id={`upload${index}`}
                        className="hidden"
                        onChange={(e) => handleFileChange(e, index)}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row w-full justify-between gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 w-full sm:w-1/2 h-[44px] rounded-[8px] font-bold bg-white border border-gray-200 border-solid hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={uploadFilesToStrapi}
              className="px-4 py-2 w-full sm:w-1/2 h-[44px] font-bold bg-blue-600 rounded-[8px] text-white hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="animate-spin mx-auto" />
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
