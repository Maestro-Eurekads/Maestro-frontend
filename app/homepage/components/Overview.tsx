import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import blueBtn from '../../../public/blueBtn.svg';
import Image from 'next/image'
import Table from '../../../components/Table';
import { useCampaigns } from '../../utils/CampaignsContext';
import FiltersDropdowns from './FiltersDropdowns';
import { useActive } from 'app/utils/ActiveContext';

const Overview = () => {
  const router = useRouter()
  const { setCampaignFormData } = useCampaigns()
  const { setActive, setSubStep } = useActive()

  const handleNewMediaPlan = () => {
    // Reset form data and steps before navigating
    setCampaignFormData({})
    setActive(0)
    setSubStep(0)
    router.push('/creation')
  }




  useEffect(() => {
    router.refresh();
  }, [router]);

  return (
    <div className='px-[72px]'>
      <div className='flex items-center gap-2 mt-[36.5px]'>
        <h1 className='media_text'>Media plans</h1>
        <button onClick={handleNewMediaPlan}>
          <Image src={blueBtn} alt='New media plan' priority />
        </button>
      </div>
      <div className='mt-[20px]'>
        <FiltersDropdowns hideTitle={true} router={router} />
      </div>
      <Table />
    </div>
  )
}

export default Overview
