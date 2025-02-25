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
