import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { formatDate } from "~/lib/utils"
import type { TaskStep } from "~/types/task"

interface TaskStepsProps {
  steps: TaskStep[]
}

export function TaskSteps({ steps }: TaskStepsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 hover:bg-green-600"
      case "in-progress":
        return "bg-blue-500 hover:bg-blue-600"
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "cancelled":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  if (steps.length === 0) {
    return null
  }

  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        className="p-0 h-auto flex items-center text-muted-foreground hover:text-foreground"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
        {steps.length} {steps.length === 1 ? "Step" : "Steps"}
      </Button>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-4 border-l-2 border-muted">
          {steps.map((step) => (
            <div key={step.id} className="bg-muted/50 rounded-md p-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h4 className="font-medium text-sm">{step.title}</h4>
                <Badge className={`${getStatusColor(step.status)} text-white text-xs`}>
                  {step.status.charAt(0).toUpperCase() + step.status.slice(1).replace("-", " ")}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Start:</span> {formatDate(step.startDate)}
                </div>
                <div>
                  <span className="font-medium">End:</span> {formatDate(step.endDate)}
                </div>
                <div>
                  <span className="font-medium">Assignee:</span> {step.assignee}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

