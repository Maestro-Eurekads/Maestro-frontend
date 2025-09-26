"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { Trash } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import Link from "next/link";
import { useCampaigns } from "app/utils/CampaignsContext";
import { removeKeysRecursively } from "utils/removeID";
import { renderUploadedFile } from "components/data";
import { useActive } from "app/utils/ActiveContext";
import axios from "axios";

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
  const {
    campaignFormData,
    updateCampaign,
    getActiveCampaign,
    campaignData,
    setCampaignData,
    jwt,
  } = useCampaigns();
  const { active } = useActive();
  const [uploads, setUploads] = useState<Array<File | null>>([]);
  const [uploadBlobs, setUploadBlobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [fileSizeErrors, setFileSizeErrors] = useState<string[]>([]);
  const [localPreviews, setLocalPreviews] = useState<
    Array<{ id: string; url: string }>
  >([]);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const MAX_RETRIES = 3;
  // Increase concurrent uploads for videos, or set to 1 for videos to avoid server overload
  // Strapi's /upload endpoint can have issues with concurrent large video uploads
  // We'll upload videos sequentially, images concurrently
  const CONCURRENT_UPLOADS = format === "Video" ? 1 : 3;
  const UPLOAD_TIMEOUT = 120000; // Increase timeout to 2 minutes for large videos
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks (not used for Strapi default)
  const MAX_FILE_SIZE =
    format === "Video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for videos, 10MB for others

  // Validate environment variables
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
  const STRAPI_TOKEN = jwt;
  useEffect(() => {
    if (!STRAPI_URL || !STRAPI_TOKEN) {
      console.error("Missing Strapi configuration:", {
        STRAPI_URL,
        STRAPI_TOKEN,
      });
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
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  // Utility function to validate file references before saving
  const validateFileReferences = useCallback(async (channelMix: any[]) => {
    if (!channelMix || !Array.isArray(channelMix)) return true;

    try {
      // Check if any file references exist in the channel mix
      const hasFileReferences = channelMix.some(stage => {
        if (!stage) return false;

        const mediaTypes = ["social_media", "display_networks", "search_engines", "streaming", "ooh", "broadcast", "messaging", "print", "e_commerce", "in_game", "mobile"];

        return mediaTypes.some(mediaType => {
          const platforms = stage[mediaType];
          if (!Array.isArray(platforms)) return false;

          return platforms.some(platform => {
            // Check platform-level formats
            if (platform?.format?.some(f => f?.previews?.length > 0)) return true;

            // Check ad set-level formats
            if (platform?.ad_sets?.some(adSet =>
              adSet?.format?.some(f => f?.previews?.length > 0)
            )) return true;

            return false;
          });
        });
      });

      if (!hasFileReferences) return true;

      // If we have file references, we could add validation here
      // For now, we'll let Strapi handle the validation
      return true;
    } catch (error) {
      console.error("Error validating file references:", error);
      return false;
    }
  }, []);

  const uploadUpdatedCampaignToStrapi = useCallback(
    async (data: any) => {
      // Check if campaign exists before attempting to save
      if (!campaignData?.id && !campaignFormData?.cId) {
        console.warn(
          "No campaign exists yet. File upload will be saved locally only."
        );
        toast.warning(
          "Please save your campaign first (Step 0) to persist file uploads."
        );
        return;
      }

      try {
        // Use the same robust data handling approach as SaveAllProgressButton
        const cleanedData = JSON.parse(JSON.stringify(data));

        // Clean the main data object to remove forbidden fields
        const cleanedMainData = removeKeysRecursively(cleanedData, [
          "id",
          "documentId",
          "_aggregated",
          "user",
          "publishedAt",
          "createdAt",
          "updatedAt",
        ]);

        // Clean channel mix data using the same approach as SaveAllProgressButton
        let channelMixCleaned = cleanedMainData?.channel_mix
          ? removeKeysRecursively(cleanedMainData.channel_mix, [
            "id",
            "isValidated",
            "formatValidated",
            "validatedStages",
            "documentId",
            "_aggregated",
            "user",
            "publishedAt",
            "createdAt",
            "updatedAt",
          ])
          : [];

        // Build a structured payload similar to SaveAllProgressButton
        const payload = {
          data: {
            channel_mix: channelMixCleaned,
            // Include other essential fields if they exist
            ...(cleanedData.funnel_stages && {
              funnel_stages: cleanedData.funnel_stages,
            }),
            ...(cleanedData.funnel_type && {
              funnel_type: cleanedData.funnel_type,
            }),
            ...(cleanedData.ad_sets_granularity && {
              ad_sets_granularity: cleanedData.ad_sets_granularity,
            }),
            // Remove granularity field as it's not allowed in Strapi schema
          },
        };

        // Use the same axios approach as SaveAllProgressButton
        const config = {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        };

        // Use the same campaign ID logic as SaveAllProgressButton
        const campaignId = campaignFormData?.cId;

        if (!campaignId) {
          console.warn("No campaign ID found, cannot save file uploads");
          toast.warning(
            "Please save your campaign first (Step 0) to persist file uploads."
          );
          return;
        }



        await axios.put(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${campaignId}`,
          payload,
          config
        );

        if (active !== 7) {
          await getActiveCampaign();
        }
        toast.success("File upload saved successfully!");
      } catch (error) {
        // Enhanced error logging for debugging
        console.error("Full error object:", error);

        // Handle specific Strapi upload file relation errors
        if (error?.response?.data?.message?.includes("plugin::upload.file associated with this entity do not exist")) {
          console.error("Upload file relation error detected:", error.response.data);
          toast.error("File upload failed: Some uploaded files are no longer available. Please re-upload the files.");
          return;
        }
        console.error("Error response:", error?.response);
        console.error("Error response data:", error?.response?.data);
        console.error("Error in uploadUpdatedCampaignToStrapi:", error);
        if (error?.response?.status === 401) {
          const event = new Event("unauthorizedEvent");
          window.dispatchEvent(event);
        } else if (error?.response?.status === 404) {
          toast.error("Campaign not found. Please save your campaign first.");
        } else if (error?.response?.status === 400) {
          // Handle specific validation errors
          if (error?.response?.data?.message === "Invalid key documentId") {
            toast.error(
              "Data validation error: Invalid documentId field. Please contact support."
            );
          } else if (
            error?.response?.data?.message === "Invalid key granularity"
          ) {
            toast.error(
              "Data validation error: Invalid granularity field. Please contact support."
            );
          } else {
            const errorMessage =
              error?.response?.data?.error?.message ||
              error?.response?.data?.message ||
              "Invalid data provided. Please check your inputs.";
            toast.error(errorMessage);
          }
        } else if (error?.response?.status === 422) {
          toast.error("Validation failed. Please check your campaign data.");
        } else if (error?.response?.status >= 500) {
          toast.error("Server error. Please try again later.");
        } else if (error?.message) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong. Please try again.");
        }
        throw error;
      }
    },
    [campaignFormData, jwt, active, getActiveCampaign]
  );

  const updateGlobalState = useCallback(
    async (uploadedFiles: Array<{ id: string; url: string }>) => {
      // Check if campaign exists before attempting any operations
      const hasCampaignId = campaignData?.id || campaignFormData?.cId;

      if (!hasCampaignId) {
        console.warn(
          "No campaign exists yet. File upload will be saved locally only.",
          {
            campaignDataId: campaignData?.id,
            campaignFormDataId: campaignFormData?.cId,
          }
        );
        toast.warning(
          "Please save your campaign first (Step 0) to persist file uploads."
        );
        return;
      }

      if (!campaignFormData?.channel_mix) {
        throw new Error("campaignFormData or channel_mix is undefined");
      }

      const updatedChannelMix = [...campaignFormData.channel_mix];
      const stage = updatedChannelMix.find(
        (ch) => ch.funnel_stage === stageName
      );
      if (!stage) {
        throw new Error("Stage not found");
      }

      const platformKey = channel.toLowerCase().replace(/\s+/g, "_");
      const platforms = stage[platformKey];
      if (!platforms) {
        throw new Error("Platform key not found");
      }

      const targetPlatform = platforms.find(
        (pl) => pl.platform_name === platform
      );
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

        let targetFormatIndex = adSet.format.findIndex(
          (fo: any) => fo.format_type === format
        );
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

        let targetFormatIndex = updatedPlatform.format.findIndex(
          (fo: any) => fo.format_type === format
        );
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

      const platformIndex = platforms.findIndex(
        (pl: any) => pl.platform_name === platform
      );
      platforms[platformIndex] = updatedPlatform;

      const updatedState = {
        ...campaignFormData, // Use campaignFormData instead of campaignData to preserve current form state
        channel_mix: updatedChannelMix,
      };

      // Optimistically update local state
      setCampaignData(updatedState);

      // Update Strapi in the background using the same robust approach
      try {
        // Use the same robust data handling approach as SaveAllProgressButton
        const cleanedData = JSON.parse(JSON.stringify(updatedState));

        // Clean the main data object to remove forbidden fields
        const cleanedMainData = removeKeysRecursively(cleanedData, [
          "id",
          "documentId",
          "_aggregated",
          "user",
          "publishedAt",
          "createdAt",
          "updatedAt",
        ]);

        // Clean channel mix data using the same approach as SaveAllProgressButton
        let channelMixCleaned = cleanedMainData?.channel_mix
          ? removeKeysRecursively(cleanedMainData.channel_mix, [
            "id",
            "isValidated",
            "formatValidated",
            "validatedStages",
            "documentId",
            "_aggregated",
            "user",
            "publishedAt",
            "createdAt",
            "updatedAt",
          ])
          : [];

        // Build a structured payload similar to SaveAllProgressButton
        const payload = {
          data: {
            channel_mix: channelMixCleaned,
            // Include other essential fields if they exist
            ...(cleanedMainData.funnel_stages && {
              funnel_stages: cleanedMainData.funnel_stages,
            }),
            ...(cleanedMainData.funnel_type && {
              funnel_type: cleanedMainData.funnel_type,
            }),
            ...(cleanedMainData.ad_sets_granularity && {
              ad_sets_granularity: cleanedMainData.ad_sets_granularity,
            }),
            // Remove granularity field as it's not allowed in Strapi schema
          },
        };

        // Use the same axios approach as SaveAllProgressButton
        const config = {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        };

        // Use the same campaign ID logic as SaveAllProgressButton
        const campaignId = campaignFormData?.cId;

        if (!campaignId) {
          console.warn("No campaign ID found, cannot save file uploads");
          toast.warning(
            "Please save your campaign first (Step 0) to persist file uploads."
          );
          return;
        }



        await axios.put(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${campaignId}`,
          payload,
          config
        );

        if (active !== 7) {
          await getActiveCampaign();
        }
      } catch (error) {
        // Enhanced error logging for debugging
        console.error("Full error object:", error);
        console.error("Error response:", error?.response);
        console.error("Error response data:", error?.response?.data);
        console.error("Error in updateGlobalState:", error);
        if (error?.response?.status === 401) {
          const event = new Event("unauthorizedEvent");
          window.dispatchEvent(event);
        } else if (error?.response?.status === 404) {
          toast.error("Campaign not found. Please save your campaign first.");
        } else if (error?.response?.status === 400) {
          // Handle specific validation errors
          if (error?.response?.data?.message === "Invalid key documentId") {
            toast.error(
              "Data validation error: Invalid documentId field. Please contact support."
            );
          } else if (
            error?.response?.data?.message === "Invalid key granularity"
          ) {
            toast.error(
              "Data validation error: Invalid granularity field. Please contact support."
            );
          } else {
            const errorMessage =
              error?.response?.data?.error?.message ||
              error?.response?.data?.message ||
              "Invalid data provided. Please check your inputs.";
            toast.error(errorMessage);
          }
        } else if (error?.response?.status === 422) {
          toast.error("Validation failed. Please check your campaign data.");
        } else if (error?.response?.status >= 500) {
          toast.error("Server error. Please try again later.");
        } else if (error?.message) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong. Please try again.");
        }
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
      getActiveCampaign,
      jwt,
    ]
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
          updated[index] = `File size (${formatFileSize(
            file.size
          )}) exceeds maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`;
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
              : "Invalid file type. Please upload a JPEG, PNG, or JPG file."
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
        if (error?.response?.status === 401) {
          const event = new Event("unauthorizedEvent");
          window.dispatchEvent(event);
        }
        toast.error("Error processing file. Please try again.");
      } finally {
        setUploadingIndex(null);
      }

      e.target.value = "";
    },
    [format, MAX_FILE_SIZE]
  );

  const handleDelete = useCallback(
    async (index: number) => {
      try {
        // Set loading state for this specific file
        setDeletingIndex(index);

        // Clear any file size errors
        setFileSizeErrors((prev) => {
          const updated = [...prev];
          updated[index] = "";
          return updated;
        });

        // Check if this is a local file (just uploaded, not saved to DB) or a DB file
        const fileToDelete = localPreviews[index]?.id;
        const isLocalFile = uploads[index] && !fileToDelete;
        const isDbFile = fileToDelete && localPreviews[index];

        if (isLocalFile) {
          // Just a local file that hasn't been saved to DB - clear immediately
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

          toast.success("File cleared successfully!");
        } else if (isDbFile) {
          // File exists in database - delete from Strapi with loading state
          try {
            const deleteResponse = await fetch(
              `${STRAPI_URL}/upload/files/${fileToDelete}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${jwt}`,
                },
              }
            );

            if (!deleteResponse.ok) {
              throw new Error(
                `Failed to delete file from server: ${deleteResponse.status}`
              );
            }

            // Only update UI state after successful deletion from database
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

            // Show success message immediately after UI update
            toast.success("File deleted successfully!");

            // Update global state in background (don't wait for this)
            const updatedPreviews = localPreviews.filter((_, i) => i !== index);

            // Only call updateGlobalState if we have valid previews or if this was the last preview
            if (updatedPreviews.length > 0 || localPreviews.length === 1) {
              updateGlobalState(updatedPreviews).catch((error) => {
                console.error(
                  "Error updating global state after deletion:",
                  error
                );
                // Don't show error to user since file was already deleted successfully
              });
            } else {
              // If no previews left, just update local state without calling updateGlobalState

            }
          } catch (error) {
            if (error?.response?.status === 401) {
              const event = new Event("unauthorizedEvent");
              window.dispatchEvent(event);
            }
            toast.error(
              "Failed to delete file from database. Please try again."
            );
            return;
          }
        } else {
          // Empty slot - just clear
          setUploadBlobs((prev) => {
            const updated = [...prev];
            updated[index] = "";
            return updated;
          });
          toast.success("Slot cleared!");
        }
      } catch (error) {
        if (error?.response?.status === 401) {
          const event = new Event("unauthorizedEvent");
          window.dispatchEvent(event);
        }
        toast.error("Failed to delete file. Please try again.");
      } finally {
        setDeletingIndex(null);
      }
    },
    [
      localPreviews,
      uploads,
      updateGlobalState,
      getActiveCampaign,
      STRAPI_URL,
      jwt,
    ]
  );

  // --- CHUNKED UPLOAD LOGIC REWRITE FOR "METHOD NOT ALLOWED" ERROR ---
  // Instead of using /upload/chunk and /upload/finalize, use only /upload (Strapi default)
  // If you want to support chunked upload, you must have a custom backend route for it.
  // Here, we fallback to default Strapi /upload endpoint for all files.

  const uploadSingleFile = useCallback(
    async (file: File, index: number, retryCount = 0): Promise<any> => {


      // Validate file before upload
      if (!file || file.size === 0) {
        throw new Error("Invalid file: File is empty or undefined");
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error(
          `File size (${formatFileSize(
            file.size
          )}) exceeds maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`
        );
      }

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
                      resolve(
                        new File([blob], file.name, { type: "image/jpeg" })
                      );
                    }
                  },
                  "image/jpeg",
                  0.7
                );
              };
              img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
          });
          fileToUpload = compressedFile;
        }

        // Always use /upload endpoint (Strapi default)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

        const formData = new FormData();
        formData.append("files", fileToUpload);

        const response = await fetch(`${STRAPI_URL}/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Enhanced error handling for different HTTP status codes
          let errorMessage = `HTTP error! status: ${response.status}`;

          try {
            const errorData = await response.json();
            console.error("Upload error response:", errorData);

            if (response.status === 405) {
              errorMessage =
                "Upload failed: Method Not Allowed. Please contact support.";
            } else if (response.status === 400) {
              errorMessage = `Upload validation error: ${errorData.message || "Invalid file format or size"
                }`;
            } else if (response.status === 401) {
              errorMessage =
                "Upload failed: Unauthorized. Please check your session.";
            } else if (response.status === 413) {
              errorMessage = "Upload failed: File too large.";
            } else if (response.status >= 500) {
              errorMessage = `Upload failed: Server error (${response.status}). Please try again later.`;
            } else if (errorData.message) {
              errorMessage = `Upload failed: ${errorData.message}`;
            }
          } catch (parseError) {
            console.error("Could not parse error response:", parseError);
          }

          throw new Error(errorMessage);
        }

        const result = await response.json();

        setUploadProgress((prev) => {
          const updated = [...prev];
          updated[index] = 100;
          return updated;
        });
        return result[0];
      } catch (error: any) {
        if (
          retryCount < MAX_RETRIES &&
          (!error || error.name !== "AbortError")
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
          return uploadSingleFile(file, index, retryCount + 1);
        }
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("Upload timed out");
        }
        throw error;
      }
    },
    [STRAPI_URL, STRAPI_TOKEN, UPLOAD_TIMEOUT, MAX_RETRIES]
  );

  // --- REWRITE: uploadFilesToStrapi to support multiple video uploads reliably ---
  // For videos, upload sequentially (CONCURRENT_UPLOADS=1), for images use concurrency.
  // This avoids Strapi's /upload endpoint failing with multiple large files.

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

    // Check if campaign exists before proceeding with upload
    if (!campaignData?.id && !campaignFormData?.cId) {
      toast.error(
        "Please save your campaign first before uploading files. Your uploads will not be persisted."
      );
      return;
    }

    setLoading(true);

    try {
      const filesToUpload = uploads
        .map((file, index) => ({ file, index }))
        .filter(
          (item): item is { file: File; index: number } => item.file !== null
        );


      const results: any[] = [];

      if (format === "Video") {
        // Sequential upload for videos
        for (let i = 0; i < filesToUpload.length; i++) {
          const { file, index } = filesToUpload[i];
          try {
            const result = await uploadSingleFile(file, index);
            results.push(result);
          } catch (error: any) {
            console.error(`Failed to upload file "${file.name}"`, error);

            // Enhanced error handling with specific messages
            if (error?.message?.includes("Method Not Allowed")) {
              toast.error(
                "Upload failed: Method Not Allowed. Please contact support."
              );
            } else if (error?.message?.includes("timed out")) {
              toast.error(
                `Upload timed out for ${file.name}. Try a smaller file or check your connection.`
              );
            } else if (error?.message?.includes("validation error")) {
              toast.error(
                `Upload validation error for ${file.name}: ${error.message}`
              );
            } else if (error?.message?.includes("Server error")) {
              toast.error(
                `Upload server error for ${file.name}: ${error.message}`
              );
            } else if (error?.message?.includes("Unauthorized")) {
              toast.error(
                `Upload unauthorized for ${file.name}: ${error.message}`
              );
            } else if (error?.message?.includes("File too large")) {
              toast.error(`Upload failed for ${file.name}: ${error.message}`);
            } else {
              toast.error(
                `Failed to upload ${file.name}: ${error.message || "Unknown error"
                }`
              );
            }

            results.push(null);
          }
        }
      } else {
        // Concurrent upload for images/pdfs
        for (let i = 0; i < filesToUpload.length; i += CONCURRENT_UPLOADS) {
          const chunk = filesToUpload.slice(i, i + CONCURRENT_UPLOADS);
          const chunkResults = await Promise.all(
            chunk.map(async ({ file, index }) => {
              try {
                const result = await uploadSingleFile(file, index);
                return result;
              } catch (error: any) {
                console.error(`Failed to upload file "${file.name}"`, error);

                // Enhanced error handling with specific messages
                if (error?.message?.includes("Method Not Allowed")) {
                  toast.error(
                    "Upload failed: Method Not Allowed. Please contact support."
                  );
                } else if (error?.message?.includes("timed out")) {
                  toast.error(
                    `Upload timed out for ${file.name}. Try a smaller file or check your connection.`
                  );
                } else if (error?.message?.includes("validation error")) {
                  toast.error(
                    `Upload validation error for ${file.name}: ${error.message}`
                  );
                } else if (error?.message?.includes("Server error")) {
                  toast.error(
                    `Upload server error for ${file.name}: ${error.message}`
                  );
                } else if (error?.message?.includes("Unauthorized")) {
                  toast.error(
                    `Upload unauthorized for ${file.name}: ${error.message}`
                  );
                } else if (error?.message?.includes("File too large")) {
                  toast.error(
                    `Upload failed for ${file.name}: ${error.message}`
                  );
                } else {
                  toast.error(
                    `Failed to upload ${file.name}: ${error.message || "Unknown error"
                    }`
                  );
                }

                return null;
              }
            })
          );
          results.push(...chunkResults);
        }
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
    } catch (error: any) {
      console.error("Error in uploadFilesToStrapi:", error);

      // Enhanced error handling with specific messages
      if (error?.message?.includes("Method Not Allowed")) {
        toast.error(
          "Upload failed: Method Not Allowed. Please contact support."
        );
      } else if (error?.message?.includes("timed out")) {
        toast.error(
          "Upload timed out. Try a smaller file or check your connection."
        );
      } else if (error?.message?.includes("validation error")) {
        toast.error(`Upload validation error: ${error.message}`);
      } else if (error?.message?.includes("Server error")) {
        toast.error(`Upload server error: ${error.message}`);
      } else if (error?.message?.includes("Unauthorized")) {
        toast.error(`Upload unauthorized: ${error.message}`);
      } else if (error?.message?.includes("File too large")) {
        toast.error(`Upload failed: ${error.message}`);
      } else if (error?.message?.includes("All file uploads failed")) {
        toast.error(
          "All file uploads failed. Please check the error messages above and try again."
        );
      } else {
        toast.error(
          `Upload failed: ${error.message || "Unknown error"
          }. Please try again.`
        );
      }
    } finally {
      setLoading(false);
    }
  }, [
    uploads,
    localPreviews,
    updateGlobalState,
    onUploadSuccess,
    onClose,
    uploadSingleFile,
    fileSizeErrors,
    format,
    CONCURRENT_UPLOADS,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="relative bg-white w-full max-w-[771px] max-h-[90vh] rounded-[10px] shadow-md overflow-y-auto">
        <div className="p-8 flex flex-col gap-4">
          <div
            className="absolute right-10 top-10 cursor-pointer"
            onClick={onClose}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
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
            <svg
              width="46"
              height="46"
              viewBox="0 0 46 46"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <rect width="46" height="46" rx="23" fill="#EFF8FF" />
              <path
                d="M23 14V32M23 14L17 20M23 14L29 20"
                stroke="#2E90FA"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M32 32H14"
                stroke="#2E90FA"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="font-bold text-xl tracking-tighter">
              Upload your previews
            </h2>
            <p className="font-lighter text-balance text-md text-black text-center">
              Upload the visuals for your selected formats. Each visual should
              have a corresponding preview. Maximum file size:{" "}
              {formatFileSize(MAX_FILE_SIZE)}.
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
                    className={`w-[225px] h-[105px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors relative ${loading ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                    onClick={() =>
                      !loading &&
                      document.getElementById(`upload${index}`)?.click()
                    }>
                    {uploadingIndex === index ||
                      (loading &&
                        uploadProgress[index] > 0 &&
                        uploadProgress[index] < 100) ? (
                      <div className="flex flex-col items-center justify-center">
                        <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                        <span className="text-sm">
                          {Math.round(uploadProgress[index])}%
                        </span>
                      </div>
                    ) : uploadBlobs[index] ? (
                      <>
                        <Link
                          href={uploadBlobs[index]}
                          target="_blank"
                          className="w-full h-full"
                          onClick={(e) => e.stopPropagation()}>
                          {renderUploadedFile(uploadBlobs, format, index)}
                        </Link>
                        <button
                          className={`absolute right-2 top-2 w-[20px] h-[20px] rounded-full flex justify-center items-center ${deletingIndex === index
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-500 cursor-pointer"
                            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!loading && deletingIndex !== index)
                              handleDelete(index);
                          }}
                          disabled={loading || deletingIndex === index}>
                          {deletingIndex === index ? (
                            <FaSpinner
                              className="animate-spin text-white"
                              size={8}
                            />
                          ) : (
                            <Trash color="white" size={10} />
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <svg
                          width="16"
                          height="17"
                          viewBox="0 0 16 17"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg">
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
                    <p className="text-red-500 text-sm text-center">
                      {fileSizeErrors[index]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row w-full justify-between gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 w-full sm:w-1/2 h-[44px] rounded-[8px] font-bold bg-white border border-gray-200 border-solid hover:bg-gray-100 transition-colors"
              disabled={loading}>
              Cancel
            </button>
            <button
              onClick={uploadFilesToStrapi}
              className="px-4 py-2 w-full sm:w-1/2 h-[44px] font-bold bg-blue-600 rounded-[8px] text-white hover:bg-blue-700 transition-colors"
              disabled={
                loading || fileSizeErrors.some((error) => error !== "")
              }>
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
