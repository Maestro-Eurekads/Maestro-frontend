"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import OverviewOfYourCampaignDayTimeline from "./OverviewOfYourCampaignDayTimeline"
import OverviewOfYourCampaignMonthTimeline from "./OverviewOfYourCampaignMonthTimeline"
import OverviewOfYourCampaignWeekTimeline from "./OverviewOfYourCampaignWeekTimeline"


interface TimelineContainerProps {
	range: string | any,
	dayDifference: number
	weekDifference: number
	monthDifference: number
	funnelsData: any[]
}

const OverViewTimelineContainer: React.FC<TimelineContainerProps> = ({
	range,
	dayDifference,
	weekDifference,
	monthDifference,
	funnelsData,
}) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const [showScrollIndicator, setShowScrollIndicator] = useState(false)

	// Check if we need to show the scroll indicator
	useEffect(() => {
		if (!containerRef.current) return

		const checkScroll = () => {
			const container = containerRef.current
			if (!container) return
			setShowScrollIndicator(container.scrollWidth > container.clientWidth)
		}

		checkScroll()
		window.addEventListener("resize", checkScroll)
		return () => window.removeEventListener("resize", checkScroll)
	}, [range, dayDifference, weekDifference, monthDifference])



	// Render the appropriate timeline components based on the range
	const renderTimeline = () => {
		switch (range) {
			case "Day":
				return (
					<>
						<OverviewOfYourCampaignDayTimeline daysCount={dayDifference} funnels={funnelsData} />
					</>
				)
			case "Month":
				return (
					<>
						<OverviewOfYourCampaignMonthTimeline monthsCount={monthDifference} funnels={funnelsData} />
					</>
				)
			default: // Week is default
				return (
					<>
						<OverviewOfYourCampaignWeekTimeline weeksCount={weekDifference} funnels={funnelsData} />
					</>
				)
		}
	}

	return (
		<div className="box-border w-full min-h-[519px] bg-white border-b-2 relative">
			<div className="overflow-x-auto" ref={containerRef}>
				<div className="min-w-max">{renderTimeline()}</div>
			</div>
			{showScrollIndicator && (
				<div className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-l-md shadow-md animate-pulse">
					<ChevronRight className="h-5 w-5 text-gray-500" />
				</div>
			)}
		</div>
	)
}

export default OverViewTimelineContainer
