import React, { useState } from 'react';
import { Trash } from 'lucide-react';
import Button from './button';
import Image from 'next/image';
import trade from '../../../../public/TheTradeDesk.svg';
import speaker from '../../../../public/mdi_megaphone.svg';
import facebook from '../../../../public/facebook.svg';
import youtube from '../../../../public/youtube.svg';
import instagram from '../../../../public/ig.svg';
import quantcast from '../../../../public/quantcast.svg';
import arrowdown from '../../../../public/arrow-down-2.svg';

const AwarenessEdit = () => {
  const [socialMedia, setSocialMedia] = useState([
    { id: 1, name: 'Facebook', icon: facebook },
    { id: 2, name: 'Instagram', icon: instagram },
    { id: 3, name: 'Youtube', icon: youtube },
    { id: 4, name: 'Add new channel' },
    { id: 5, name: 'Awareness', icon: arrowdown },
    { id: 6, name: 'Video Views', icon: arrowdown },
    { id: 7, name: 'Video Views', icon: arrowdown },
    { id: 8, name: 'Video Views', icon: arrowdown },
    { id: 9, name: 'CPV', icon: arrowdown },
    { id: 10, name: 'CPV', icon: arrowdown },
  ]);

  const removeSocialMedia = (id) => {
    setSocialMedia(socialMedia.filter(item => item.id !== id));
  };

  const displayNetwork = [
    { id: 1, name: 'The TradeDesk', icon: trade },
    { id: 2, name: 'QuantCast', icon: quantcast },
    { id: 3, name: 'Add new channel' },
    { id: 4, name: 'Add new channel' },
    { id: 5, name: 'Video Views', icon: arrowdown },
    { id: 6, name: 'Video Views', icon: arrowdown },
    { id: 7, name: 'CPV', icon: arrowdown },
    { id: 7, name: 'CPV', icon: arrowdown },
  ];

  const searchEngines = [{ id: 1, name: 'Add new channel' }];

  return (
    <div className="flex flex-col items-start p-6">
      {/* Header */}
      <div className="flex justify-between w-full items-center mb-4">
        <div className="flex items-center gap-4">
          <Image src={speaker} alt="Awareness icon" className="w-5 h-5" />
          <span className="text-black font-semibold">Awareness</span>
        </div>
        <Button
          text="Delete this stage"
          variant="danger"
          icon={Trash}
          onClick={() => alert('Deleted')}
          iconColor="text-white"
          className="rounded-full px-4 py-2 text-sm"
        />
      </div>

      {/* Social Media Section */}
      <div className="overflow-x-auto md:w-full gap-8">
        <h2 className="text-black font-bold text-md mb-4">Social Media</h2>
        <div className="grid grid-cols-4 gap-4">
          {socialMedia.map((item) => {
            const isArrowDown = item.icon === arrowdown;
            return (
              <div
                key={item.id}
                className={`flex items-center ${
                  isArrowDown ? 'justify-between' : 'gap-2'
                } px-4 py-3 rounded-md border border-gray-200 ${
                  item.name === 'Add new channel' ? 'bg-blue-500' : 'bg-white'
                }`}
              >
                {isArrowDown ? (
                  <>
                    <p
                      className={`text-md ${
                        item.name === 'Add new channel'
                          ? 'text-white'
                          : 'text-black'
                      }`}
                    >
                      {item.name}
                    </p>
                    <Image
                      src={item.icon}
                      alt={item.name}
                      className="w-4 h-4"
                    />
                  </>
                ) : (
                  <>
                    {item.icon && (
                      <Image
                        src={item.icon}
                        alt={item.name}
                        className="w-4 h-4"
                      />
                    )}
                    <p
                      className={`text-md ${
                        item.name === 'Add new channel'
                          ? 'text-white'
                          : 'text-black'
                      }`}
                    >
                      {item.name}
                    </p>
                    {(item.id === 1 || item.id === 2 || item.id === 3) && (
                      <button
                        onClick={() => {
                          removeSocialMedia(item.id);
                        }}
                        className="text-white bg-black rounded-full w-3 h-3 flex items-center justify-center"
                      >
                        x
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Display Network & Search Engines Section */}
      <div className="flex items-start justify-start gap-8 mt-8">
        {/* Display Network */}
        <div>
          <h2 className="text-black font-bold text-md mb-4">Display Network</h2>
          <div className="grid grid-cols-3 gap-4">
            {displayNetwork.slice(0, 7).map((item) => {
              const isArrowDown = item.icon === arrowdown;
              return (
                <a
                  key={item.id}
                  className={`flex items-center ${
                    isArrowDown ? 'justify-between' : 'gap-2'
                  } px-4 py-3 rounded-md border border-gray-200 ${
                    item.name === 'Add new channel' ? 'bg-blue-500' : 'bg-white'
                  }`}
                >
                  {isArrowDown ? (
                    <>
                      <p
                        className={`text-md ${
                          item.name === 'Add new channel'
                            ? 'text-white'
                            : 'text-black'
                        }`}
                      >
                        {item.name}
                      </p>
                      <Image
                        src={item.icon}
                        alt={item.name}
                        className="w-4 h-4"
                      />
                    </>
                  ) : (
                    <>
                      {item.icon && (
                        <Image
                          src={item.icon}
                          alt={item.name}
                          className="w-4 h-4"
                        />
                      )}
                      <p
                        className={`text-md ${
                          item.name === 'Add new channel'
                            ? 'text-white'
                            : 'text-black'
                        }`}
                      >
                        {item.name}
                      </p>
                    </>
                  )}
                </a>
              );
            })}
          </div>
        </div>

        {/* Search Engines */}
        <div>
          <h2 className="text-black font-bold text-md mb-4">Search Engines</h2>
          <div className="">
            {searchEngines.map((item) => (
              <a
                key={item.id}
                className={`flex px-4 py-3 rounded-md border border-gray-200 justify-center items-center gap-2 ${
                  item.name === 'Add new channel' ? 'bg-blue-500' : 'bg-white'
                }`}
              >
                <p
                  className={`text-md text-center ${
                    item.name === 'Add new channel' ? 'text-white' : 'text-black'
                  }`}
                >
                  {item.name}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwarenessEdit;
