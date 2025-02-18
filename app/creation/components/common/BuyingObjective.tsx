import React, { useState } from 'react'
import Button from './button';
import Awareness from './Awareness';
import Consideration from './Consideration';
import Conversion from './Conversion';
import { Plus } from 'lucide-react';




const BuyingObjective = () => {
const [edit, setEdit]=useState(false)
	
  return (
      <div className='p-6 bg-white flex flex-col rounded-lg shadow-md w-full'>
			{/* main objective */}
            <div className='flex justify-between items-center mb-4'>


			<div className='flex items-center justify-between gap-2'>
				<div className='flex rounded-full bg-blue-500 justify-center size-6 items-center p-1'>
				<span className='text-white font-bold'>2</span>
				</div>
				<h1 className='text-blue-500 font-semibold text-base'>Your buying objectives and types</h1>
			</div>

		    {edit ? <Button text='Confirm changes' variant='secondary' onClick={() => setEdit(false)} /> : <Button text='Edit' variant='primary' className='!rounded-md h-[52px] whitespace-nowrap px-4 py-2 text-sm' onClick={() => setEdit(true)} />}
           
            
            </div>

        <div className=''>
		    {edit ? <Button 
        text='Add stages' 
        icon={Plus}
        className='rounded-full px-4 py-2 text-sm'
        variant='primary'
        onClick={() => setEdit(false)} /> : <Awareness edit={edit} />}
        
            <Awareness edit={edit} />

            </div>

            <div className=''>
            <Consideration edit={edit} />
            </div>

            <div className=''>
            <Conversion edit={edit} />
            </div>
                
		
		</div>
  )
}

export default BuyingObjective