import React from 'react'
import bsxbasket from '../../../../public/bxs_basket.svg'
import Image from 'next/image';
   

interface  ObjectiveCardProps {
  title: string;
  description?: string;
  subtitle?: string;
  span?: number;
}



const ObjectiveCard = ({title, span, subtitle, description }: ObjectiveCardProps) => { 
  return (
      <div className='p-6 bg-white flex flex-col rounded-lg shadow-md'>
			{/* main objective */}
			<div className='flex items-center justify-between gap-2'>
				<div className='flex rounded-full bg-blue-500 justify-center size-6 items-center p-1'>
				<span className='text-white font-bold'>{span}</span>
				</div>
				<h1 className='text-blue-500 font-semibold text-base'>{title}</h1>

			</div>

            <div className='flex flex-col items-start mt-6 bg-gray-100 p-4 rounded-lg'>
                <p className='font-bold text-md'>{description}</p>

                <div className='flex justify-start items-center gap-4 p-4'>
                    <div className='flex items-center justify-center size-6 rounded-full bg-blue-500 text-white'>
                    <span><Image src={bsxbasket} className='size-3' alt='image'  /></span>
                    </div>
                <p className='text-sm'>{subtitle}</p>
                </div>
               
            
            </div>
                
		
		</div>
  )
}

export default ObjectiveCard
