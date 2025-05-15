"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { Trash } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";
import Link from "next/link";
import { useCampaigns } from "app/utils/CampaignsContext";
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
  adSetIndex?: number;
  onUploadSuccess?: () => void;
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
  adSetIndex,
  onUploadSuccess,
}) => {
  const { campaignFormData, updateCampaign, getActiveCampaign, campaignData, setCampaignData } = useCampaigns();
  const [uploads, setUploads] = useState<Array<File | null>>([]);
  const [uploadBlobs, setUploadBlobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [fileSizeErrors, setFileSizeErrors] = useState<string[]>([]);
  const [localPreviews, setLocalPreviews] = useState<Array<{ id: string; url: string }>>([]);
  const MAX_RETRIES = 3;
  const CONCURRENT_UPLOADS = 3;
  const UPLOAD_TIMEOUT = 30000; // Reduced to 30 seconds for faster feedback
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
  const MAX_FILE_SIZE = format === "Video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for videos, 10MB for others

  // Validate environment variables
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
  const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
  useEffect(() => {
    if (!STRAPI_URL || !STRAPI_TOKEN) {
      console.error("Missing Strapi configuration:", { STRAPI_URL, STRAPI_TOKEN });
      toast.error("Server configuration error. Please contact support.");
    }
  }, [STRAPI_URL, STRAPI_TOKEN]);

  // Initialize uploadBlobs, uploadProgress, and localPreviews
  useEffect(() => {
    if (previews && previews.length > 0) {
      setLocalPreviews(previews);
      setUploadBlobs(previews.map((preview) => preview.url));
      setUploads(previews.map(() => null));
      setUploadProgress(previews.map(() => 100));
      setFileSizeErrors(Array(previews.length).fill(""));
    } else {
      setLocalPreviews([]);
      setUploadBlobs(Array(quantities).fill(""));
      setUploads(Array(quantities).fill(null));
      setUploadProgress(Array(quantities).fill(0));
      setFileSizeErrors(Array(quantities).fill(""));
    }
  }, [previews, quantities]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const uploadUpdatedCampaignToStrapi = useCallback(
    async (data: any) => {
      try {
        const cleanData = removeKeysRecursively(
          data,
          ["id", "documentId", "createdAt", "publishedAt", "updatedAt", "_aggregated"],
          ["previews"],
        )
        await updateCampaign(cleanData)
        await getActiveCampaign()
      } catch (error) {
        console.error("Error in uploadUpdatedCampaignToStrapi:", error)
        toast.error("Failed to save campaign data.")
        throw error
      }
    },
    [updateCampaign, getActiveCampaign],
  )

  const updateGlobalState = useCallback(
    async (uploadedFiles: Array<{ id: string; url: string }>) => {
      if (!campaignFormData?.channel_mix) {
        throw new Error("campaignFormData or channel_mix is undefined");
      }

      const updatedChannelMix = [...campaignFormData.channel_mix];
      const stage = updatedChannelMix.find((ch) => ch.funnel_stage === stageName);
      if (!stage) {
        throw new Error("Stage not found");
      }

      const platformKey = channel.toLowerCase().replace(/\s+/g, "_");
      const platforms = stage[platformKey];
      if (!platforms) {
        throw new Error("Platform key not found");
      }

      const targetPlatform = platforms.find((pl) => pl.platform_name === platform);
      if (!targetPlatform) {
        throw new Error("Target platform not found");
      }

      const updatedPlatform = JSON.parse(JSON.stringify(targetPlatform));

      if (adSetIndex !== undefined) {
        if (!updatedPlatform.ad_sets?.[adSetIndex]) {
          throw new Error(`Ad set not found at index ${adSetIndex}`);
        }

        const adSet = updatedPlatform.ad_sets[adSetIndex];
        adSet.format = adSet.format || [];

        let targetFormatIndex = adSet.format.findIndex((fo: any) => fo.format_type === format);
        if (targetFormatIndex === -1) {
          adSet.format.push({
            format_type: format,
            num_of_visuals: quantities.toString(),
            previews: [],
          });
          targetFormatIndex = adSet.format.length - 1;
        }

        const validFiles = uploadedFiles.filter((file) => file !== null);
        adSet.format[targetFormatIndex].previews = [...validFiles];
      } else {
        updatedPlatform.format = updatedPlatform.format || [];

        let targetFormatIndex = updatedPlatform.format.findIndex((fo: any) => fo.format_type === format);
        if (targetFormatIndex === -1) {
          updatedPlatform.format.push({
            format_type: format,
            num_of_visuals: quantities.toString(),
            previews: [],
          });
          targetFormatIndex = updatedPlatform.format.length - 1;
        }

        const validFiles = uploadedFiles.filter((file) => file !== null);
        updatedPlatform.format[targetFormatIndex].previews = [...validFiles];
      }

      const platformIndex = platforms.findIndex((pl: any) => pl.platform_name === platform);
      platforms[platformIndex] = updatedPlatform;

      const updatedState = {
        ...campaignData,
        channel_mix: updatedChannelMix,
      };

      // Optimistically update local state
      setCampaignData(updatedState);

      // Update Strapi in the background
      try {
        const cleanData = removeKeysRecursively(
          updatedState,
          ["id", "documentId", "createdAt", "publishedAt", "updatedAt"],
          ["previews"],
        );
        await updateCampaign(cleanData);
        await getActiveCampaign();
      } catch (error) {
        console.error("Error updating campaign in Strapi:", error);
        toast.error("Failed to save campaign data. Changes may not persist.");
        // Revert optimistic update if needed
        await getActiveCampaign();
      }
    },
    [
      campaignFormData,
      campaignData,
      stageName,
      channel,
      platform,
      format,
      quantities,
      adSetIndex,
      setCampaignData,
      updateCampaign,
      getActiveCampaign,
    ],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      e.preventDefault();
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setFileSizeErrors((prev) => {
          const updated = [...prev];
          updated[index] = `File size (${formatFileSize(file.size)}) exceeds maximum limit of ${formatFileSize(
            MAX_FILE_SIZE,
          )}`;
          return updated;
        });
        return;
      } else {
        setFileSizeErrors((prev) => {
          const updated = [...prev];
          updated[index] = "";
          return updated;
        });
      }

      const allowedTypes =
        format === "Video"
          ? ["video/mp4", "video/mov", "video/quicktime"]
          : format === "Slideshow"
          ? ["application/pdf"]
          : ["image/jpeg", "image/png", "image/jpg"];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          format === "Video"
            ? "Invalid file type. Please upload an MP4 or MOV file."
            : format === "Slideshow"
            ? "Invalid file type. Please upload a PDF file."
            : "Invalid file type. Please upload a JPEG, PNG, or JPG file.",
        );
        return;
      }

      setUploadingIndex(index);

      try {
        const objectUrl = URL.createObjectURL(file);
        setUploads((prev) => {
          const updated = [...prev];
          updated[index] = file;
          return updated;
        });
        setUploadBlobs((prev) => {
          const updated = [...prev];
          updated[index] = objectUrl;
          return updated;
        });
        setUploadProgress((prev) => {
          const updated = [...prev];
          updated[index] = 0;
          return updated;
        });
      } catch (error) {
        console.error("Error processing file:", error);
        toast.error("Error processing file. Please try again.");
      } finally {
        setUploadingIndex(null);
      }

      e.target.value = "";
    },
    [format, MAX_FILE_SIZE],
  );

  const handleDelete = useCallback(
    async (index: number) => {
      try {
        setLoading(true);

        // Clear any file size errors
        setFileSizeErrors((prev) => {
          const updated = [...prev];
          updated[index] = "";
          return updated;
        });

        // Get the file ID before updating UI
        const fileToDelete = localPreviews[index]?.id;

        // Update local state
        setLocalPreviews((prev) => {
          const updated = [...prev];
          updated.splice(index, 1);
          return updated;
        });

        setUploads((prev) => {
          const updated = [...prev];
          updated[index] = null;
          return updated;
        });

        setUploadBlobs((prev) => {
          const updated = [...prev];
          if (updated[index] && updated[index].startsWith("blob:")) {
            URL.revokeObjectURL(updated[index]);
          }
          updated[index] = "";
          return updated;
        });

        setUploadProgress((prev) => {
          const updated = [...prev];
          updated[index] = 0;
          return updated;
        });

        // Delete from Strapi if file exists
        if (fileToDelete) {
          await fetch(`${STRAPI_URL}/upload/files/${fileToDelete}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${STRAPI_TOKEN}`,
            },
          });
        }

        // Update global state with remaining previews
        const updatedPreviews = localPreviews.filter((_, i) => i !== index);
        await updateGlobalState(updatedPreviews);

        toast.success("File deleted successfully!");
      } catch (error) {
        console.error("Error deleting file:", error);
        toast.error("Failed to delete file. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [localPreviews, updateGlobalState, STRAPI_URL, STRAPI_TOKEN],
  );

  const uploadChunk = useCallback(
    async (
      chunk: Blob,
      fileName: string,
      chunkIndex: number,
      totalChunks: number,
      fileId: string,
      retryCount = 0,
    ): Promise<void> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

        const formData = new FormData();
        formData.append("files", chunk, `${fileName}.part${chunkIndex}`);
        formData.append(
          "fileInfo",
          JSON.stringify({
            name: fileName,
            chunkIndex,
            totalChunks,
            fileId,
          }),
        );

        const response = await fetch(`${STRAPI_URL}/upload/chunk`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${STRAPI_TOKEN}`,
          },
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying chunk ${chunkIndex} for file "${fileName}" (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return uploadChunk(chunk, fileName, chunkIndex, totalChunks, fileId, retryCount + 1);
        }
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("Chunk upload timed out");
        }
        throw error;
      }
    },
    [STRAPI_URL, STRAPI_TOKEN, UPLOAD_TIMEOUT, MAX_RETRIES],
  );

  const finalizeUpload = useCallback(
    async (fileId: string, fileName: string, totalChunks: number, mimeType: string) => {
      try {
        const response = await fetch(`${STRAPI_URL}/upload/finalize`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${STRAPI_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileId,
            fileName,
            totalChunks,
            mimeType,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error finalizing upload:", error);
        throw error;
      }
    },
    [STRAPI_URL, STRAPI_TOKEN],
  );

  const uploadSingleFile = useCallback(
    async (file: File, index: number, retryCount = 0): Promise<any> => {
      try {
        // Skip compression for videos and PDFs
        let fileToUpload = file;
        if (file.type.startsWith("image/")) {
          const compressedFile = await new Promise<File>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const maxWidth = 800;
                const maxHeight = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                  if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                  }
                } else {
                  if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                  }
                }

                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                  (blob) => {
                    if (blob) {
                      resolve(new File([blob], file.name, { type: "image/jpeg" }));
                    }
                  },
                  "image/jpeg",
                  0.7,
                );
              };
              img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
          });
          fileToUpload = compressedFile;
        }

        const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        const totalChunks = Math.ceil(fileToUpload.size / CHUNK_SIZE);

        // For small files or when chunking is not needed
        if (totalChunks <= 1) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

          const formData = new FormData();
          formData.append("files", fileToUpload);

          const response = await fetch(`${STRAPI_URL}/upload`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${STRAPI_TOKEN}`,
            },
            body: formData,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          setUploadProgress((prev) => {
            const updated = [...prev];
            updated[index] = 100;
            return updated;
          });
          return result[0];
        }

        // Chunked upload for large files
        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, fileToUpload.size);
          const chunk = fileToUpload.slice(start, end);

          await uploadChunk(chunk, fileToUpload.name, i, totalChunks, fileId);

          // Update progress
          const progress = ((i + 1) / totalChunks) * 100;
          setUploadProgress((prev) => {
            const updated = [...prev];
            updated[index] = Math.min(progress, 99);
            return updated;
          });
        }

        // Finalize the upload
        const result = await finalizeUpload(fileId, fileToUpload.name, totalChunks, fileToUpload.type);
        setUploadProgress((prev) => {
          const updated = [...prev];
          updated[index] = 100;
          return updated;
        });
        return result;
      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying upload for file "${file.name}" (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return uploadSingleFile(file, index, retryCount + 1);
        }
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("Upload timed out");
        }
        throw error;
      }
    },
    [STRAPI_URL, STRAPI_TOKEN, uploadChunk, finalizeUpload, UPLOAD_TIMEOUT, MAX_RETRIES],
  );

  const uploadFilesToStrapi = useCallback(async () => {
    if (!uploads.some((file) => file)) {
      toast.error("No files selected for upload.");
      return;
    }

    // Check for any file size errors before proceeding
    if (fileSizeErrors.some((error) => error !== "")) {
      toast.error("Please fix file size issues before uploading.");
      return;
    }

    setLoading(true);

    try {
      const filesToUpload = uploads
        .map((file, index) => ({ file, index }))
        .filter((item): item is { file: File; index: number } => item.file !== null);

      const results = [];
      for (let i = 0; i < filesToUpload.length; i += CONCURRENT_UPLOADS) {
        const chunk = filesToUpload.slice(i, i + CONCURRENT_UPLOADS);
        const chunkResults = await Promise.all(
          chunk.map(async ({ file, index }) => {
            try {
              const result = await uploadSingleFile(file, index);
              return result;
            } catch (error) {
              console.error(`Failed to upload file "${file.name}"`, error);
              toast.error(`Failed to upload ${file.name}`);
              return null;
            }
          }),
        );
        results.push(...chunkResults);
      }

      const uploadedFiles = results.filter((result) => result !== null);

      if (uploadedFiles.length === 0) {
        throw new Error("All file uploads failed");
      }

      const formattedFiles = uploadedFiles.map((file) => ({
        id: file.id.toString(),
        url: file.url || file.formats?.thumbnail?.url || file.url,
      }));

      const allPreviews = [...localPreviews];
      filesToUpload.forEach(({ index }, i) => {
        if (formattedFiles[i]) {
          allPreviews[index] = formattedFiles[i];
        }
      });

      const validPreviews = allPreviews.filter((preview) => preview);
      setLocalPreviews(validPreviews);

      // Update global state immediately
      await updateGlobalState(validPreviews);

      toast.success("Files uploaded successfully!");

      // Close modal quickly
      onUploadSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error in uploadFilesToStrapi:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [uploads, localPreviews, updateGlobalState, onUploadSuccess, onClose, uploadSingleFile, fileSizeErrors]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="relative bg-white w-full max-w-[771px] max-h-[90vh] rounded-[10px] shadow-md overflow-y-auto">
        <div className="p-8 flex flex-col gap-4">
          <div className="absolute right-10 top-10 cursor-pointer" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="#667085"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex flex-col items-center gap-4">
            <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="46" height="46" rx="23" fill="#EFF8FF" />
              <path
                d="M23 14V32M23 14L17 20M23 14L29 20"
                stroke="#2E90FA"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M32 32H14" stroke="#2E90FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="font-bold text-xl tracking-tighter">Upload your previews</h2>
            <p className="font-lighter text-balance text-md text-black text-center">
              Upload the visuals for your selected formats. Each visual should have a corresponding preview.
              Maximum file size: {formatFileSize(MAX_FILE_SIZE)}.
            </p>
          </div>

          <div className="flex flex-col mt-6 gap-4">
            <h2 className="font-bold text-xl text-center tracking-tighter">
              {format} ({platform} - {channel})
            </h2>

            <div className="flex justify-center gap-6 flex-wrap">
              {Array.from({ length: quantities }).map((_, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div
                    className={`w-[225px] h-[105px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors relative ${
                      loading ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                    onClick={() => !loading && document.getElementById(`upload${index}`)?.click()}
                  >
                    {uploadingIndex === index || (loading && uploadProgress[index] > 0 && uploadProgress[index] < 100) ? (
                      <div className="flex flex-col items-center justify-center">
                        <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                        <span className="text-sm">{Math.round(uploadProgress[index])}%</span>
                      </div>
                    ) : uploadBlobs[index] ? (
                      <>
                        <Link
                          href={uploadBlobs[index]}
                          target="_blank"
                          className="w-full h-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {renderUploadedFile(uploadBlobs, format, index)}
                        </Link>
                        <button
                          className={`absolute right-2 top-2 bg-red-500 w-[20px] h-[20px] rounded-full flex justify-center items-center ${
                            loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!loading) handleDelete(index);
                          }}
                          disabled={loading}
                        >
                          <Trash color="white" size={10} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M0.925781 14.8669H15.9258V16.5335H0.925781V14.8669ZM9.25911 3.89055V13.2002H7.59245V3.89055L2.53322 8.94978L1.35471 7.77128L8.42578 0.700195L15.4969 7.77128L14.3184 8.94978L9.25911 3.89055Z"
                            fill="#3175FF"
                          />
                        </svg>
                        <p className="text-md text-black font-lighter mt-2">Upload visual {index + 1}</p>
                        <input
                          type="file"
                          accept={
                            format === "Video"
                              ? "video/mp4,video/mov,video/quicktime"
                              : format === "Slideshow"
                              ? "application/pdf"
                              : "image/jpeg,image/png,image/jpg"
                          }
                          id={`upload${index}`}
                          className="hidden"
                          onChange={(e) => handleFileChange(e, index)}
                        />
                      </div>
                    )}
                  </div>
                  {fileSizeErrors[index] && (
                    <p className="text-red-500 text-sm text-center">{fileSizeErrors[index]}</p>
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
              disabled={loading || fileSizeErrors.some((error) => error !== "")}
            >
              {loading ? <FaSpinner className="animate-spin mx-auto" /> : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;