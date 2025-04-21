import React, { useCallback, useEffect, useState } from "react";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import ObjectiveCard from "./common/ObjectiveCard";
import BuyingObjective from "./common/BuyingObjective";
import { useCampaigns } from "../../utils/CampaignsContext";
import { useComments } from "app/utils/CommentProvider";
import Button from "./common/button";
import Image, { StaticImageData } from "next/image";
import { getPlatformIcon } from "components/data";
import Link from "next/link";

interface OutletType {
  id: number;
  outlet: string;
  icon: StaticImageData;
  adSets: any[];
  formats: any[];
}

const SetBuyObjectivesAndTypesSubStep = () => {
  const [obj, setObj] = useState("");
  const [platforms, setPlatforms] = useState<Record<string, OutletType[]>>({});
  const { campaignFormData } = useCampaigns();
  const { setIsDrawerOpen, setClose } = useComments();

  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
  }, []);

  const getPlatformsFromStage = useCallback(() => {
    const platformsByStage: Record<string, OutletType[]> = {};
    const channelMix = campaignFormData?.channel_mix || [];

    channelMix &&
      channelMix?.length > 0 &&
      channelMix.forEach((stage: any) => {
        const {
          funnel_stage,
          search_engines,
          display_networks,
          social_media,
          streaming,
          mobile,
          ooh,
          broadcast,
          in_game,
          e_commerce,
          messaging,
          print,
        } = stage;

        if (!platformsByStage[funnel_stage])
          platformsByStage[funnel_stage] = [];

        [
          search_engines,
          display_networks,
          social_media,
          streaming,
          mobile,
          ooh,
          broadcast,
          in_game,
          e_commerce,
          messaging,
          print,
        ].forEach((platformGroup) => {
          if (Array.isArray(platformGroup)) {
            platformGroup.forEach((platform: any) => {
              const icon = getPlatformIcon(platform?.platform_name);
              platformsByStage[funnel_stage].push({
                id: Math.floor(Math.random() * 1000000),
                outlet: platform.platform_name,
                icon,
                adSets: platform?.ad_sets,
                formats: platform?.format,
              });
            });
          }
        });
      });

    return platformsByStage;
  }, [campaignFormData]);

  useEffect(() => {
    if (campaignFormData) {
      const data = getPlatformsFromStage();
      setPlatforms(data);
    }
  }, [campaignFormData, getPlatformsFromStage]);

  return (
    <div>
      <PageHeaderWrapper
        t1="Nice ! Here’s a recap of the buying objectives and types you have set for each platform."
        t2="If it’s all good for you, click on Continue. If not, feel free to click on Edit for each funnel phase to adapt your choices as needed."
      />

      <div className="mt-12 flex items-start flex-col gap-12 w-full max-w-[950px]">
        {/* 
        <ObjectiveCard
          title="The main objective of your campaign"
          span={1}
          subtitle={obj}
          description="You have chosen this objective"
        /> 
        */}

        {/* Funnel Stages */}
        <div className="p-6 bg-white flex flex-col rounded-lg shadow-md w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="flex rounded-full bg-blue-500 justify-center items-center w-6 h-6">
                <span className="text-white font-bold">1</span>
              </div>
              <h1 className="text-blue-500 font-semibold text-base">
                Your funnel stages
              </h1>
            </div>
            <Button
              text="Edit"
              variant="primary"
              className="!w-[85px] !h-[40px]"
            />
          </div>
          <div>
            {campaignFormData?.funnel_stages?.map((stage: string) => (
              <div
                className="relative w-full max-w-[685px] mx-auto text-black rounded-lg py-4 flex items-center justify-center gap-2"
                key={stage}
              >
                {stage}
              </div>
            ))}
          </div>
        </div>

        {/* Channel Mix */}
        <div className="p-6 bg-white flex flex-col rounded-lg shadow-md w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="flex rounded-full bg-blue-500 justify-center items-center w-6 h-6">
                <span className="text-white font-bold">2</span>
              </div>
              <h1 className="text-blue-500 font-semibold text-base">
                Your channel mix
              </h1>
            </div>
            <Button
              text="Edit"
              variant="primary"
              className="!w-[85px] !h-[40px]"
            />
          </div>

          {campaignFormData?.funnel_stages?.map((stage: string) => (
            <div
              className="relative w-full text-black rounded-lg py-4 gap-2"
              key={stage}
            >
              <div className="font-medium">{stage}</div>
              <div className="flex flex-wrap gap-2 mt-4">
                {platforms[stage]?.map((platform) => (
                  <div
                    key={platform.id}
                    className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg"
                  >
                    <Image
                      src={platform.icon}
                      alt={platform.outlet}
                      width={20}
                      height={20}
                    />
                    <span>{platform.outlet}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Adsets and Audiences */}
        <div className="p-6 bg-white flex flex-col rounded-lg shadow-md w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="flex rounded-full bg-blue-500 justify-center items-center w-6 h-6">
                <span className="text-white font-bold">3</span>
              </div>
              <h1 className="text-blue-500 font-semibold text-base">
                Your Adset and Audiences
              </h1>
            </div>
            <Button
              text="Edit"
              variant="primary"
              className="!w-[85px] !h-[40px]"
            />
          </div>
          <div>
            {Object.keys(platforms).map((stage) => (
              <div key={stage} className="mb-6">
                <h2 className="font-semibold text-lg mb-2">{stage}</h2>
                <div className="flex flex-wrap gap-4">
                  {platforms[stage]?.map(
                    (platform) =>
                      platform?.adSets?.length > 0 && (
                        <div
                          key={platform.id}
                          className="p-4 bg-gray-100 rounded-lg shadow-sm w-full max-w-[300px]"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Image
                              src={platform.icon}
                              alt={platform.outlet}
                              width={24}
                              height={24}
                            />
                            <span className="font-medium">
                              {platform.outlet}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {/* Replace this with actual ad set data */}
                            {platform.adSets.map((adSet, index) => (
                              <div key={index} className="mb-1 flex gap-3">
                                <span className="font-semibold">
                                  {adSet.name}
                                </span>
                                <span className="font-semibold">
                                  {adSet.audience_type}
                                </span>
                                <span className="font-semibold">
                                  {adSet.size}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Format Selections */}
        <div className="p-6 bg-white flex flex-col rounded-lg shadow-md w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="flex rounded-full bg-blue-500 justify-center items-center w-6 h-6">
                <span className="text-white font-bold">4</span>
              </div>
              <h1 className="text-blue-500 font-semibold text-base">
                Your format selections
              </h1>
            </div>
            <Button
              text="Edit"
              variant="primary"
              className="!w-[85px] !h-[40px]"
            />
          </div>
          <div>
            {Object.keys(platforms).map((stage) => (
              <div key={stage} className="mb-6">
                <h2 className="font-semibold text-lg mb-2">{stage}</h2>
                <div className="flex flex-wrap gap-4">
                  {platforms[stage]?.map(
                    (platform) =>
                      platform?.formats?.length > 0 && (
                        <div
                          key={platform.id}
                          className="p-4 bg-gray-100 rounded-lg shadow-sm w-full max-w-[300px]"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Image
                              src={platform.icon}
                              alt={platform.outlet}
                              width={24}
                              height={24}
                            />
                            <span className="font-medium">
                              {platform.outlet}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {/* Replace this with actual ad set data */}
                            {platform.formats.map((adSet, index) => (
                              <div key={index} className="mb-1">
                                <div className="font-semibold">
                                  {adSet.format_type}
                                </div>
                                <div className="font-semibold">
                                  Number of visuals - {adSet.num_of_visuals}
                                </div>
                                {adSet?.previews?.length > 0 &&
                                  adSet?.previews?.map((preview, index) => (
                                    <div
                                      key={index}
                                      className="mb-1 flex gap-3"
                                    >
                                      <Link
                                        href={preview?.url}
                                        target="_blank"
                                        className="font-semibold underline"
                                      >
                                        Preview {index + 1}
                                      </Link>
                                    </div>
                                  ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buying Objective */}
        <BuyingObjective />
      </div>
    </div>
  );
};

export default SetBuyObjectivesAndTypesSubStep;
