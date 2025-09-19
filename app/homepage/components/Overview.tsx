import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Table from '../../../components/Table';
import { useCampaigns } from '../../utils/CampaignsContext';
import FiltersDropdowns from './FiltersDropdowns';
import { useActive } from 'app/utils/ActiveContext';

const Overview = () => {
  const router = useRouter()
  const { setCampaignFormData, selectedId, clientCampaignData } = useCampaigns()
  const { setActive, setSubStep } = useActive()
  const [isClientSwitching, setIsClientSwitching] = useState(false)

  const handleNewMediaPlan = () => {
    // Reset form data and steps before navigating
    setCampaignFormData({})
    setActive(0)
    setSubStep(0)

    // Clear the new plan session ID to ensure complete isolation for new plans
    // This prevents audience data from previous plans from appearing in new plans
    if (typeof window !== "undefined") {
      if ((window as any).__newPlanSessionId) {
        delete (window as any).__newPlanSessionId;
        console.log("Cleared new plan session ID for fresh plan creation");
      }
    }

    router.push('/creation')
  }




  useEffect(() => {
    router.refresh();
  }, [router]);

  // Detect client switching and clear data immediately
  useEffect(() => {
    if (selectedId) {
      setIsClientSwitching(true);
      // Clear data immediately when client changes
      const timeoutId = setTimeout(() => {
        setIsClientSwitching(false);
      }, 1000); // Reset after 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [selectedId]);

  return (
    <div className='px-[72px]'>
      <div className='flex items-center gap-2 mt-[36.5px]'>
        <h1 className='media_text'>Media plans</h1>
      </div>
      <div className='mt-[20px]'>
        <FiltersDropdowns key={selectedId} hideTitle={true} router={router} />
      </div>
      <Table key={selectedId} forceLoading={isClientSwitching} />
    </div>
  )
}

export default Overview
