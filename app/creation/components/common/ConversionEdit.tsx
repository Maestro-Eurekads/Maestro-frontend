import React, { useState } from 'react';
import { Trash } from 'lucide-react';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from './button';
import Image from 'next/image';

import trade from '../../../../public/TheTradeDesk.svg';
import facebook from '../../../../public/facebook.svg';
import card from "../../../../public/mdi_credit-card.svg";
import instagram from '../../../../public/ig.svg';
import quantcast from '../../../../public/quantcast.svg';
import arrowdown from '../../../../public/arrow-down-2.svg';
import google from '../../../../public/Google.svg';

const ConversionEdit = ({ onDelete }) => {
  // Social Media state and sequential addition
  const [socialMedia, setSocialMedia] = useState([
    { id: 1, name: 'Facebook', icon: facebook },
    { id: 2, name: 'Instagram', icon: instagram },
    { id: 3, name: 'Traffic' },
    { id: 4, name: 'Traffic' },
    { id: 5, name: 'CPM' },
    { id: 6, name: 'CPM' }
  ]);
  const socialTypes = [
    { name: 'Facebook', icon: facebook },
    { name: 'Instagram', icon: instagram },
    { name: 'Traffic' },
    { name: 'CPM' }
  ];
  const [socialIndex, setSocialIndex] = useState(0);
  const addNewSocialMediaChannel = () => {
    const nextId = socialMedia.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const channelToAdd = socialTypes[socialIndex % socialTypes.length];
    setSocialMedia([...socialMedia, { id: nextId, ...channelToAdd }]);
    setSocialIndex(socialIndex + 1);
  };
  const removeSocialMedia = (id) => {
    setSocialMedia(socialMedia.filter(item => item.id !== id));
  };

  // Display Network state and sequential addition
  const [displayNetwork, setDisplayNetwork] = useState([
    { id: 1, name: 'The TradeDesk', icon: trade },
    { id: 2, name: 'QuantCast', icon: quantcast },
    { id: 3, name: 'Traffic' },
    { id: 4, name: 'Traffic' },
    { id: 5, name: 'CPV' },
    { id: 6, name: 'CPV' }
  ]);
  const displayTypes = [
    { name: 'The TradeDesk', icon: trade },
    { name: 'QuantCast', icon: quantcast },
    { name: 'Traffic' },
    { name: 'CPV' }
  ];
  const [displayIndex, setDisplayIndex] = useState(0);
  const addNewDisplayNetworkChannel = () => {
    const nextId = displayNetwork.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const channelToAdd = displayTypes[displayIndex % displayTypes.length];
    setDisplayNetwork([...displayNetwork, { id: nextId, ...channelToAdd }]);
    setDisplayIndex(displayIndex + 1);
  };
  const removeDisplayNetwork = (id) => {
    setDisplayNetwork(displayNetwork.filter(item => item.id !== id));
  };

  // Search Engines state and sequential addition
  const [searchEngines, setSearchEngines] = useState([
    { id: 1, name: 'Google', icon: google },
    { id: 2, name: 'Traffic' },
    { id: 3, name: 'CPM' }
  ]);
  const searchTypes = [
    { name: 'Google', icon: google },
    { name: 'Traffic' },
    { name: 'CPM' }
  ];
  const [searchIndex, setSearchIndex] = useState(0);
  const addNewSearchEngineChannel = () => {
    const nextId = searchEngines.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const channelToAdd = searchTypes[searchIndex % searchTypes.length];
    setSearchEngines([...searchEngines, { id: nextId, ...channelToAdd }]);
    setSearchIndex(searchIndex + 1);
  };
  const removeSearchEngine = (id) => {
    setSearchEngines(searchEngines.filter(item => item.id !== id));
  };

  // A helper component for a channel item
  const ChannelItem = ({ item, onRemove }) => {
    // Check if we have the arrow down special case
    if (item.icon === arrowdown) {
      return (
        <div className="flex items-center justify-between px-4 py-3 rounded-md border border-gray-200 bg-white">
          <span className="text-md text-black whitespace-nowrap">{item.name}</span>
          <Image
            src={item.icon}
            alt={item.name}
            width={16}
            height={16}
            className="inline-block align-middle"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 rounded-md border border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          {item.icon && (
            <Image
              src={item.icon}
              alt={item.name}
              width={16}
              height={16}
              className="inline-block align-middle flex-shrink-0"
            />
          )}
          <span className="flex-grow text-md text-black min-w-0">{item.name}</span>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="flex-shrink-0 text-white bg-black rounded-full w-3 h-3 whitespace-nowrap flex items-center justify-center"
        >
          x
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-start p-6">
      {/* Header */}
      <div className="flex justify-between w-full items-center mb-4">
        <div className="flex items-center gap-4">
          <Image src={card} alt="Consideration icon" width={20} height={20} />
          <span className="text-black font-semibold">Conversion</span>
        </div>
        <Button
          text="Delete this stage"
          variant="danger"
          icon={Trash}
          onClick={() => {
            toast.success("Stage Deleted successfully!");
            setTimeout(() => onDelete(), 2000);
          }}
          iconColor="text-white"
          className="rounded-full px-4 py-2 text-sm"
        />
      </div>

      {/* Social Media Section */}
      <h2 className="text-black font-bold text-md mb-4">Social Media</h2>
      <div className="flex flex-col items-start mt-8 md:flex-row justify-center gap-4">
        <div className="grid grid-cols-3 md:grid-cols-3 w-[70%] gap-4">
          {socialMedia.map(item => (
            <ChannelItem key={item.id} item={item} onRemove={removeSocialMedia} />
          ))}
        </div>
        <Button
          text="Add new channel"
          variant="primary"
          onClick={addNewSocialMediaChannel}
          className="!rounded-md h-[52px] px-4 py-2 text-sm"
        />
      </div>

      {/* Display Network & Search Engines Section */}
      <div className="flex flex-col items-start gap-8 md:flex-row justify-center mt-8 w-full">
        {/* Display Network */}
        <div className="flex flex-col">
          <h2 className="text-black font-bold text-md mb-4">Display Network</h2>
          <div className="flex justify-center gap-6 w-full">
            <div className="grid grid-cols-2 md:grid-cols-2 w-full gap-4">
              {displayNetwork.map(item => (
                <ChannelItem key={item.id} item={item} onRemove={removeDisplayNetwork} />
              ))}
            </div>
            <Button
              text="Add new channel"
              variant="primary"
              onClick={addNewDisplayNetworkChannel}
              className="!rounded-md h-[52px] px-4 py-2 text-sm"
            />
          </div>
        </div>

        {/* Search Engines */}
        <div className="flex flex-col">
          <h2 className="text-black font-bold text-md mb-4">Search Engines</h2>
          <div className="flex justify-center gap-4">
            <div className="grid grid-cols-1 w-full gap-4">
              {searchEngines.map(item => (
                <ChannelItem key={item.id} item={item} onRemove={removeSearchEngine} />
              ))}
            </div>
            <Button
              text="Add new channel"
              variant="primary"
              onClick={addNewSearchEngineChannel}
              className="!rounded-md w-full h-[52px] px-4 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ConversionEdit;
