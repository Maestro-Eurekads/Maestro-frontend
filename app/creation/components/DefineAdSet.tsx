import React, { useState } from 'react'
import DefineAdSetPage from './DefineAdSetPage'
import PageHeaderWrapper from '../../../components/PageHeaderWapper'
import { useEditing } from '../../utils/EditingContext';

const DefineAdSet = () => {
  const { isEditing, setIsEditing } = useEditing();
  return (
    <div>
      <div className='flex items-center justify-between'>
        <PageHeaderWrapper
          t1={'Define ad sets'}
          t2={'Specify the details and audiences for each ad set within your campaign.'}
          span={1}
        />
        {isEditing ? (
          ''
        ) : (
          <button className="model_button_blue" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        )}
      </div>




      <DefineAdSetPage />
    </div>
  )
}

export default DefineAdSet
