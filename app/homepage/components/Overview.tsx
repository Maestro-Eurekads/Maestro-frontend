import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Table from '../../../components/Table';
import FiltersDropdowns from './FiltersDropdowns';

const Overview = () => {
  const router = useRouter()

  useEffect(() => {
    router.refresh();
  }, [router]);

  return (
    <div className='px-[72px]'>
      <div className='flex items-center gap-2 mt-[36.5px]'>
        <h1 className='media_text'>Media plans</h1>
      </div>
      <div className='mt-[20px]'>
        <FiltersDropdowns hideTitle={true} router={router} />
      </div>
      <Table />
    </div>
  )
}

export default Overview
