import Image from "next/image"
import { useState, useEffect } from "react"
import { FaCheck, FaSpinner } from "react-icons/fa"
import Switch from "react-switch"
import PageHeaderWrapper from "../../../components/PageHeaderWapper"
import { funnelStages, getPlatformIcon, platformIcons, renderUploadedFile } from "../../../components/data"
import { useCampaigns } from "../../utils/CampaignsContext"
import UploadModal from "../../../components/UploadModal/UploadModal"
import { useComments } from "app/utils/CommentProvider"
import { Trash } from "lucide-react"
import Link from "next/link"
import { removeKeysRecursively } from "utils/removeID"
import customicon from "../../../public/social/customicon.png"
import toast from "react-hot-toast"

// Types
type FormatType = {
  format_type: string
  num_of_visuals: string
  previews: Array<{ id: string; url: string }>
}

type PlatformType = {
  id: number
  platform_name: string
  buy_type: string | null
  objective_type: string | null
  campaign_start_date: string | null
  campaign_end_date: string | null
  format: FormatType[]
  ad_sets: Array<{
    id: number
    audience_type: string
    name: string
    size: string
    format?: FormatType[]
  }>
  budget: string | null
  kpi: string | null
}

type ChannelType = {
  id: number
  funnel_stage: string
  funnel_stage_timeline_start_date: string | null
  funnel_stage_timeline_end_date: string | null
  social_media: PlatformType[]
  display_networks: PlatformType[]
  search_engines: PlatformType[]
  streaming: PlatformType[]
  ooh: PlatformType[]
  broadcast: PlatformType[]
  messaging: PlatformType[]
  print: PlatformType[]
  e_commerce: PlatformType[]
  in_game: PlatformType[]
  mobile: PlatformType[]
}

type MediaOptionType = {
  name: string
  icon: any
}

type QuantitiesType = {
  [platformName: string]: {
    [formatName: string]: number
  }
}

// Constants
const CHANNEL_TYPES = [
  { key: "social_media", title: "Social media" },
  { key: "display_networks", title: "Display Networks" },
  { key: "search_engines", title: "Search Engines" },
  { key: "streaming", title: "Streaming" },
  { key: "ooh", title: "OOH" },
  { key: "broadcast", title: "Broadcast" },
  { key: "messaging", title: "Messaging" },
  { key: "print", title: "Print" },
  { key: "e_commerce", title: "E Commerce" },
  { key: "in_game", title: "In Game" },
  { key: "mobile", title: "Mobile" },
]

const DEFAULT_MEDIA_OPTIONS = [
  { name: "Carousel", icon: "/carousel.svg" },
  { name: "Image", icon: "/Image_format.svg" },
  { name: "Video", icon: "/video_format.svg" },
  { name: "Slideshow", icon: "/slideshow_format.svg" },
  { name: "Collection", icon: "/collection_format.svg" },
]

// Helper functions
const getLocalStorageItem = (key: string, defaultValue: any = null) => {
  if (typeof window === "undefined") return defaultValue
  const item = localStorage.getItem(key)
  return item ? JSON.parse(item) : defaultValue
}

const setLocalStorageItem = (key: string, value: any) => {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

// Components
const MediaOption = ({
  option,
  isSelected,
  quantity,
  onSelect,
  onQuantityChange,
  onOpenModal,
  platformName,
  channelName,
  previews,
  stageName,
  format,
  adSetIndex,
}: {
  option: MediaOptionType
  isSelected: boolean
  quantity: number
  onSelect: () => void
  onQuantityChange: (change: number) => void
  onOpenModal: () => void
  platformName: string
  channelName: string
  previews: Array<{ id: string; url: string }>
  stageName: string
  format: string
  adSetIndex?: number
}) => {
  const { campaignFormData, updateCampaign } = useCampaigns()
  const [loading, setLoading] = useState(false)
  const [localPreviews, setLocalPreviews] = useState<Array<{ id: string; url: string }>>([])
  const [idToDel, setIdToDel] = useState<string | null>(null)

  useEffect(() => {
    const shownPreviews = (previews || []).slice(0, quantity)
    setLocalPreviews(shownPreviews)
  }, [previews, quantity])

  const uploadUpdatedCampaignToStrapi = async (data: any) => {
    try {
      const cleanData = removeKeysRecursively(
        data,
        ["id", "documentId", "createdAt", "publishedAt", "updatedAt"],
        ["previews"],
      )
      await updateCampaign(cleanData)
    } catch (error) {
      console.error("Error in uploadUpdatedCampaignToStrapi:", error)
      toast.error("Failed to save campaign data.")
      throw error
    }
  }

  const handleDelete = async (previewId: string) => {
    if (!previewId) return
    
    setLoading(true)
    setIdToDel(previewId)

    try {
      const updatedPreviews = localPreviews.filter(prv => prv.id !== previewId)
      setLocalPreviews(updatedPreviews)

      const updatedChannelMix = [...(campaignFormData?.channel_mix || [])]
      const stageIndex = updatedChannelMix.findIndex((ch) => ch.funnel_stage === stageName)
      if (stageIndex === -1) return

      const platformKey = channelName.toLowerCase().replace(/\s+/g, "_")
      const platforms = updatedChannelMix[stageIndex][platformKey]
      if (!platforms) return

      const platformIndex = platforms.findIndex((pl) => pl.platform_name === platformName)
      if (platformIndex === -1) return

      if (adSetIndex !== undefined) {
        const adSet = platforms[platformIndex].ad_sets?.[adSetIndex]
        if (!adSet?.format) return

        const formatIndex = adSet.format.findIndex((f) => f.format_type === format)
        if (formatIndex === -1) return

        adSet.format[formatIndex].previews = adSet.format[formatIndex].previews.filter(
          prv => prv.id !== previewId
        )
      } else {
        const formatIndex = platforms[platformIndex].format?.findIndex((f) => f.format_type === format)
        if (formatIndex === -1 || !platforms[platformIndex].format) return

        platforms[platformIndex].format[formatIndex].previews = 
          platforms[platformIndex].format[formatIndex].previews.filter(
            prv => prv.id !== previewId
          )
      }

      const updatedState = {
        ...campaignFormData,
        channel_mix: updatedChannelMix,
      }

      await uploadUpdatedCampaignToStrapi(updatedState)
    } catch (error) {
      console.error("Error deleting preview:", error)
      toast.error("Failed to delete preview")
    } finally {
      setLoading(false)
      setIdToDel(null)
    }
  }

  const isDecreaseDisabled = quantity === 1 || localPreviews.length >= quantity

  return (
    <div>
      <div className="flex gap-6 min-w-fit">
        <div className="flex flex-col items-center">
          <div
            onClick={onSelect}
            className={`relative text-center p-2 rounded-lg border transition ${
              isSelected ? "border-blue-500 shadow-lg" : "border-gray-300"
            } cursor-pointer`}
          >
            <Image src={option.icon || "/placeholder.svg"} width={168} height={132} alt={option.name} />
            <p className="text-sm font-medium text-gray-700 mt-2">{option.name}</p>
            {isSelected && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                <FaCheck />
              </div>
            )}
          </div>
          {isSelected && (
            <div className="flex items-center bg-[#F6F6F6] gap-2 mt-4 border rounded-[8px]">
              <button 
                className={`px-2 py-1 text-[#000000] text-lg font-semibold ${isDecreaseDisabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
                onClick={() => !isDecreaseDisabled && onQuantityChange(-1)}
                disabled={isDecreaseDisabled}
              >
                -
              </button>
              <span className="px-2">{quantity || 1}</span>
              <button className="px-2 py-1 text-[#000000] text-lg font-semibold" onClick={() => onQuantityChange(1)}>
                +
              </button>
            </div>
          )}
        </div>
        {isSelected && (
          <div
            onClick={onOpenModal}
            className="w-[225px] h-[150px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M0.925781 14.8669H15.9258V16.5335H0.925781V14.8669ZM9.25911 3.89055V13.2002H7.59245V3.89055L2.53322 8.94978L1.35471 7.77128L8.42578 0.700195L15.4969 7.77128L14.3184 8.94978L9.25911 3.89055Z"
                  fill="#3175FF"
                />
              </svg>
              <p className="text-md font-lighter text-black mt-2">Upload your previews</p>
            </div>
          </div>
        )}
      </div>
      {isSelected && localPreviews.length > 0 && (
        <div className="mt-8">
          <p className="font-semibold text-[18px] mb-4">
            Uploaded Previews ({localPreviews.length}/{quantity})
          </p>
          <div className="grid grid-cols-2 gap-3 flex-wrap">
            {localPreviews.map((prv, index) => (
              <div key={prv.id || index} className="relative">
                <Link
                  href={prv.url}
                  target="_blank"
                  className="w-[225px] h-[150px] rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors border border-gray-500 cursor-pointer"
                >
                  {renderUploadedFile(
                    localPreviews.map(lp => lp.url),
                    option.name,
                    index,
                  )}
                </Link>
                <button
                  className="absolute right-2 top-2 bg-red-500 w-[20px] h-[20px] rounded-full flex justify-center items-center cursor-pointer"
                  onClick={() => handleDelete(prv.id)}
                  disabled={loading && idToDel === prv.id}
                >
                  {loading && idToDel === prv.id ? (
                    <center>
                      <FaSpinner color="white" className="animate-spin" />
                    </center>
                  ) : (
                    <Trash color="white" size={10} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const MediaSelectionGrid = ({
  mediaOptions,
  platformName,
  channelName,
  stageName,
  quantities,
  onFormatSelect,
  onQuantityChange,
  onOpenModal,
  adSetIndex,
  view,
}: {
  mediaOptions: MediaOptionType[]
  platformName: string
  channelName: string
  stageName: string
  quantities: { [key: string]: number }
  onFormatSelect: (index: number, adSetIndex?: number) => void
  onQuantityChange: (modes: string, change: number) => void
  onOpenModal: (platform: string, channel: string, format: string, previews: any[], quantities: any, adSetIndex?: number) => void
  adSetIndex?: number
  view: "channel" | "adset"
}) => {
  const { campaignFormData } = useCampaigns()
  const channelKey = channelName.toLowerCase().replace(/\s+/g, "_")

  const stage = campaignFormData?.channel_mix?.find((ch) => ch?.funnel_stage === stageName)
  const platform = stage?.[channelKey]?.find((pl) => pl?.platform_name === platformName)
  const adSet = adSetIndex !== undefined ? platform?.ad_sets?.[adSetIndex] : null

  return (
    <div className="w-full h-full overflow-x-auto overflow-y-clip">
      <div className="flex gap-4" style={{ minWidth: "max-content" }}>
        {mediaOptions.map((option, index) => {
          const isSelected = adSet && view === "adset"
            ? adSet.format?.some((f) => f.format_type === option.name)
            : platform?.format?.some((f) => f.format_type === option.name)

          const previews = adSet && view === "adset"
            ? adSet.format?.find((f) => f.format_type === option.name)?.previews || []
            : platform?.format?.find((f) => f.format_type === option.name)?.previews || []

          const q = adSet && view === "adset"
            ? adSet.format?.find((f) => f.format_type === option.name)?.num_of_visuals
            : platform?.format?.find((f) => f.format_type === option.name)?.num_of_visuals

          return (
            <MediaOption
              key={index}
              option={option}
              isSelected={!!isSelected}
              quantity={quantities[option.name] || Number.parseInt(q) || 1}
              onSelect={() => onFormatSelect(index, adSetIndex)}
              onQuantityChange={(change) => onQuantityChange(option.name, change)}
              onOpenModal={() => onOpenModal(platformName, channelName, option.name, previews, quantities[option.name] || Number.parseInt(q) || 1, adSetIndex)}
              platformName={platformName}
              channelName={channelName}
              previews={previews}
              stageName={stageName}
              format={option.name}
              adSetIndex={adSetIndex}
            />
          )
        })}
      </div>
    </div>
  )
}

const PlatformItem = ({
  platform,
  channelTitle,
  stageName,
  quantities,
  onQuantityChange,
  onOpenModal,
  view,
}: {
  platform: PlatformType
  channelTitle: string
  stageName: string
  quantities: QuantitiesType
  onQuantityChange: (platformName: string, formatName: string, change: number) => void
  onOpenModal: (platform: string, channel: string, format: string, previews: any[], quantities: any, adSetIndex?: number) => void
  view: "channel" | "adset"
}) => {
  const [isExpanded, setIsExpanded] = useState<{ [key: string]: boolean }>({})
  const [expandedAdsets, setExpandedAdsets] = useState<{ [key: string]: boolean }>({})
  const { campaignFormData, setCampaignFormData } = useCampaigns()

  useEffect(() => {
    if (platform.format?.length > 0 && view === "channel") {
      setIsExpanded((prev) => ({
        ...prev,
        [`${platform.platform_name}-${platform.id}`]: true,
      }))
    }
    if (view === "adset" && platform.ad_sets?.some(adset => adset.format?.length > 0)) {
      platform.ad_sets?.forEach((_, index) => {
        setExpandedAdsets((prev) => ({
          ...prev,
          [`${platform.platform_name}-${index}`]: true,
        }))
      })
    }
  }, [platform.format, platform.platform_name, platform.id, platform.ad_sets, view])

  const toggleExpansion = (id: string) => {
    setIsExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const toggleAdsetExpansion = (adsetId: string) => {
    setExpandedAdsets((prev) => ({
      ...prev,
      [adsetId]: !prev[adsetId],
    }))
  }

  const handleFormatSelection = (index: number, adsetIndex?: number) => {
    const formatName = DEFAULT_MEDIA_OPTIONS[index].name
    const copy = [...campaignFormData.channel_mix]

    const stageIndex = copy.findIndex((item) => item.funnel_stage === stageName)
    if (stageIndex === -1) return

    const channelKey = channelTitle.toLowerCase().replace(/\s+/g, "_")
    const channel = copy[stageIndex][channelKey]
    const platformIndex = channel?.findIndex((item) => item.platform_name === platform.platform_name)
    if (platformIndex === -1) return

    const platformCopy = channel[platformIndex]

    if (view === "adset" && typeof adsetIndex === "number" && platformCopy.ad_sets?.length > 0) {
      const adset = platformCopy.ad_sets[adsetIndex]
      if (!adset) return

      if (!adset.format) adset.format = []

      const adsetFormatIndex = adset.format.findIndex((f) => f.format_type === formatName)

      if (adsetFormatIndex !== -1) {
        adset.format.splice(adsetFormatIndex, 1)
      } else {
        adset.format.push({
          format_type: formatName,
          num_of_visuals: "1",
          previews: [],
        })
      }
    } else if (view === "channel") {
      if (!platformCopy.format) platformCopy.format = []

      const formatIndex = platformCopy.format.findIndex((f) => f.format_type === formatName)

      if (formatIndex !== -1) {
        platformCopy.format.splice(formatIndex, 1)
      } else {
        platformCopy.format.push({
          format_type: formatName,
          num_of_visuals: "1",
          previews: [],
        })
      }
    }

    setCampaignFormData((prev) => ({
      ...prev,
      channel_mix: copy,
    }))
  }

  return (
    <div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-[8px] font-[500] border p-3 rounded-[10px] min-w-[150px] max-w-[180px] w-full">
          {platformIcons[platform.platform_name] && (
            <Image
              src={getPlatformIcon(platform.platform_name) || "/placeholder.svg"}
              alt={platform.platform_name}
              width={20}
              height={20}
            />
          )}
          <p>{platform.platform_name}</p>
        </div>
        {view !== "adset" && (
          <div
            className="flex gap-3 items-center font-semibold cursor-pointer"
            onClick={() => toggleExpansion(`${platform.platform_name}-${platform.id}`)}
          >
            {isExpanded[`${platform.platform_name}-${platform.id}`] ? (
              <span className="text-gray-500">Choose the number of visuals for this format</span>
            ) : (
              <>
                <p className="font-bold text-[18px] text-[#3175FF]">
                  <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
                    <path
                      d="M5.87891 5.16675V0.166748H7.54557V5.16675H12.5456V6.83342H7.54557V11.8334H5.87891V6.83342H0.878906V5.16675H5.87891Z"
                      fill="#3175FF"
                    />
                  </svg>
                </p>
                <h3 className="text-[#3175FF]">Add format</h3>
              </>
            )}
          </div>
        )}
      </div>

      {view === "channel" && isExpanded[`${platform.platform_name}-${platform.id}`] && (
        <div className="py-6">
          <MediaSelectionGrid
            mediaOptions={DEFAULT_MEDIA_OPTIONS}
            platformName={platform.platform_name}
            channelName={channelTitle}
            stageName={stageName}
            quantities={quantities[platform.platform_name] || {}}
            onFormatSelect={handleFormatSelection}
            onQuantityChange={(formatName, change) => onQuantityChange(platform.platform_name, formatName, change)}
            onOpenModal={onOpenModal}
            view={view}
          />
        </div>
      )}

      {view === "adset" && platform.ad_sets?.length > 0 && (
        <>
          {platform.ad_sets.map((adset, index) => {
            const adsetKey = `${adset.id}-${index}`
            const isAdsetExpanded = expandedAdsets[`${platform.platform_name}-${index}`]

            return (
              <div key={adsetKey}>
                <div className="my-3 flex items-center gap-8">
                  <div className="p-3 border w-fit rounded-md">{adset.audience_type}</div>
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => toggleAdsetExpansion(`${platform.platform_name}-${index}`)}
                  >
                    {isAdsetExpanded ? (
                      <span className="text-gray-500">Choose the number of visuals for this format</span>
                    ) : (
                      <>
                        <p className="font-bold text-[18px] text-[#3175FF]">
                          <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
                            <path
                              d="M5.87891 5.16675V0.166748H7.54557V5.16675H12.5456V6.83342H7.54557V11.8334H5.87891V6.83342H0.878906V5.16675H5.87891Z"
                              fill="#3175FF"
                            />
                          </svg>
                        </p>
                        <h3 className="text-[#3175FF] font-semibold">Add format</h3>
                      </>
                    )}
                  </div>
                </div>

                {isAdsetExpanded && (
                  <div className="py-6">
                    <MediaSelectionGrid
                      mediaOptions={DEFAULT_MEDIA_OPTIONS}
                      platformName={platform.platform_name}
                      channelName={channelTitle}
                      stageName={stageName}
                      quantities={quantities[`${platform.platform_name}_adset_${index}`] || {}}
                      onFormatSelect={handleFormatSelection}
                      onQuantityChange={(formatName, change) =>
                        onQuantityChange(`${platform.platform_name}_adset_${index}`, formatName, change)
                      }
                      onOpenModal={onOpenModal}
                      adSetIndex={index}
                      view={view}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

const ChannelSection = ({
  channelTitle,
  platforms,
  stageName,
  quantities,
  onQuantityChange,
  onOpenModal,
  view,
}: {
  channelTitle: string
  platforms: PlatformType[]
  stageName: string
  quantities: QuantitiesType
  onQuantityChange: (platformName: string, formatName: string, change: number) => void
  onOpenModal: (platform: string, channel: string, format: string, previews: any[], quantities: any, adSetIndex?: number) => void
  view: "channel" | "adset"
}) => {
  const filteredPlatforms = view === "adset" ? platforms.filter((platform) => platform.ad_sets?.length > 0) : platforms

  if (!filteredPlatforms || filteredPlatforms.length === 0) return null

  return (
    <>
      <h3 className="font-[600] my-[24px]">{channelTitle}</h3>
      <div className="flex flex-col gap-[24px]">
        {filteredPlatforms.map((platform, index) => (
          <PlatformItem
            key={`${platform.platform_name}-${index}`}
            platform={platform}
            channelTitle={channelTitle}
            stageName={stageName}
            quantities={quantities}
            onQuantityChange={onQuantityChange}
            onOpenModal={onOpenModal}
            view={view}
          />
        ))}
      </div>
    </>
  )
}

export const Platforms = ({
  stageName,
  view = "channel",
}: {
  stageName: string
  view?: "channel" | "adset"
}) => {
  const [quantities, setQuantities] = useState<QuantitiesType>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContext, setModalContext] = useState<{
    platform: string
    channel: string
    format: string
    previews: any[]
    quantities: any
    adSetIndex?: number
  } | null>(null)

  const { campaignFormData, setCampaignFormData } = useCampaigns()

  useEffect(() => {
    const quantitiesKey = `quantities_${stageName}_${view}`
    setQuantities(getLocalStorageItem(quantitiesKey, {}))
  }, [stageName, view])

  useEffect(() => {
    const stage = campaignFormData?.channel_mix?.find((chan) => chan.funnel_stage === stageName)

    if (stage) {
      const initialQuantities: QuantitiesType = {}

      CHANNEL_TYPES.forEach(({ key }) => {
        stage[key]?.forEach((platform) => {
          if (view === "channel" && platform.format && platform.format.length > 0) {
            initialQuantities[platform.platform_name] = {}
            platform.format.forEach((f) => {
              initialQuantities[platform.platform_name][f.format_type] = Number.parseInt(f.num_of_visuals || "1")
            })
          }

          if (view === "adset") {
            platform.ad_sets?.forEach((adset, adsetIndex) => {
              if (adset.format && adset.format.length > 0) {
                const adsetKey = `${platform.platform_name}_adset_${adsetIndex}`
                initialQuantities[adsetKey] = {}
                adset.format.forEach((f) => {
                  initialQuantities[adsetKey][f.format_type] = Number.parseInt(f.num_of_visuals || "1")
                })
              }
            })
          }
        })
      })

      if (Object.keys(initialQuantities).length > 0) {
        setQuantities(initialQuantities)
        setLocalStorageItem(`quantities_${stageName}_${view}`, initialQuantities)
      }
    }
  }, [campaignFormData, stageName, view])

  const handleQuantityChange = (key: string, formatName: string, change: number) => {
    const newQuantity = Math.max(1, (quantities[key]?.[formatName] || 1) + change)
    const newQuantities = {
      ...quantities,
      [key]: {
        ...quantities[key],
        [formatName]: newQuantity,
      },
    }

    setQuantities(newQuantities)
    setLocalStorageItem(`quantities_${stageName}_${view}`, newQuantities)

    const copy = [...campaignFormData.channel_mix]
    const stageIndex = copy.findIndex((item) => item.funnel_stage === stageName)
    if (stageIndex === -1) return

    for (const channelType of CHANNEL_TYPES) {
      const platforms = copy[stageIndex][channelType.key]
      if (!platforms) continue

      let platformName = key
      let adSetIndex: number | undefined

      if (view === "adset") {
        const match = key.match(/^(.*)_adset_(\d+)$/)
        if (match) {
          platformName = match[1]
          adSetIndex = Number.parseInt(match[2])
        }
      }

      const platform = platforms.find((p) => p.platform_name === platformName)
      if (!platform) continue

      if (view === "channel") {
        if (platform.format) {
          const format = platform.format.find((f) => f.format_type === formatName)
          if (format) {
            format.num_of_visuals = newQuantity.toString()
            if (format.previews && format.previews.length > newQuantity) {
              format.previews = format.previews.slice(0, newQuantity)
            }
          }
        }
      } else if (view === "adset" && adSetIndex !== undefined) {
        const adSet = platform.ad_sets?.[adSetIndex]
        if (adSet && adSet.format) {
          const adSetFormat = adSet.format.find((f) => f.format_type === formatName)
          if (adSetFormat) {
            adSetFormat.num_of_visuals = newQuantity.toString()
            if (adSetFormat.previews && adSetFormat.previews.length > newQuantity) {
              adSetFormat.previews = adSetFormat.previews.slice(0, newQuantity)
            }
          }
        }
      }
    }

    setCampaignFormData({ ...campaignFormData, channel_mix: copy })
  }

  const openModal = (platform: string, channel: string, format: string, previews: any[], quantities: any, adSetIndex?: number) => {
    setModalContext({ platform, channel, format, previews, quantities, adSetIndex })
    setIsModalOpen(true)
  }

  const getChannelPlatforms = () => {
    const stage = campaignFormData?.channel_mix?.find((chan) => chan?.funnel_stage === stageName)

    if (!stage) return []

    return CHANNEL_TYPES.map(({ key, title }) => ({
      title,
      platforms: stage[key]?.filter((p: PlatformType) => p.platform_name) || [],
    })).filter((channel) => channel.platforms.length > 0)
  }

  const channelSections = getChannelPlatforms()

  return (
    <div className="text-[16px] overflow-x-hidden">
      {channelSections.map((channel, index) => (
        <ChannelSection
          key={`${channel.title}-${index}`}
          channelTitle={channel.title}
          platforms={channel.platforms}
          stageName={stageName}
          quantities={quantities}
          onQuantityChange={handleQuantityChange}
          onOpenModal={openModal}
          view={view}
        />
      ))}

      {isModalOpen && modalContext && (
        <UploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          platform={modalContext.platform}
          channel={modalContext.channel}
          format={modalContext.format}
          previews={modalContext.previews}
          quantities={modalContext.quantities}
          stageName={stageName}
          adSetIndex={modalContext.adSetIndex}
        />
      )}
    </div>
  )
}

export const FormatSelection = () => {
  const [openTabs, setOpenTabs] = useState<string[]>([])
  const [view, setView] = useState<"channel" | "adset">("channel")
  const { campaignFormData, setCampaignFormData } = useCampaigns()
  const { setIsDrawerOpen, setClose } = useComments()

  useEffect(() => {
    setIsDrawerOpen(false)
    setClose(false)
  }, [])

  useEffect(() => {
    const savedOpenTabs = getLocalStorageItem("formatSelectionOpenTabs")

    if (savedOpenTabs) {
      setOpenTabs(savedOpenTabs)
    } else if (campaignFormData?.channel_mix?.length > 0) {
      const initialTab = [campaignFormData.channel_mix[0]?.funnel_stage]
      setOpenTabs(initialTab)
      setLocalStorageItem("formatSelectionOpenTabs", initialTab)
    }
  }, [campaignFormData])

  const toggleTab = (stageName: string) => {
    const newOpenTabs = openTabs.includes(stageName)
      ? openTabs.filter((tab) => tab !== stageName)
      : [...openTabs, stageName]

    setOpenTabs(newOpenTabs)
    setLocalStorageItem("formatSelectionOpenTabs", newOpenTabs)
  }

  const hasSelectedFormatsForStage = (stageName: string) => {
    const stage = campaignFormData?.channel_mix?.find((chan) => chan?.funnel_stage === stageName)

    return (
      stage &&
      CHANNEL_TYPES.some(({ key }) => stage[key]?.some((platform: PlatformType) => 
        view === "channel" 
          ? platform.format?.length > 0 
          : platform.ad_sets?.some(adset => adset.format?.length > 0)
      ))
    )
  }

  const getStageStatus = (stageName: string) => {
    const hasFormats = hasSelectedFormatsForStage(stageName)

    if (hasFormats) return "In progress"
    return "Not started"
  }

  const handleToggleChange = (checked: boolean) => {
    setView(checked ? "adset" : "channel")
  }

  return (
    <div>
      <PageHeaderWrapper
        t1="Select formats for each channel"
        t2="Select the creative formats you want to use for your campaign. Specify the number of visuals for each format. Multiple formats can be selected per channel or Ad set"
      />

      <div className="mt-[32px] flex flex-col gap-[24px] cursor-pointer">
        <div className="flex justify-center gap-3">
          <p className="font-medium">Channel View</p>
          <Switch
            checked={view === "adset"}
            onChange={handleToggleChange}
            onColor="#5cd08b"
            offColor="#3175FF"
            handleDiameter={18}
            uncheckedIcon={false}
            checkedIcon={false}
            height={24}
            width={48}
            borderRadius={24}
            activeBoxShadow="0 0 2px 3px rgba(37, 99, 235, 0.2)"
            className="react-switch"
          />
          <p className="font-medium">AdSet View</p>
        </div>

        {campaignFormData?.funnel_stages?.map((stageName, index) => {
          const stage = campaignFormData?.custom_funnels?.find((s) => s.name === stageName)
          const funnelStage = funnelStages?.find((f) => f?.name === stageName)

          if (!stage) return null

          const status = getStageStatus(stageName)
          const isOpen = openTabs.includes(stage.name)

          return (
            <div key={index}>
              <div
                className={`flex justify-between items-center p-6 gap-3 w-full h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] ${
                  isOpen ? "rounded-t-[10px]" : "rounded-[10px]"
                }`}
                onClick={() => toggleTab(stage.name)}
              >
                <div className="flex items-center gap-2">
                  {funnelStage?.icon ? (
                    <Image loading="lazy" src={funnelStage.icon || "/placeholder.svg"} alt={stage.name} width={24} height={24} />
                  ) : (
                    <Image loading="lazy" src={customicon || "/placeholder.svg"} alt={stage.name} width={24} height={24} />
                  )}
                  <p className="w-full max-w-[1500px] h-[24px] font-[General Sans] font-semibold text-[18px] leading-[24px] text-[#06371a]">
                    {stage.name}
                  </p>
                </div>
                {status === "In progress" ? (
                  <p className="font-general-sans font-semibold text-[16px] leading-[22px] text-[#3175FF]">
                    In Progress
                  </p>
                ) : (
                  <p className="font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237] opacity-50">
                    Not started
                  </p>
                )}
                <Image
                  src={isOpen ? "/arrow-down.svg" : "/arrow-down-2.svg"}
                  alt={isOpen ? "up" : "down"}
                  width={24}
                  height={24}
                />
              </div>
              {isOpen && (
                <div className="card-body bg-white border border-[#E5E5E5]">
                  <Platforms stageName={stage?.name} view={view} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FormatSelection