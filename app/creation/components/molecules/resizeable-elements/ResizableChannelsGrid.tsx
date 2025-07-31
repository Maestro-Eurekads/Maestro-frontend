"use client";
import React, { useState } from "react";
import { format } from "date-fns";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useDateRange } from "src/date-range-context";
import { ChannelBar } from "./ChannelBar";
import type { Channel } from "./ResizableChannels"; // reuse existing type

interface Props {
  channels: Channel[];
  parentLeft: number;
  parentWidth: number;
  dateList: Date[];
  parentId: string;
  disableDrag?: boolean;
}

export default function ResizableChannelsGrid({
  channels: initChannels,
  parentLeft,
  parentWidth,
  dateList,
  parentId,
  disableDrag = false,
}: Props) {
  const [channels, setChannels] = useState(initChannels);
  const { range } = useDateRange();
  const { campaignFormData, setCopy } = useCampaigns();

  const handleCommit = (index: number) => (start: string, end: string) => {
    // Update local state
    setChannels((prev) =>
      prev.map((ch, i) =>
        i === index ? { ...ch, start_date: start, end_date: end } : ch,
      ),
    );

    // Persist into campaign data copy so other components re-render correctly
    setCopy(() => {
      const updated = JSON.parse(JSON.stringify(campaignFormData));
      const mix = updated.channel_mix.find((c: any) => c.funnel_stage === parentId);
      if (mix) {
        const group = mix[channels[index].channelName];
        if (Array.isArray(group)) {
          const platform = group.find((p: any) => p.platform_name === channels[index].name);
          if (platform) {
            platform.campaign_start_date = start;
            platform.campaign_end_date = end;
          }
        }
      }
      return updated;
    });
  };

  return (
    <div
      className="relative open_channel_btn_container"
      style={{
        gridTemplateColumns: `repeat(${dateList.length}, 1fr)`,
      }}
    >
      {channels.map((channel, idx) => (
        <ChannelBar
          key={channel.name}
          channel={channel}
          parentLeft={parentLeft}
          containerWidth={parentWidth}
          dateList={dateList}
          range={range as any}
          onCommit={handleCommit(idx)}
        />
      ))}
    </div>
  );
} 