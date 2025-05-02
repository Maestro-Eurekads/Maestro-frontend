"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { Trash } from "lucide-react"
import { FaSpinner } from "react-icons/fa"
import toast from "react-hot-toast"
import Link from "next/link"
import { useCampaigns } from "app/utils/CampaignsContext"
import { removeKeysRecursively } from "utils/removeID"
import { renderUploadedFile } from "components/data"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  platform: string
  channel: string
  format: string
  quantities: number
  stageName: string
  previews: Array<{ id: string; url: string }>
  adSetIndex?: number
  onUploadSuccess?: () => void
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
  const { campaignFormData, updateCampaign, getActiveCampaign, campaignData } = useCampaigns()
  const [uploads, setUploads] = useState<Array<File | null>>([])
  const [uploadBlobs, setUploadBlobs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number[]>([])
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const MAX_RETRIES = 2
  const CONCURRENT_UPLOADS = 3

  // Initialize uploadBlobs and uploadProgress
  useEffect(() => {
    if (previews && previews.length > 0) {
      setUploadBlobs(previews.map((preview) => preview.url))
      setUploads(previews.map(() => null))
      setUploadProgress(previews.map(() => 100))
    } else {
      setUploadBlobs(Array(quantities).fill(""))
      setUploads(Array(quantities).fill(null))
      setUploadProgress(Array(quantities).fill(0))
    }
  }, [previews, quantities])

  const uploadUpdatedCampaignToStrapi = useCallback(
    async (data: any) => {
      try {
        const cleanData = removeKeysRecursively(
          data,
          ["id", "documentId", "createdAt", "publishedAt", "updatedAt"],
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
        throw new Error("campaignFormData or channel_mix is undefined")
      }

      const updatedChannelMix = [...campaignFormData.channel_mix]
      const stage = updatedChannelMix.find((ch) => ch.funnel_stage === stageName)
      if (!stage) {
        throw new Error("Stage not found")
      }

      const platformKey = channel.toLowerCase().replace(/\s+/g, "_")
      const platforms = stage[platformKey]
      if (!platforms) {
        throw new Error("Platform key not found")
      }

      const targetPlatform = platforms.find((pl) => pl.platform_name === platform)
      if (!targetPlatform) {
        throw new Error("Target platform not found")
      }

      // Handle both channel and ad set formats
      if (adSetIndex !== undefined) {
        // Update ad set format
        if (!targetPlatform.ad_sets?.[adSetIndex]) {
          throw new Error(`Ad set not found at index ${adSetIndex}`)
        }
        
        const adSet = targetPlatform.ad_sets[adSetIndex]
        adSet.format = adSet.format || []
        
        let targetFormatIndex = adSet.format.findIndex((fo) => fo.format_type === format)
        if (targetFormatIndex === -1) {
          adSet.format.push({
            format_type: format,
            num_of_visuals: quantities.toString(),
            previews: [],
          })
          targetFormatIndex = adSet.format.length - 1
        }

        // Filter out any null uploads and only keep the successfully uploaded files
        const validFiles = uploadedFiles.filter(file => file !== null)
        adSet.format[targetFormatIndex].previews = [...validFiles]
      } else {
        // Update platform format
        targetPlatform.format = targetPlatform.format || []
        
        let targetFormatIndex = targetPlatform.format.findIndex((fo) => fo.format_type === format)
        if (targetFormatIndex === -1) {
          targetPlatform.format.push({
            format_type: format,
            num_of_visuals: quantities.toString(),
            previews: [],
          })
          targetFormatIndex = targetPlatform.format.length - 1
        }

        // Filter out any null uploads and only keep the successfully uploaded files
        const validFiles = uploadedFiles.filter(file => file !== null)
        targetPlatform.format[targetFormatIndex].previews = [...validFiles]
      }

      const updatedState = {
        ...campaignData,
        channel_mix: updatedChannelMix,
      }

      await uploadUpdatedCampaignToStrapi(updatedState)
    },
    [campaignFormData, campaignData, stageName, channel, platform, format, quantities, adSetIndex, uploadUpdatedCampaignToStrapi],
  )

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      e.preventDefault()
      const file = e.target.files?.[0]
      if (!file) return

      const allowedTypes = format === "Slideshow" 
        ? ["application/pdf"] 
        : format === "Video" 
          ? ["video/mp4", "video/mov", "video/quicktime"] 
          : ["image/jpeg", "image/png", "image/jpg"]
      const maxSizeInMB = 20
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          format === "Video"
            ? "Invalid file type. Please upload a MP4 or MOV file."
            : format === "Slideshow"
            ? "Invalid file type. Please upload a PDF file."
            : "Invalid file type. Please upload a JPEG, PNG, or JPG file.",
        )
        return
      }

      if (file.size > maxSizeInBytes) {
        toast.error(`File size exceeds ${maxSizeInMB}MB. Please upload a smaller file.`)
        return
      }

      setUploadingIndex(index)

      try {
        const objectUrl = URL.createObjectURL(file)
        setUploads((prev) => {
          const updated = [...prev]
          updated[index] = file
          return updated
        })
        setUploadBlobs((prev) => {
          const updated = [...prev]
          updated[index] = objectUrl
          return updated
        })
        setUploadProgress((prev) => {
          const updated = [...prev]
          updated[index] = 0
          return updated
        })
      } catch (error) {
        console.error("Error processing file:", error)
        toast.error("Error processing file. Please try again.")
      } finally {
        setUploadingIndex(null)
      }

      e.target.value = ""
    },
    [format],
  )

  const handleDelete = useCallback(
    async (index: number) => {
      try {
        // If there was a previously uploaded file (not just a blob), we need to delete it from Strapi
        if (previews?.[index]?.id) {
          setLoading(true)
          await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/upload/files/${previews[index].id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
            },
          })
        }

        // Update local state
        setUploads((prev) => {
          const updated = [...prev]
          updated[index] = null
          return updated
        })
        setUploadBlobs((prev) => {
          const updated = [...prev]
          if (updated[index] && updated[index].startsWith("blob:")) {
            URL.revokeObjectURL(updated[index])
          }
          updated[index] = ""
          return updated
        })
        setUploadProgress((prev) => {
          const updated = [...prev]
          updated[index] = 0
          return updated
        })

        // Update global state by removing the deleted file
        const updatedPreviews = [...previews]
        updatedPreviews.splice(index, 1)
        await updateGlobalState(updatedPreviews)
        
        toast.success("File deleted successfully!")
      } catch (error) {
        console.error("Error deleting file:", error)
        toast.error("Failed to delete file. Please try again.")
      } finally {
        setLoading(false)
      }
    },
    [previews, updateGlobalState]
  )

  const uploadSingleFile = useCallback(
    async (file: File, index: number, attempt = 0): Promise<any> => {
      try {
        const formData = new FormData()
        formData.append("files", file)
        formData.append("fileSize", file.size.toString())
        formData.append("fileType", file.type)

        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        setUploadProgress((prev) => {
          const updated = [...prev]
          updated[index] = 100
          return updated
        })
        return result[0] // Return the first file from the response array
      } catch (error) {
        console.error(`Upload attempt ${attempt + 1} failed for file "${file.name}":`, error)
        if (attempt < MAX_RETRIES) {
          const delay = 500 * (attempt + 1)
          await new Promise((resolve) => setTimeout(resolve, delay))
          return uploadSingleFile(file, index, attempt + 1)
        }
        throw error
      }
    },
    [],
  )

  const uploadFilesToStrapi = useCallback(async () => {
    if (!uploads.some((file) => file)) {
      toast.error("No files selected for upload.")
      return
    }

    setLoading(true)

    try {
      const filesToUpload = uploads
        .map((file, index) => ({ file, index }))
        .filter((item): item is { file: File; index: number } => item.file !== null)

      const uploadedFiles: any[] = []
      for (let i = 0; i < filesToUpload.length; i += CONCURRENT_UPLOADS) {
        const batch = filesToUpload.slice(i, i + CONCURRENT_UPLOADS)
        const batchPromises = batch.map(({ file, index }) =>
          uploadSingleFile(file, index).catch((error) => {
            console.error(`Failed to upload file at index ${index}:`, error)
            return null
          }),
        )
        const batchResults = (await Promise.all(batchPromises)).filter((result) => result !== null)
        uploadedFiles.push(...batchResults)
      }

      if (uploadedFiles.length === 0) {
        throw new Error("All file uploads failed")
      }

      const formattedFiles = uploadedFiles.map((file) => ({
        id: file.id.toString(),
        url: file.url,
      }))

      // Combine existing previews with new uploads
      const allPreviews = [...previews]
      formattedFiles.forEach((file, index) => {
        const uploadIndex = filesToUpload[index].index
        allPreviews[uploadIndex] = file
      })

      await updateGlobalState(allPreviews.filter(preview => preview))
      toast.success("Files uploaded successfully!")
      onUploadSuccess?.()
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (error) {
      console.error("Error in uploadFilesToStrapi:", error)
      toast.error("Some files failed to upload. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [uploads, previews, updateGlobalState, onUploadSuccess, onClose, uploadSingleFile])

  if (!isOpen) return null

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
            <p className="font-lighter text-balance text-md text-black">
              Upload the visuals for your selected formats. Each visual should have a corresponding preview.
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
                  className={`w-[225px] h-[105px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors relative ${loading ? "cursor-not-allowed" : "cursor-pointer"}`}
                  onClick={() => !loading && document.getElementById(`upload${index}`)?.click()}
                >
                  {uploadingIndex === index || (loading && uploadProgress[index] > 0 && uploadProgress[index] < 100) ? (
                    <div className="flex flex-col items-center justify-center">
                      <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                      <span className="text-sm">{uploadProgress[index]}%</span>
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
                        className={`absolute right-2 top-2 bg-red-500 w-[20px] h-[20px] rounded-full flex justify-center items-center ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!loading) handleDelete(index)
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
              {loading ? <FaSpinner className="animate-spin mx-auto" /> : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadModal