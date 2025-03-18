import { BsFillMegaphoneFill } from "react-icons/bs";
import { TbCreditCardFilled, TbZoomFilled } from "react-icons/tb";
import facebook from '../public/social/facebook.svg';
import youtube from '../public/social/youtube.svg';
import thetradedesk from '../public/social/thetradedesk.svg';
import quantcast from '../public/social/quantcast.svg';
import google from '../public/social/google.svg';
import ig from '../public/social/ig.svg';
import x from '../public/x.svg';
import linkedin from '../public/linkedin.svg';
import TheTradeDesk from '../public/TheTradeDesk.svg';
import Quantcast from '../public/quantcast.svg';
import Display from '../public/Display.svg';
import Google from '../public/Google.svg';
import yahoo from '../public/yahoo.svg';
import bing from '../public/bing.svg';
import orangecredit from '../public/orangecredit-card.svg';
import tablerzoomfilled from '../public/tabler_zoom-filled.svg';
import tictok from '../public/tictok.svg';
import speaker from '../public/mdi_megaphone.svg';
import cursor from '../public/blue_fluent_cursor-click.svg';
import State12 from '../public/State12.svg';
import roundget from '../public/ic_round-get-app.svg';
import mingcute_basket from '../public/mingcute_basket-fill.svg';
import mdi_leads from '../public/mdi_leads.svg';



export const funnels = [
	{
		startWeek: 3,
		endWeek: 10,
		label: "Campaign 1",
		bg: "#3175FF",
		description: "Awareness",
		Icon: < BsFillMegaphoneFill />
	},
	{
		startWeek: 4,
		endWeek: 13,
		label: "Campaign 2",
		bg: "#0ABF7E",
		description: "Consideration",
		Icon: < TbZoomFilled />
	},
	{
		startWeek: 2,
		endWeek: 9,
		label: "Campaign 2",
		bg: "#ff9037",
		description: "Conversion",
		Icon: <TbCreditCardFilled />
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
				// { name: "Snapchat", icon: linkedin },
				// { name: "Pinterest", icon: linkedin },
				// { name: "Reddit", icon: linkedin },
				// { name: "Quora", icon: linkedin },
				// { name: "WeChat", icon: linkedin },
				// { name: "Weibo", icon: linkedin },
				// { name: "Vkontakte", icon: linkedin },
				// { name: "Line", icon: linkedin },
				// { name: "Kakao", icon: linkedin },
				// { name: "Tumblr", icon: linkedin },
			],
			"Display networks": [
				{ name: "The Trade Desk", icon: TheTradeDesk },
				{ name: "Quantcast", icon: Quantcast },
				{ name: "Display & Video", icon: Display },
				// { name: "DV360", icon: Display },
				// { name: "MediaMath", icon: Display },
				// { name: "Xandr", icon: Display },
				// { name: "Verizon Media", icon: Display },
				// { name: "Amazon", icon: Display },
				// { name: "Adroll", icon: Display },
				// { name: "Criteo", icon: Display },
				// { name: "RTB House", icon: Display },
				// { name: "SmartyAds", icon: Display },
				// { name: "Adsterra", icon: Display },
				// { name: "PopAds", icon: Display },
				// { name: "Smaato", icon: Display },
				// { name: "Pubmatic", icon: Display },
				// { name: "Magnite", icon: Display },
				// { name: "OpenX", icon: Display },
				// { name: "Index Exchange", icon: Display },
				// { name: "Stackadapt", icon: Display },
				// { name: "Choozle", icon: Display },
				// { name: "Teads", icon: Display },
				// { name: "LiveIntent", icon: Display },
				// { name: "Epom", icon: Display },
				// { name: "QuantCast", icon: Display },
				// { name: "Taboola", icon: Display },
				// { name: "Outbrain", icon: Display },
				// { name: "MGID", icon: Display },
				// { name: "Revcontent", icon: Display },
				// { name: "Plista", icon: Display },
				// { name: "Zemanta", icon: Display },
				// { name: "Nativo", icon: Display },
				// { name: "TripleLift", icon: Display },
				// { name: "Sharethrough", icon: Display },
				// { name: "Microsoft Audience", icon: Display },
				// { name: "BuySell", icon: Display },
				// { name: "Mozilla Tiles", icon: Display },
			],
			// "Messaging": [
			// 	{ name: "Telegram", icon: TheTradeDesk },
			// 	{ name: "WhatsApp", icon: TheTradeDesk },
			// ], 
			// "In-Game": [
			// 	{ name: "Twitch", icon: TheTradeDesk },
			// ],
			// "E-commerce": [
			// 	{ name: "Amazon", icon: TheTradeDesk },
			// 	{ name: "eBay", icon: TheTradeDesk },
			// 	{ name: "Walmart", icon: TheTradeDesk },
			// 	{ name: "Etsy", icon: TheTradeDesk },
			// 	{ name: "Alibaba", icon: TheTradeDesk },
			// 	{ name: "Rakuten", icon: TheTradeDesk },
			// 	{ name: "Newegg", icon: TheTradeDesk },
			// 	{ name: "Mercado Libre", icon: TheTradeDesk },
			// 	{ name: "Flipkart", icon: TheTradeDesk },
			// 	{ name: "JD", icon: TheTradeDesk },
			// 	{ name: "Lazada", icon: TheTradeDesk },
			// 	{ name: "Shopee", icon: TheTradeDesk },
			// 	{ name: "Lazada", icon: TheTradeDesk },
			// ],
			// "Streaming": [
			// 	{ name: "YouTube", icon: youtube },
			// 	{ name: "Spotify", icon: youtube },
			// 	{ name: "Pandora", icon: youtube },
			// 	{ name: "SoundCloud", icon: youtube },
			// 	{ name: "Twitch", icon: youtube },
			// 	{ name: "Hulu", icon: youtube },
			// 	{ name: "Dailymotion", icon: youtube },
			// 	{ name: "Vevo", icon: youtube },
			// 	{ name: "iHeartRadio", icon: youtube },
			// 	{ name: "Deezer", icon: youtube },
			// 	{ name: "Podcast Ad Network", icon: youtube },
			// ],
			"Search engines": [
				{ name: "Google", icon: Google },
				// { name: "Apple Search", icon: Google },
				{ name: "Yahoo", icon: yahoo },
			// 	{ name: "Bing", icon: bing },
				// { name: "Baidu", icon: bing },
				// { name: "Yandex", icon: bing },
				// { name: "Naver", icon: bing },
				// { name: "Seznam", icon: bing },
				// { name: "DuckDuck Go", icon: bing },
				// { name: "Ecosia", icon: bing },
			],
			// "Print": [
			// 	{ name: "Newspaper", icon: TheTradeDesk },
			// 	{ name: "Magazine", icon: TheTradeDesk },
			// 	{ name: "Brochures / Flyers", icon: TheTradeDesk },
			// 	{ name: "Inserts / Circulars", icon: TheTradeDesk },
			// 	{ name: "Catalogs", icon: TheTradeDesk },
			// 	{ name: "Direct mail", icon: TheTradeDesk },
			// 	{ name: "Door Hangers", icon: TheTradeDesk },
			// 	{ name: "Trade jounrals", icon: TheTradeDesk },
			// ],
			// "Broadcast": [
			// 	{ name: "Television", icon: TheTradeDesk },
			// 	{ name: "Radio", icon: TheTradeDesk },
			// 	{ name: "Product Placement (TV/Film) ", icon: TheTradeDesk },
			// 	{ name: "Cinema", icon: TheTradeDesk },
			// ],
			// "OOH": [
			// 	{ name: "Billboards", icon: TheTradeDesk },
			// 	{ name: "Transit", icon: TheTradeDesk },
			// 	{ name: "Street Furniture ", icon: TheTradeDesk },
			// 	{ name: "Mall & Retail", icon: TheTradeDesk },
			// 	{ name: "Airport", icon: TheTradeDesk },
			// 	{ name: "Gas Station", icon: TheTradeDesk },
			// 	{ name: "Stadium & Arena", icon: TheTradeDesk },
			// 	{ name: "Guerilla", icon: TheTradeDesk },
			// 	{ name: "Mobile Billboards", icon: TheTradeDesk },
			// 	{ name: "Building Wraps", icon: TheTradeDesk },
			// 	{ name: "Elevator & in-store screens", icon: TheTradeDesk },
			// 	{ name: "Telemarketing", icon: TheTradeDesk },
			// 	{ name: "Door-to-door ", icon: TheTradeDesk },
			// 	{ name: "Coupons ", icon: TheTradeDesk },
			// 	{ name: "Sampling & free trials ", icon: TheTradeDesk },
			// 	{ name: "Trade shows / Expos ", icon: TheTradeDesk },
			// 	{ name: "Conferences / Seminars", icon: TheTradeDesk },
			// 	{ name: "Pop-Up shops / Roadshows", icon: TheTradeDesk },
			// 	{ name: "In-store promotions", icon: TheTradeDesk },
			// 	{ name: "Events sponsorships", icon: TheTradeDesk },
			// ],
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
		description: "Reach as many people as possible and generate brand recall. Get people to watch your video."
	},
	{
		id: 2,
		icon: cursor,
		title: "Traffic",
		description: "Increase website visits to maximize audience reach and engagement."
	},
	{
		id: 3,
		icon: mingcute_basket,
		title: "Purchase",
		description: "Get as many people as possible to buy your product/service."
	},
	{
		id: 4,
		icon: mdi_leads,
		title: "Lead Generation",
		description: "Get as many people as possible to provide their contact information."
	},
	{
		id: 5,
		icon: roundget,
		title: "App Install",
		description: "Encourage users to download and install your mobile app."
	},
	{
		id: 6,
		icon: State12,
		title: "Video Views",
		description: "Boost the number of views on your video content to increase engagement."
	}
];
