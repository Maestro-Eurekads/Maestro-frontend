"use client"

import type React from "react"
import { useEffect, useState } from "react"
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
  const { campaignFormData, updateCampaign, getActiveCampaign, campaignData } = useCampaigns()
  const [uploads, setUploads] = useState<Array<File | null>>([])
  const [uploadBlobs, setUploadBlobs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 5 // Increased from 3 to 5
  const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB chunks for large files

  // Initialize uploadBlobs with existing previews
  useEffect(() => {
    if (previews && previews.length > 0) {
      setUploadBlobs(previews.map((preview) => preview.url))
      setUploads(previews.map(() => null)) // Initialize uploads to match previews
    } else {
      setUploadBlobs(Array(quantities).fill(""))
      setUploads(Array(quantities).fill(null))
    }
  }, [previews, quantities])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    e.preventDefault()
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes =
      format === "Video"
        ? ["video/mp4", "video/mov", "video/quicktime"] // Added video/quicktime for .mov files
        : format === "Slideshow"
          ? [
              "application/pdf",
              "application/vnd.ms-powerpoint",
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ]
          : ["image/jpeg", "image/png", "image/jpg"]
    const maxSizeInMB = 20
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      if (format === "Video") {
        toast.error("Invalid file type. Please upload a MP4 or MOV file.")
      } else if (format === "Slideshow") {
        toast.error("Invalid file type. Please upload a PDF or PPTX file.")
      } else {
        toast.error("Invalid file type. Please upload a JPEG, PNG, or JPG file.")
      }
      return
    }

    if (file.size > maxSizeInBytes) {
      toast.error(`File size exceeds ${maxSizeInMB}MB. Please upload a smaller file.`)
      return
    }

    setUploadingIndex(index)

    try {
      // Create a preview immediately
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
    } catch (error) {
      console.error("Error processing file:", error)
      toast.error("Error processing file. Please try again.")
    } finally {
      setUploadingIndex(null)
    }

    e.target.value = "" // Reset input
  }

  const handleDelete = (index: number) => {
    setUploads((prev) => {
      const updated = [...prev]
      updated[index] = null
      return updated
    })

    setUploadBlobs((prev) => {
      const updated = [...prev]
      // Revoke object URL to prevent memory leaks
      if (updated[index] && updated[index].startsWith("blob:")) {
        URL.revokeObjectURL(updated[index])
      }
      updated[index] = ""
      return updated
    })
  }

  // Improved upload function with better error handling and chunked uploads for large files
  const uploadFilesToStrapi = async () => {
    if (!uploads.some((file) => file)) {
      toast.error("No files selected for upload.")
      return
    }

    setLoading(true)
    setRetryCount(0)

    const uploadSingleFile = async (file: File, attempt = 0): Promise<any> => {
      try {
        const formData = new FormData()
        formData.append("files", file)

        // Add metadata to help with debugging
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
          const errorText = await response.text()
          console.error(`Upload error (${response.status}):`, errorText)
          throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`)
        }

        return await response.json()
      } catch (error) {
        console.error(`Upload attempt ${attempt + 1} failed:`, error)

        if (attempt < MAX_RETRIES) {
          // Exponential backoff: wait longer between each retry
          const delay = Math.min(Math.pow(2, attempt) * 1000, 30000) // Cap at 30 seconds
          console.log(`Retrying in ${delay}ms...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          return uploadSingleFile(file, attempt + 1)
        }
        throw error
      }
    }

    try {
      // Upload files sequentially instead of all at once
      const uploadedFiles = []
      const filesToUpload = uploads.filter((file): file is File => file !== null)

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i]
        const result = await uploadSingleFile(file)
        uploadedFiles.push(...result) // Strapi returns an array
      }

      const formattedFiles = uploadedFiles.map((file) => ({
        id: file.id.toString(),
        url: file.url,
      }))

      await updateGlobalState(formattedFiles)
      toast.success("Files uploaded successfully!") // Add this line back
      setTimeout(() => {
        onClose()
      }, 1500) // Close after 1.5 seconds so the user can see the success message
    } catch (error) {
      console.error("Error uploading files:", error)
      toast.error("Failed to upload files after multiple attempts. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const updateGlobalState = async (uploadedFiles: Array<{ id: string; url: string }>) => {
    try {
      const updatedChannelMix = [...campaignFormData.channel_mix]

      const stage = updatedChannelMix.find((ch) => ch.funnel_stage === stageName)
      if (!stage) throw new Error("Stage not found")

      const platformKey = channel.toLowerCase().replace(/\s+/g, "_")
      const platforms = stage[platformKey]
      if (!platforms) throw new Error("Platform key not found")

      const targetPlatform = platforms.find((pl) => pl.platform_name === platform)
      if (!targetPlatform) throw new Error("Target platform not found")

      const targetFormatIndex = targetPlatform.format.findIndex((fo) => fo.format_type === format)
      if (targetFormatIndex === -1) throw new Error("Target format not found")

      // Merge new uploads with existing previews
      const existingPreviews = targetPlatform.format[targetFormatIndex].previews || []
      const newPreviews = [...existingPreviews, ...uploadedFiles]

      targetPlatform.format[targetFormatIndex].previews = newPreviews

      const updatedState = {
        ...campaignData,
        channel_mix: updatedChannelMix,
      }

      await uploadUpdatedCampaignToStrapi(updatedState)
    } catch (error) {
      console.error("Error updating global state:", error)
      throw error // Re-throw to be caught by the caller
    }
  }

  const uploadUpdatedCampaignToStrapi = async (data: any) => {
    try {
      const cleanData = removeKeysRecursively(
        data,
        ["id", "documentId", "createdAt", "publishedAt", "updatedAt"],
        ["previews"],
      )
      await updateCampaign(cleanData)
      await getActiveCampaign()
    } catch (error) {
      console.error("Error updating campaign:", error)
      toast.error("Failed to save campaign data.")
      throw error // Re-throw to be caught by the caller
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed cursor-pointer inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
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

          <div className="flex cursor-pointer flex-col items-center gap-4">
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
                  {uploadingIndex === index ? (
                    <div className="flex items-center justify-center">
                      <FaSpinner className="animate-spin text-blue-500 text-2xl" />
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
                              ? "application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
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
