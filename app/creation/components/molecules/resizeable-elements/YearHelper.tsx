import { format } from "date-fns"

interface YearSeparatorProps {
  year: string
  monthWidth: number
  monthsInYear: number
}

export const YearSeparator = ({ year, monthWidth, monthsInYear }: YearSeparatorProps) => (
  <div
    className="absolute top-0 left-0 h-full border-l-2 border-blue-500 bg-blue-50 bg-opacity-50"
    style={{
      width: `${monthWidth * monthsInYear}px`,
    }}
  >
    <div className="absolute -top-8 left-2 text-sm font-bold text-blue-600 bg-white px-2 py-1 rounded shadow">
      {year}
    </div>
  </div>
)

interface DateRangeInfoProps {
  range: Date[]
  yearMonths: Array<{ key: string; month: string; year: string; fullDate: Date }>
}

export const DateRangeInfo = ({ range, yearMonths }: DateRangeInfoProps) => {
  if (!range || range.length === 0) return null

  const startDate = range[0]
  const endDate = range[range.length - 1]

  return (
    <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
      <div className="flex justify-between items-center">
        <div>
          <strong>Date Range:</strong> {format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")}
        </div>
        <div>
          <strong>Total Months:</strong> {yearMonths.length}
        </div>
      </div>
    </div>
  )
}
