import React, { useEffect } from 'react';
import DefineAdSetPage from './DefineAdSetPage';
import PageHeaderWrapper from '../../../components/PageHeaderWapper';
import { useEditing } from '../../utils/EditingContext';
import { useComments } from 'app/utils/CommentProvider';

const DefineAdSet = () => {
  const { setIsEditing } = useEditing();
  const { setIsDrawerOpen, setClose } = useComments();

  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
    setIsEditing(true); // Always enable editing mode
  }, [setIsDrawerOpen, setClose, setIsEditing]);

  return (
    <div>
      <PageHeaderWrapper
        t1={'Define ad sets'}
        t2={'Specify the details and audiences for each ad set within your campaign.'}
        span={1}
      />
      <DefineAdSetPage />
    </div>
  );
};

export default DefineAdSet;