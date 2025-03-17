import Image from 'next/image'
import React, { useState } from 'react'
import upload from "../../public/Featured icon.svg"
import icon from "../../public/Icon.svg"

const UploadModal = () => {
  const [isOpen, setIsOpen] = useState(true)
  
  const handleCancel = () => {
    // Add cancel logic here
    alert("Cancel clicked")
    setIsOpen(false)
  }

  const handleConfirm = () => {
    // Add confirm logic here 
    alert("Confirm clicked")
    setIsOpen(false)
  }

  const handleClose = () => {
    // Close the modal
    setIsOpen(false)
  }

  if (!isOpen) return null
  
  return (
    // Modal overlay - fixed position, centers content
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      {/* Modal container with scrolling */}
      <div className="relative bg-white w-full max-w-[771px] max-h-[90vh] rounded-[10px] shadow-md overflow-y-auto">
        {/* Modal content */}
        <div className="p-8 flex flex-col gap-4">
          <div className='absolute right-10 top-10 cursor-pointer' onClick={handleClose}>
            <Image src={icon} className='size-4' alt="x" />
          </div>
          
          <div className='flex flex-col items-center gap-4'>
            <Image src={upload} alt="upload" />
            <h2 className="font-bold text-xl tracking-tighter">Upload your previews</h2>
            <h2 className='font-lighter text-balance text-md text-black'>Upload the visuals for your selected formats. Each visual should have a corresponding preview.</h2>
          </div>

          {/* visual */}
          <div className='flex flex-col mt-6 gap-4'>
            <h2 className="font-bold text-xl text-center tracking-tighter">Collection (2 visuals)</h2>

            <div className='flex justify-center gap-6 flex-wrap'>
              <div className='w-[225px] h-[105px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors'>
                <div className="flex flex-col items-center gap-2 text-center">
                  <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.925781 14.8669H15.9258V16.5335H0.925781V14.8669ZM9.25911 3.89055V13.2002H7.59245V3.89055L2.53322 8.94978L1.35471 7.77128L8.42578 0.700195L15.4969 7.77128L14.3184 8.94978L9.25911 3.89055Z" fill="#3175FF"/>
                  </svg>
                  <p className="text-md text-black font-lighter mt-2">Upload visual 1</p>
                </div>    
              </div>

              <div className='w-[225px] h-[105px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors'>
                <div className="flex flex-col items-center gap-2 text-center">
                  <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.925781 14.8669H15.9258V16.5335H0.925781V14.8669ZM9.25911 3.89055V13.2002H7.59245V3.89055L2.53322 8.94978L1.35471 7.77128L8.42578 0.700195L15.4969 7.77128L14.3184 8.94978L9.25911 3.89055Z" fill="#3175FF"/>
                  </svg>
                  <p className="text-md font-lighter text-black mt-2">Upload visual 2</p>
                </div>    
              </div>
            </div>

            {/* image 3 visuals in a row */}
            <div className="mt-6 flex justify-center gap-6">
              <div className='w-[225px] h-[105px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors'>
                <div className="flex flex-col items-center gap-2 text-center">
                  <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.925781 14.8669H15.9258V16.5335H0.925781V14.8669ZM9.25911 3.89055V13.2002H7.59245V3.89055L2.53322 8.94978L1.35471 7.77128L8.42578 0.700195L15.4969 7.77128L14.3184 8.94978L9.25911 3.89055Z" fill="#3175FF"/>
                  </svg>
                  <p className="text-md font-lighter text-black mt-2">Upload visual 3</p>
                </div>    
              </div>

              <div className='w-[225px] h-[105px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors'>
                <div className="flex flex-col items-center gap-2 text-center">
                  <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.925781 14.8669H15.9258V16.5335H0.925781V14.8669ZM9.25911 3.89055V13.2002H7.59245V3.89055L2.53322 8.94978L1.35471 7.77128L8.42578 0.700195L15.4969 7.77128L14.3184 8.94978L9.25911 3.89055Z" fill="#3175FF"/>
                  </svg>
                  <p className="text-md font-lighter text-black mt-2">Upload visual 4</p>
                </div>    
              </div>

              <div className='w-[225px] h-[105px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors'>
                <div className="flex flex-col items-center gap-2 text-center">
                  <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.925781 14.8669H15.9258V16.5335H0.925781V14.8669ZM9.25911 3.89055V13.2002H7.59245V3.89055L2.53322 8.94978L1.35471 7.77128L8.42578 0.700195L15.4969 7.77128L14.3184 8.94978L9.25911 3.89055Z" fill="#3175FF"/>
                  </svg>
                  <p className="text-md font-lighter text-black mt-2">Upload visual 5</p>
                </div>    
              </div>
            </div>
              
            {/* visual 6 */}
            <div className="flex justify-center gap-6 mt-4">
              <div className='w-[225px] h-[105px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors'>
                <div className="flex flex-col items-center gap-2 text-center">
                  <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.925781 14.8669H15.9258V16.5335H0.925781V14.8669ZM9.25911 3.89055V13.2002H7.59245V3.89055L2.53322 8.94978L1.35471 7.77128L8.42578 0.700195L15.4969 7.77128L14.3184 8.94978L9.25911 3.89055Z" fill="#3175FF"/>
                  </svg>
                  <p className="text-md font-lighter text-black mt-2">Upload visual 6</p>
                </div>    
              </div>
            </div>
          </div>

          {/* button */}
          <div className="mt-12 flex flex-col sm:flex-row w-full justify-between gap-4">
            <button
              onClick={handleCancel}  
              className="px-4 py-2 text-gray-700 w-full sm:w-1/2 h-[44px] rounded-[8px] font-bold bg-white border border-gray-200 border-solid hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 w-full sm:w-1/2 h-[44px] font-bold bg-blue-600 rounded-[8px] text-white hover:bg-blue-700 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadModal