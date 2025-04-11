import { BsFillMegaphoneFill } from "react-icons/bs";
import { TbCreditCardFilled, TbZoomFilled } from "react-icons/tb";
import placeholder from "../public/social/placeholder.svg"; // Add this import

import adroll from "../public/social/adroll.svg";
import adsterra from "../public/social/adsterra.png";
import alibaba from "../public/social/alibaba.png";
import amazon from "../public/social/amazon.svg";
import buysell from "../public/social/buysell.png";
import choozle from "../public/social/choozle.png";
import criteo from "../public/social/criteo.png";
import daily from "../public/social/daily.png";
import ebay from "../public/social/ebay.png";
import epom from "../public/social/epom.png";
import etsy from "../public/social/etsy.png";
import flipkart from "../public/social/flipkart.png";
import hulu from "../public/social/hulu.png";
import indexchange from "../public/social/indexchange.png";
import jd from "../public/social/jd.jpeg";
import Kakao_logo from "../public/social/Kakao_logo.jpg";
import lazada from "../public/social/lazada.png";
import line from "../public/social/line.svg";
import liveintent from "../public/social/liveintent.png";
import magnite from "../public/social/magnite.png";
import mediamath from "../public/social/mediamath.png";
import mercado from "../public/social/mercado.png";
import mgid from "../public/social/mgid.png";
import microsoft from "../public/social/microsoft.png";
import mozilla from "../public/social/mozilla.png";
import nativo from "../public/social/nativo.png";
import newegg from "../public/social/newegg.png";
import openx from "../public/social/openx.png";
import outbrain from "../public/social/outbrain.png";
import pandora from "../public/social/pandora.png";
import plista from "../public/social/plista.jpeg";
import popads from "../public/social/popads.png";
import pubmatic from "../public/social/pubmatic.png";
import quora from "../public/social/quora.svg";
import rakuten from "../public/social/rakuten.jpeg";
import reddit from "../public/social/reddit.svg";
import revcontent from "../public/social/revcontent.png";
import rtbhouse from "../public/social/rtbhouse.png";
import sharethrough from "../public/social/sharethrough.png";
import shopee from "../public/social/shopee.jpeg";
import sinaweibo from "../public/social/sinaweibo.svg";
import smartyads from "../public/social/smartyads.png";
import smatoo from "../public/social/smatoo.png";
import snapchat from "../public/social/snapchat.svg";
import soundcloud from "../public/social/soundcloud.png";
import spotify from "../public/social/spotify.png";
import stackadapt from "../public/social/stackadapt.png";
import taboola from "../public/social/taboola.png";
import teads from "../public/social/teads.png";
import telegram from "../public/social/telegram.png";
import triplelift from "../public/social/triplelift.png";
import twitch from "../public/social/twitch.png";
import verizon from "../public/social/verizon.svg";
import vkontakte from "../public/social/vkontakte.svg";
import walmart from "../public/social/walmart.png";
import wechat from "../public/social/wechat.svg";
import whatsapp from "../public/social/whatsapp.png";
import Xandr from "../public/social/Xandr.png";
import zemanta from "../public/social/zemanta.png";



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


// export const platformIcons: Record<string, StaticImageData> = {
//   Facebook: facebook,
//   Instagram: ig,
//   YouTube: youtube,
//   Youtube: youtube,
//   TheTradeDesk: TheTradeDesk,
//   Quantcast: Quantcast,
//   Google: google,
//   "Twitter/X": x,
//   LinkedIn: linkedin,
//   Linkedin: linkedin,
//   TikTok: tictok,
//   "Display & Video": Display,
//   Yahoo: yahoo,
//   Bing: bing,
//   "Apple Search": google,
//   "The Trade Desk": TheTradeDesk,
//   QuantCast: Quantcast,
// };

export const platformIcons: Record<string, StaticImageData> = {
	Facebook: facebook,
	Instagram: ig,
	YouTube: youtube,
	Youtube: youtube, // Case-insensitive matching
	TheTradeDesk: TheTradeDesk,
	Quantcast: Quantcast,
	Google: google,
	"Twitter/X": x,
	LinkedIn: linkedin,
	Linkedin: linkedin, // Case-insensitive matching
	TikTok: tictok,
	"Display & Video": Display,
	Yahoo: yahoo,
	Bing: bing,
	"Apple Search": google, // Use Google icon as fallback (aligned with search engines)
	"The Trade Desk": TheTradeDesk, // Consistency
	QuantCast: Quantcast, // Case variation
	Adroll: adroll,
	Adsterra: adsterra,
	Alibaba: alibaba,
	Amazon: amazon,
	BuySell: buysell,
	Choozle: choozle,
	Criteo: criteo,
	Dailymotion: daily,
	eBay: ebay,
	Epom: epom,
	Etsy: etsy,
	Flipkart: flipkart,
	Hulu: hulu,
	IndexExchange: indexchange,
	JD: jd,
	Kakao: Kakao_logo,
	Lazada: lazada,
	Line: line,
	LiveIntent: liveintent,
	Magnite: magnite,
	MediaMath: mediamath,
	MercadoLibre: mercado,
	MGID: mgid,
	Microsoft: microsoft,
	Mozilla: mozilla,
	Nativo: nativo,
	Newegg: newegg,
	OpenX: openx,
	Outbrain: outbrain,
	Pandora: pandora,
	Plista: plista,
	PopAds: popads,
	Pubmatic: pubmatic,
	Quora: quora,
	Rakuten: rakuten,
	Reddit: reddit,
	Revcontent: revcontent,
	RTBHouse: rtbhouse,
	Sharethrough: sharethrough,
	Shopee: shopee,
	Weibo: sinaweibo,
	SmartyAds: smartyads,
	Smaato: smatoo,
	Snapchat: snapchat,
	SoundCloud: soundcloud,
	Spotify: spotify,
	Stackadapt: stackadapt,
	Taboola: taboola,
	Teads: teads,
	Telegram: telegram,
	TripleLift: triplelift,
	Twitch: twitch,
	Verizon: verizon,
	Vkontakte: vkontakte,
	Walmart: walmart,
	WeChat: wechat,
	WhatsApp: whatsapp,
	Xandr: Xandr,
	Zemanta: zemanta,
	Pinterest: google, // Use Google as fallback until proper icon is provided
	Tumblr: google, // Use Google as fallback until proper icon is provided
	DV360: Display, // Use Display icon (logical fit for display advertising)
  };



  export const getPlatformIcon = (platformName: string): StaticImageData => {
	if (!platformName) return google; // Default fallback
	const normalizedName = platformName
	  .replace(/[\s-]/g, "")
	  .replace(/&/g, "and")
	  .replace(/(.)([A-Z])/g, "$1$2");
	return (
	  platformIcons[platformName] ||
	  platformIcons[normalizedName] ||
	  platformIcons[platformName.toLowerCase()] ||
	  platformIcons[platformName.charAt(0).toUpperCase() + platformName.slice(1).toLowerCase()] ||
	  google // Final fallback
	);
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
	{ name: "Facebook", color: "#0866FF", icon: facebook },
	{ name: "Instagram", color: "#C13584", icon: ig },
	{ name: "TikTok", color: "#000000", icon: tictok },
	{ name: "YouTube", color: "#FF0000", icon: youtube },
	{ name: "Twitter/X", color: "#000000", icon: x },
	{ name: "LinkedIn", color: "#0A66C2", icon: linkedin },
	{ name: "Snapchat", color: "#FFFC00", icon: snapchat },
	{ name: "Pinterest", color: "#E60023", icon: google }, // Fallback
	{ name: "Reddit", color: "#FF4500", icon: reddit },
	{ name: "Quora", color: "#B92B27", icon: quora },
	{ name: "WeChat", color: "#07C160", icon: wechat },
	{ name: "Weibo", color: "#E6162D", icon: sinaweibo },
	{ name: "Vkontakte", color: "#0077FF", icon: vkontakte },
	{ name: "Line", color: "#00C300", icon: line },
	{ name: "Kakao", color: "#FFCD00", icon: Kakao_logo },
	{ name: "Tumblr", color: "#001935", icon: google }, // Fallback
	{ name: "The Trade Desk", color: "#0099FA", icon: thetradedesk },
	{ name: "Quantcast", color: "#000000", icon: quantcast },
	{ name: "Display & Video", color: "#34A853", icon: Display },
	{ name: "DV360", color: "#1E8E3E", icon: Display }, // Logical fit
	{ name: "MediaMath", color: "#E6007A", icon: mediamath },
	{ name: "Xandr", color: "#FF3E59", icon: Xandr },
	{ name: "Verizon Media", color: "#DA291C", icon: verizon },
	{ name: "Amazon", color: "#FF9900", icon: amazon },
	{ name: "Adroll", color: "#0033CC", icon: adroll },
	{ name: "Criteo", color: "#F47C00", icon: criteo },
	{ name: "RTB House", color: "#EC1C24", icon: rtbhouse },
	{ name: "SmartyAds", color: "#FF5722", icon: smartyads },
	{ name: "Adsterra", color: "#FF4500", icon: adsterra },
	{ name: "PopAds", color: "#F5A623", icon: popads },
	{ name: "Smaato", color: "#0071BC", icon: smatoo },
	{ name: "Pubmatic", color: "#00AEEF", icon: pubmatic },
	{ name: "Magnite", color: "#E6001F", icon: magnite },
	{ name: "OpenX", color: "#FFA500", icon: openx },
	{ name: "Index Exchange", color: "#0097D7", icon: indexchange },
	{ name: "Stackadapt", color: "#1C1C1C", icon: stackadapt },
	{ name: "Choozle", color: "#4EAF4E", icon: choozle },
	{ name: "Teads", color: "#002244", icon: teads },
	{ name: "LiveIntent", color: "#FF6600", icon: liveintent },
	{ name: "Epom", color: "#0088CC", icon: epom },
	{ name: "QuantCast", color: "#000000", icon: quantcast },
	{ name: "Taboola", color: "#1F76C2", icon: taboola },
	{ name: "Outbrain", color: "#FF6600", icon: outbrain },
	{ name: "MGID", color: "#EC1C24", icon: mgid },
	{ name: "Revcontent", color: "#0083C1", icon: revcontent },
	{ name: "Plista", color: "#6D6E71", icon: plista },
	{ name: "Zemanta", color: "#E95A0C", icon: zemanta },
	{ name: "Nativo", color: "#0074C1", icon: nativo },
	{ name: "TripleLift", color: "#FF6600", icon: triplelift },
	{ name: "Sharethrough", color: "#00A37E", icon: sharethrough },
	{ name: "Microsoft Audience", color: "#0066B8", icon: microsoft },
	{ name: "BuySell", color: "#FF5722", icon: buysell },
	{ name: "Mozilla Tiles", color: "#C13832", icon: mozilla },
	{ name: "Telegram", color: "#0088CC", icon: telegram },
	{ name: "WhatsApp", color: "#25D366", icon: whatsapp },
	{ name: "Twitch", color: "#9146FF", icon: twitch },
	{ name: "eBay", color: "#E53238", icon: ebay },
	{ name: "Walmart", color: "#0071CE", icon: walmart },
	{ name: "Etsy", color: "#D5641C", icon: etsy },
	{ name: "Alibaba", color: "#FF6A00", icon: alibaba },
	{ name: "Rakuten", color: "#BF0000", icon: rakuten },
	{ name: "Newegg", color: "#F47B00", icon: newegg },
	{ name: "Mercado Libre", color: "#FFE600", icon: mercado },
	{ name: "Flipkart", color: "#2874F0", icon: flipkart },
	{ name: "JD", color: "#C7000B", icon: jd },
	{ name: "Lazada", color: "#F36C21", icon: lazada },
	{ name: "Shopee", color: "#FF5722", icon: shopee },
	{ name: "Spotify", color: "#1DB954", icon: spotify },
	{ name: "Pandora", color: "#0057FF", icon: pandora },
	{ name: "SoundCloud", color: "#FF5500", icon: soundcloud },
	{ name: "Hulu", color: "#1CE783", icon: hulu },
	{ name: "Dailymotion", color: "#0066DC", icon: daily },
	{ name: "Google", color: "#4285F4", icon: google },
	{ name: "Apple Search", color: "#000000", icon: google },
	{ name: "Yahoo", color: "#6001D2", icon: yahoo },
	{ name: "Bing", color: "#008373", icon: bing },
  ];