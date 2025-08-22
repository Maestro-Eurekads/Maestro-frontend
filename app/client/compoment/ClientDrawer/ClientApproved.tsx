import React, { useState } from "react";
import Image from "next/image";
import { useComments } from "app/utils/CommentProvider";
import tickcircle from "../../../../public/tick-circle.svg";
import tickcircles from "../../../../public/tick-circle-green.svg";
import { SVGLoader } from "components/SVGLoader";
import { useUserPrivileges } from "utils/userPrivileges";
import { toast } from "sonner";

const ClientApproved = ({ comment, commentId }) => {
  const { isClientApprover, isClient } = useUserPrivileges();
  const { approval, approvedIsLoading } = useComments();

  // Toggle approval state
  const handleApproval = () => {
    // Check if user is a client (Client overview || Campaign viewer) - they cannot approve
    if (isClient) {
      toast.error("Campaign viewer users cannot approve comments.");
      return;
    }

    // Check if user is a client approver
    if (!isClientApprover) {
      toast.error("You are not authorized to approve this comment.");
      return;
    }

    if (comment?.approved === false) {
      approval(comment?.documentId, true, commentId);
    }
  };

  return (
    <div>
      {approvedIsLoading ? (
        <SVGLoader width={"25px"} height={"25px"} color={"#0ABF7E"} />
      ) : (
        <div
          className="flex items-center gap-2 cursor-pointer whitespace-nowrap"
          onClick={handleApproval}>
          <button className="cursor-pointer">
            <Image
              src={comment?.approved ? tickcircles : tickcircle}
              alt="tickcircle"
              className="w-5"
            />
          </button>

          <p
            className={`w-[116px] font-semibold text-[13px] ${
              comment?.approved ? "text-[#0ABF7E]" : "text-[#292D32]"
            }`}>
            {comment?.approved ? "Marked as approved" : "Mark as approved"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientApproved;
