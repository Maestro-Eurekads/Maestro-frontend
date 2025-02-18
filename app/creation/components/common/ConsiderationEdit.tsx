import React, { useState } from 'react';
import { Trash } from 'lucide-react';
import Button from './button';
import Image from 'next/image';
import trade from '../../../../public/TheTradeDesk.svg';
import facebook from '../../../../public/facebook.svg';
import table from "../../../../public/tabler_zoom-filled.svg";
import instagram from '../../../../public/ig.svg';
import quantcast from '../../../../public/quantcast.svg';
import arrowdown from '../../../../public/arrow-down-2.svg';
import google from '../../../../public/Google.svg';

const ConsiderationEdit = () => {
  const [socialMedia, setSocialMedia] = useState([
    { id: 1, name: 'Facebook', icon: facebook },
    { id: 2, name: 'Instagram', icon: instagram },
    { id: 3, name: 'Traffic'},
    { id: 4, name: 'Traffic' },
    { id: 5, name: 'CPM' },
    { id: 6, name: 'CPM' }
    
  ]);

  const removeSocialMedia = (id) => {
    setSocialMedia(socialMedia.filter(item => item.id !== id));
  };

  const displayNetwork = [
    { id: 1, name: 'The TradeDesk', icon: trade },
    { id: 2, name: 'QuantCast', icon: quantcast },
    { id: 3, name: 'Traffic' },
    { id: 4, name: 'Traffic' },
    { id: 5, name: 'CPV' },
    { id: 6, name: 'CPV'},
   
  ];

  const searchEngines = [
    { id: 1, name: 'Google', icon: google  },
    { id: 2, name: 'Traffic' },
    { id: 3, name: 'CPM' }
  ];

  return (
    <div className="flex flex-col items-start p-6">
      {/* Header */}
      <div className="flex justify-between w-full items-center mb-4">
        <div className="flex items-center gap-4">
          <Image src={table} alt="Awareness icon" className="w-5 h-5" />
          <span className="text-black font-semibold">Consideration</span>
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
        <h2 className="text-black font-bold text-md mb-4">Social Media</h2>
      <div className="flex flex-col items-start mt-8 md:flex-row justify-center gap-4">
        <div className="grid grid-cols-2 gap-4">
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
                    {(item.id === 1 || item.id === 2 ) && (
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


        <Button
          text='Add new channel'
          variant="primary"
          onClick={() => alert('Add a new channel')}  
          className='!rounded-md h-[52px] px-4 py-2 text-sm'
        
        />

      </div>

      {/* Display Network & Search Engines Section */}
      <div className="flex flex-col items-start gap-8 md:flex-row justify-center space-x-6 mt-8 w-full">
        <div className="flex flex-col">
          <h2 className="text-black font-bold text-md mb-4">Display Network</h2>
          <div className='flex justify-center gap-6'>

         
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayNetwork.slice(0, 6).map((item) => {
              const isArrowDown = item.icon === arrowdown;
              return (
                <a
                  key={item.id}
                  className={`flex items-center h-[52px] ${
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
          <button className='!rounded-md h-[52px] bg-blue-500 text-white px-4 py-2 text-sm'>Add new channel</button>
          </div>
        </div>


        {/* Search Engines */}
        <div className='flex flex-col'>
          <h2 className="text-black font-bold text-md mb-4">Search Engines</h2>
          <div className='flex justify-center gap-4'>
            <div className='grid grid-cols-1 gap-4'>
            {searchEngines.map((item) => (
              <a
                key={item.id}
                className={`flex px-4 py-3 h-[52px] rounded-md border border-gray-200 justify-center items-center gap-2 ${
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
            <button className='!rounded-md h-[52px] bg-blue-500 text-white px-4 py-2 text-sm'>Add new channel</button>
         </div>
        </div>
      </div>
    
    </div>
  );
};

export default ConsiderationEdit;
