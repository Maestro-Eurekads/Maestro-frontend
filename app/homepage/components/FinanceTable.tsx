"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Edit, Trash, Eye } from "lucide-react"

function FinanceTable() {
    const [expanded, setExpanded] = useState(false)

    const toggleExpand = () => {
      setExpanded(!expanded)
    }
  return (
    <table>
      <thead>
        <tr>
          <th className="py-[12px] px-[16px]">PO Name</th>
          <th className="py-[12px] px-[16px]">Total Budget</th>
          <th className="py-[12px] px-[16px]">Assigned Budget</th>
          <th className="py-[12px] px-[16px]">Assigned Media Plan</th>
          <th className="py-[12px] px-[16px]">Available Budget</th>
          <th className="py-[12px] px-[16px] whitespace-nowrap">PO Status</th>
          <th className="py-[12px] px-[16px]">Actions</th>
        </tr>
      </thead>
      <tbody>
          <tr className="border-b bg-white">
            <td className="py-[12px] px-[16px]">
              <div className="flex items-center">
                <span className="font-medium">PO 202341</span>
                <button onClick={toggleExpand} className="ml-2 text-gray-500 hover:text-gray-700">
                  {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </td>
            <td className="py-[12px] px-[16px]">$ 10,000.00</td>
            <td className="py-[12px] px-[16px]">$ 5,500.00</td>
            <td className="py-[12px] px-[16px]">
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">Running Spring 2023</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">Football Series 2023</span>
              </div>
            </td>
            <td className="py-[12px] px-[16px]">$ 4,500.00</td>
            <td className="py-[12px] px-[16px]">
              <span className="text-green-600">Open</span>
            </td>
            <td className="py-[12px] px-[16px]">
              <div className="flex space-x-2">
                <button className="text-gray-500 hover:text-gray-700">
                  <Edit size={18} />
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <Eye size={18} />
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <Trash size={18} />
                </button>
              </div>
            </td>
          </tr>

          {expanded && (
            <>
              <tr className="bg-gray-50 border-b">
                <td className="py-[12px] px-[16px]">
                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">Running Spring 2023</span>
                </td>
                <td className="py-[12px] px-[16px]"></td>
                <td className="py-[12px] px-[16px]">$ 2,500.00</td>
                <td className="py-[12px] px-[16px]"></td>
                <td className="py-[12px] px-[16px]"></td>
                <td className="py-[12px] px-[16px]"></td>
                <td className="py-[12px] px-[16px]"></td>
              </tr>
              <tr className="bg-gray-50 border-b">
                <td className="py-[12px] px-[16px]">
                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">Football Series 2023</span>
                </td>
                <td className="py-[12px] px-[16px]"></td>
                <td className="py-[12px] px-[16px]">$ 3,000.00</td>
                <td className="py-[12px] px-[16px]"></td>
                <td className="py-[12px] px-[16px]"></td>
                <td className="py-[12px] px-[16px]"></td>
                <td className="py-[12px] px-[16px]"></td>
              </tr>
            </>
          )}
        </tbody>
    </table>
  );
}

export default FinanceTable;
