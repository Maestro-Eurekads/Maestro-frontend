"use client"

import { useEffect, useState } from "react"
import DefineAdSetPage from "./DefineAdSetPage"
import PageHeaderWrapper from "../../../components/PageHeaderWapper"
import { useEditing } from "../../utils/EditingContext"
import { useComments } from "app/utils/CommentProvider"
import Switch from "react-switch"

const DefineAdSet = () => {
  const { setIsEditing } = useEditing()
  const { setIsDrawerOpen, setClose } = useComments()
  const [view, setView] = useState<"channel" | "adset">("channel")

  useEffect(() => {
    setIsDrawerOpen(false)
    setClose(false)
    setIsEditing(true) // Always enable editing mode
  }, [setIsDrawerOpen, setClose, setIsEditing])

  const handleToggleChange = (checked: boolean) => {
    const newView = checked ? "adset" : "channel"
    setView(newView)
  }

  return (
    <div>
      <PageHeaderWrapper
        t1={"Define ad sets"}
        t2={"Specify the details and audiences for each ad set within your campaign."}
        span={1}
      />

      <div className="flex justify-center gap-3 mt-4 mb-6">
        <p className="font-medium">Channel Granularity</p>
        <Switch
          checked={view === "adset"}
          onChange={handleToggleChange}
          onColor="#5cd08b"
          offColor="#3175FF"
          handleDiameter={18}
          uncheckedIcon={false}
          checkedIcon={false}
          height={24}
          width={48}
          borderRadius={24}
          activeBoxShadow="0 0 2px 3px rgba(37, 99, 235, 0.2)"
          className="react-switch"
        />
        <p className="font-medium">Ad Set Granularity</p>
      </div>

      <DefineAdSetPage />
    </div>
  )
}

export default DefineAdSet
