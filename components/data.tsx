import { BsFillMegaphoneFill } from "react-icons/bs";
import { TbCreditCardFilled, TbZoomFilled } from "react-icons/tb";
// React Icons imports
import {
  BsSnapchat,
  BsPinterest,
  BsReddit,
  BsWechat,
} from "react-icons/bs";
import {
  SiQuora,
  SiSinaweibo,
  SiVk,
  SiLine,
  SiKakaotalk,
  SiGoogleads,
} from "react-icons/si";
import { FcStumbleupon } from "react-icons/fc";
import { FcSportsMode } from "react-icons/fc";
import { FcIdea } from "react-icons/fc";
import {
  FaAd,
  FaAmazon,
  FaAdversal,
  FaHome,
  FaBrain,
  FaGlobeAmericas,
  FaMobileAlt,
  FaNewspaper,
  FaMagnet,
  FaXbox,
  FaExchangeAlt,
  FaLayerGroup,
  FaLeaf,
  FaTv,
  FaBullseye,
  FaChartLine,
  FaTable,
  FaIdCard,
  FaRecycle,
  FaList,
  FaFire,
  FaGlobe,
  FaArrowUp,
  FaShare,
  FaMicrosoft,
  FaHandshake,
  FaFirefox,
  FaTelegram,
  FaWhatsapp,
  FaTwitch,
  FaEbay,
  FaShoppingCart,
  FaEtsy,
  FaAlipay,
  FaRProject,
  FaEgg,
  FaShoppingBag,
  FaFlipboard,
  FaJira,
  FaShopify,
  FaShoppingBasket,
  FaSpotify,
  FaMusic,
  FaSoundcloud,
  FaPlayCircle,
  FaPlay,
  FaBroadcastTower,
} from "react-icons/fa";
import { FiPieChart } from "react-icons/fi";
import facebook from "../public/social/facebook.svg";
import youtube from "../public/social/youtube.svg";
import thetradedesk from "../public/social/thetradedesk.svg";
import quantcast from "../public/social/quantcast.svg";
import google from "../public/social/google.svg";
import ig from "../public/social/ig.svg";
import x from "../public/x.svg";
import linkedin from "../public/linkedin.svg";
import TheTradeDesk from "../public/TheTradeDesk.svg";
import Quantcast from "../public/quantcast.svg";
import Display from "../public/Display.svg";
import Google from "../public/Google.svg";
import yahoo from "../public/yahoo.svg";
import bing from "../public/bing.svg";
import orangecredit from "../public/orangecredit-card.svg";
import tablerzoomfilled from "../public/tabler_zoom-filled.svg";
import tictok from "../public/tictok.svg";
import speaker from "../public/mdi_megaphone.svg";
import cursor from "../public/blue_fluent_cursor-click.svg";
import State12 from "../public/State12.svg";
import roundget from "../public/ic_round-get-app.svg";
import mingcute_basket from "../public/mingcute_basket-fill.svg";
import mdi_leads from "../public/mdi_leads.svg";
import { StaticImageData } from "next/image";
import Image from "next/image";

// Utility function to render icons (handles both react-icons and StaticImageData)
const renderIcon = (icon: React.ReactNode | StaticImageData, alt?: string) => {
  if (!icon) return null;

  // Check if icon is a StaticImageData object (Next.js Image)
  if (typeof icon === "object" && "src" in icon) {
    return (
      <Image
        src={icon}
        alt={alt || "Platform icon"}
        width={24}
        height={24}
        style={{ display: "inline-block" }}
      />
    );
  }

  // Otherwise, treat it as a react-icons component
  return (
    <span style={{ display: "inline-block", fontSize: "24px" }}>{icon}</span>
  );
};

export const platformIcons: Record<string, StaticImageData> = {
  Facebook: facebook,
  Instagram: ig,
  YouTube: youtube,
  Youtube: youtube,
  TheTradeDesk: TheTradeDesk,
  Quantcast: Quantcast,
  Google: google,
  "Twitter/X": x,
  LinkedIn: linkedin,
  Linkedin: linkedin,
  TikTok: tictok,
  "Display & Video": Display,
  Yahoo: yahoo,
  Bing: bing,
  "Apple Search": google,
  "The Trade Desk": TheTradeDesk,
  QuantCast: Quantcast,
};

export const getPlatformIcon = (platformName: string): StaticImageData | null => {
  return platformIcons[platformName] || null;
};

export const getCurrencySymbol = (currencyCode: string): string => {
  switch (currencyCode) {
    case "EUR":
      return "€";
    case "USD":
      return "$";
    case "GBP":
      return "£";
    case "NGN":
      return "₦";
    case "JPY":
      return "¥";
    case "CAD":
      return "$";
    default:
      return "€";
  }
};

export const funnels = [
  {
    startWeek: 3,
    endWeek: 10,
    label: "Campaign 1",
    bg: "#3175FF",
    description: "Awareness",
    Icon: <BsFillMegaphoneFill />,
  },
  {
    startWeek: 4,
    endWeek: 13,
    label: "Campaign 2",
    bg: "#0ABF7E",
    description: "Consideration",
    Icon: <TbZoomFilled />,
  },
  {
    startWeek: 2,
    endWeek: 9,
    label: "Campaign 2",
    bg: "#ff9037",
    description: "Conversion",
    Icon: <TbCreditCardFilled />,
  },
  {
    startWeek: 2,
    endWeek: 9,
    label: "Campaign 2",
    bg: "#F05406",
    description: "Loyalty",
    Icon: <TbCreditCardFilled />,
  },
];

export const channels = [
  { icon: facebook, name: "Facebook", color: "#0866FF", bg: "#F0F6FF" },
  { icon: ig, name: "Instagram", color: "#C13584", bg: "#FEF1F8" },
  { icon: youtube, name: "YouTube", color: "#FF0000", bg: "#FFF0F0" },
  { icon: thetradedesk, name: "TheTradeDesk", color: "#0099FA", bg: "#F0F9FF" },
  { icon: quantcast, name: "Quantcast", color: "#000000", bg: "#F7F7F7" },
  { icon: google, name: "Google", color: "#4285F4", bg: "#F1F6FE" },
];

export const funnelStages = [
  {
    name: "Awareness",
    icon: speaker,
    status: "In progress",
    statusIsActive: true,
    platforms: {
      "Social media": [
        { name: "Facebook", icon: facebook },
        { name: "Instagram", icon: ig },
        { name: "TikTok", icon: tictok },
        { name: "YouTube", icon: youtube },
        { name: "Twitter/X", icon: x },
        { name: "LinkedIn", icon: linkedin },
      ],
      "Display networks": [
        { name: "The Trade Desk", icon: TheTradeDesk },
        { name: "Quantcast", icon: Quantcast },
        { name: "Display & Video", icon: Display },
      ],
      "Search engines": [
        { name: "Google", icon: Google },
        { name: "Yahoo", icon: yahoo },
        { name: "Bing", icon: bing },
      ],
    },
  },
  {
    name: "Consideration",
    icon: tablerzoomfilled,
    status: "Not started",
    statusIsActive: false,
    platforms: {
      "Social media": [
        { name: "Facebook", icon: facebook },
        { name: "Instagram", icon: ig },
        { name: "TikTok", icon: tictok },
        { name: "YouTube", icon: youtube },
        { name: "Twitter/X", icon: x },
        { name: "LinkedIn", icon: linkedin },
      ],
      "Display networks": [
        { name: "TheTradeDesk", icon: TheTradeDesk },
        { name: "Quantcast", icon: Quantcast },
        { name: "Display & Video", icon: Display },
      ],
      "Search engines": [
        { name: "Google", icon: Google },
        { name: "Yahoo", icon: yahoo },
        { name: "Bing", icon: bing },
      ],
    },
  },
  {
    name: "Conversion",
    icon: orangecredit,
    status: "Not started",
    statusIsActive: false,
    platforms: {
      "Social media": [
        { name: "Facebook", icon: facebook },
        { name: "Instagram", icon: ig },
        { name: "TikTok", icon: tictok },
        { name: "YouTube", icon: youtube },
        { name: "Twitter/X", icon: x },
        { name: "LinkedIn", icon: linkedin },
      ],
      "Display networks": [
        { name: "TheTradeDesk", icon: TheTradeDesk },
        { name: "Quantcast", icon: Quantcast },
        { name: "Display & Video", icon: Display },
      ],
      "Search engines": [
        { name: "Google", icon: Google },
        { name: "Yahoo", icon: yahoo },
        { name: "Bing", icon: bing },
      ],
    },
  },
  {
    name: "Loyalty",
    icon: orangecredit,
    status: "Not started",
    statusIsActive: false,
    platforms: {
      "Social media": [
        { name: "Facebook", icon: facebook },
        { name: "Instagram", icon: ig },
        { name: "TikTok", icon: tictok },
        { name: "YouTube", icon: youtube },
        { name: "Twitter/X", icon: x },
        { name: "LinkedIn", icon: linkedin },
      ],
      "Display networks": [
        { name: "TheTradeDesk", icon: TheTradeDesk },
        { name: "Quantcast", icon: Quantcast },
        { name: "Display & Video", icon: Display },
      ],
      "Search engines": [
        { name: "Google", icon: Google },
        { name: "Yahoo", icon: yahoo },
        { name: "Bing", icon: bing },
      ],
    },
  },
];

export const campaignObjectives = [
  {
    id: 1,
    icon: speaker,
    title: "Brand Awareness",
    description:
      "Reach as many people as possible and generate brand recall. Get people to watch your video.",
  },
  {
    id: 2,
    icon: cursor,
    title: "Traffic",
    description:
      "Increase website visits to maximize audience reach and engagement.",
  },
  {
    id: 3,
    icon: mingcute_basket,
    title: "Purchase",
    description: "Get as many people as possible to buy your product/service.",
  },
  {
    id: 4,
    icon: mdi_leads,
    title: "Lead Generation",
    description:
      "Get as many people as possible to provide their contact information.",
  },
  {
    id: 5,
    icon: roundget,
    title: "App Install",
    description: "Encourage users to download and install your mobile app.",
  },
  {
    id: 6,
    icon: State12,
    title: "Video Views",
    description:
      "Boost the number of views on your video content to increase engagement.",
  },
];

export const platformStyles = [
  { name: "Facebook", color: "#0866FF", bg: "#F0F6FF", icon: facebook },
  { name: "Instagram", color: "#C13584", bg: "#FEF1F8", icon: ig },
  { name: "TikTok", color: "#000000", bg: "#F8F8F8", icon: tictok },
  { name: "YouTube", color: "#FF0000", bg: "#FFF0F0", icon: youtube },
  { name: "Twitter/X", color: "#000000", bg: "#F5F5F5", icon: x },
  { name: "LinkedIn", color: "#0A66C2", bg: "#EDF4FA", icon: linkedin },
  { name: "Snapchat", color: "#FFFC00", bg: "#FFFCE1", icon: <BsSnapchat /> },
  { name: "Pinterest", color: "#E60023", bg: "#FFF0F2", icon: <BsPinterest /> },
  { name: "Reddit", color: "#FF4500", bg: "#FFF3EF", icon: <BsReddit /> },
  { name: "Quora", color: "#B92B27", bg: "#FAF2F0", icon: <SiQuora /> },
  { name: "WeChat", color: "#07C160", bg: "#E6F8EC", icon: <BsWechat /> },
  { name: "Weibo", color: "#E6162D", bg: "#FFF0F1", icon: <SiSinaweibo /> },
  { name: "Vkontakte", color: "#0077FF", bg: "#EAF3FF", icon: <SiVk /> },
  { name: "Line", color: "#00C300", bg: "#E9FAE9", icon: <SiLine /> },
  { name: "Kakao", color: "#FFCD00", bg: "#FFF9E6", icon: <SiKakaotalk /> },
  { name: "Tumblr", color: "#001935", bg: "#E6E9ED", icon: <FcStumbleupon /> },
  { name: "The Trade Desk", color: "#0099FA", bg: "#F0F9FF", icon: TheTradeDesk },
  { name: "Quantcast", color: "#000000", bg: "#F7F7F7", icon: Quantcast },
  { name: "Display & Video", color: "#34A853", bg: "#E6F4EA", icon: Display },
  { name: "DV360", color: "#1E8E3E", bg: "#E6F7E9", icon: <SiGoogleads /> },
  { name: "MediaMath", color: "#E6007A", bg: "#FFF0F8", icon: <FiPieChart /> },
  { name: "Xandr", color: "#FF3E59", bg: "#FFF4F6", icon: <FaAd /> },
  { name: "Verizon Media", color: "#DA291C", bg: "#FFECEC", icon: <FaBroadcastTower /> },
  { name: "Amazon", color: "#FF9900", bg: "#FFF7E6", icon: <FaAmazon /> },
  { name: "Adroll", color: "#0033CC", bg: "#E6ECFF", icon: <FaAdversal /> },
  { name: "Criteo", color: "#F47C00", bg: "#FFF4E6", icon: <FcSportsMode /> },
  { name: "RTB House", color: "#EC1C24", bg: "#FFF0F0", icon: <FaHome /> },
  { name: "SmartyAds", color: "#FF5722", bg: "#FFF3ED", icon: <FaBrain /> },
  { name: "Adsterra", color: "#FF4500", bg: "#FFF3EF", icon: <FaGlobeAmericas /> },
  { name: "PopAds", color: "#F5A623", bg: "#FFF8E6", icon: <FcIdea /> },
  { name: "Smaato", color: "#0071BC", bg: "#E6F2FF", icon: <FaMobileAlt /> },
  { name: "Pubmatic", color: "#00AEEF", bg: "#E6F7FF", icon: <FaNewspaper /> },
  { name: "Magnite", color: "#E6001F", bg: "#FFF0F1", icon: <FaMagnet /> },
  { name: "OpenX", color: "#FFA500", bg: "#FFF8E6", icon: <FaXbox /> },
  { name: "Index Exchange", color: "#0097D7", bg: "#E6F7FF", icon: <FaExchangeAlt /> },
  { name: "Stackadapt", color: "#1C1C1C", bg: "#F5F5F5", icon: <FaLayerGroup /> },
  { name: "Choozle", color: "#4EAF4E", bg: "#E6F7E6", icon: <FaLeaf /> },
  { name: "Teads", color: "#002244", bg: "#E6E9ED", icon: <FaTv /> },
  { name: "LiveIntent", color: "#FF6600", bg: "#FFF3E6", icon: <FaBullseye /> },
  { name: "Epom", color: "#0088CC", bg: "#E6F7FF", icon: <FaChartLine /> },
  { name: "QuantCast", color: "#000000", bg: "#F7F7F7", icon: Quantcast },
  { name: "Taboola", color: "#1F76C2", bg: "#E6F2FF", icon: <FaTable /> },
  { name: "Outbrain", color: "#FF6600", bg: "#FFF3E6", icon: <FaBrain /> },
  { name: "MGID", color: "#EC1C24", bg: "#FFF0F0", icon: <FaIdCard /> },
  { name: "Revcontent", color: "#0083C1", bg: "#E6F7FF", icon: <FaRecycle /> },
  { name: "Plista", color: "#6D6E71", bg: "#F5F5F5", icon: <FaList /> },
  { name: "Zemanta", color: "#E95A0C", bg: "#FFF3E6", icon: <FaFire /> },
  { name: "Nativo", color: "#0074C1", bg: "#E6F7FF", icon: <FaGlobe /> },
  { name: "TripleLift", color: "#FF6600", bg: "#FFF3E6", icon: <FaArrowUp /> },
  { name: "Sharethrough", color: "#00A37E", bg: "#E6F7F2", icon: <FaShare /> },
  {
    name: "Microsoft Audience",
    color: "#0066B8",
    bg: "#E6F2FF",
    icon: <FaMicrosoft />,
  },
  { name: "BuySell", color: "#FF5722", bg: "#FFF3ED", icon: <FaHandshake /> },
  { name: "Mozilla Tiles", color: "#C13832", bg: "#FAF2F2", icon: <FaFirefox /> },
  { name: "Telegram", color: "#0088CC", bg: "#E6F7FF", icon: <FaTelegram /> },
  { name: "WhatsApp", color: "#25D366", bg: "#E6F9E9", icon: <FaWhatsapp /> },
  { name: "Twitch", color: "#9146FF", bg: "#F4EFFF", icon: <FaTwitch /> },
  { name: "eBay", color: "#E53238", bg: "#FFF0F0", icon: <FaEbay /> },
  { name: "Walmart", color: "#0071CE", bg: "#E6F2FF", icon: <FaShoppingCart /> },
  { name: "Etsy", color: "#D5641C", bg: "#FAEFE6", icon: <FaEtsy /> },
  { name: "Alibaba", color: "#FF6A00", bg: "#FFF3E6", icon: <FaAlipay /> },
  { name: "Rakuten", color: "#BF0000", bg: "#FFE6E6", icon: <FaRProject /> },
  { name: "Newegg", color: "#F47B00", bg: "#FFF3E6", icon: <FaEgg /> },
  {
    name: "Mercado Libre",
    color: "#FFE600",
    bg: "#FFFCE6",
    icon: <FaShoppingBag />,
  },
  { name: "Flipkart", color: "#2874F0", bg: "#E6F0FF", icon: <FaFlipboard /> },
  { name: "JD", color: "#C7000B", bg: "#FFF0F1", icon: <FaJira /> },
  { name: "Lazada", color: "#F36C21", bg: "#FFF4E6", icon: <FaShopify /> },
  { name: "Shopee", color: "#FF5722", bg: "#FFF3ED", icon: <FaShoppingBasket /> },
  { name: "Spotify", color: "#1DB954", bg: "#E6F8EC", icon: <FaSpotify /> },
  { name: "Pandora", color: "#0057FF", bg: "#E6F2FF", icon: <FaMusic /> },
  { name: "SoundCloud", color: "#FF5500", bg: "#FFF3E6", icon: <FaSoundcloud /> },
  { name: "Hulu", color: "#1CE783", bg: "#E6F8EC", icon: <FaPlayCircle /> },
  { name: "Dailymotion", color: "#0066DC", bg: "#E6F2FF", icon: <FaPlay /> },
  { name: "Google", color: "#4285F4", bg: "#F1F6FE", icon: Google },
  { name: "Apple Search", color: "#000000", bg: "#F5F5F5", icon: google },
  { name: "Yahoo", color: "#6001D2", bg: "#F3E8FF", icon: yahoo },
  { name: "Bing", color: "#008373", bg: "#E6F7F3", icon: bing },
];