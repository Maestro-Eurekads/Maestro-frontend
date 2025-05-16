export const processCampaignData = (campaigns, platformIcons) => {
	const colorMapping = {
		Awareness: "#3175FF",
		Consideration: "#00A36C",
		Conversion: "#FF9037",
		Loyalty: "#EF5407",
	};

	// const platformIcons = {
	// 	Facebook: facebook,
	// 	Instagram: ig,
	// 	YouTube: youtube,
	// 	TheTradeDesk: TheTradeDesk,
	// 	Quantcast: Quantcast,
	// 	Google: google,
	// 	"Twitter/X": x,
	// 	LinkedIn: linkedin,
	// 	TikTok: tictok,
	// 	"Display & Video": Display,
	// 	Yahoo: yahoo,
	// 	Bing: bing,
	// 	"Apple Search": google,
	// 	"The Trade Desk": TheTradeDesk,
	// 	QuantCast: Quantcast,
	// };


	return campaigns?.map((campaign) => ({
		...campaign, // Keep full original data
		funnel_stages: campaign?.funnel_stages?.map((stage) => ({
			name: stage,
			color: colorMapping[stage], // Default color if unknown
		})),
		display_networks: campaign?.channel_mix?.flatMap((channel) =>
			channel?.display_networks?.map((network) => ({
				platform_name: network?.platform_name,
				icon: platformIcons[network?.platform_name] || null, // Assign icon if platform exists
			})) || []
		),
		// social_media: campaign.channel_mix.flatMap((channel) =>
		// 	channel.social_media?.map((platform) => ({
		// 		platform_name: platform.platform_name,
		// 		icon: platformIcons[platform.platform_name] || null,
		// 	})) || []
		// ),
		// search_engines: campaign.channel_mix.flatMap((channel) =>
		// 	channel.search_engines?.map((engine) => ({
		// 		platform_name: engine.platform_name,
		// 		icon: platformIcons[engine.platform_name] || null,
		// 	})) || []
		// ),
	}));
};



