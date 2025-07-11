import { GanttChart } from "~/components/gantt-chart"

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6">Project Schedule</h1>
        <GanttChart />
      </div>
    </div>
  )
}
