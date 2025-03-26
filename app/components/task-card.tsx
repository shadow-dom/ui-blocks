import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import type { Task } from "~/types/task"
import { formatDate } from "~/lib/utils"
import { Clock, Calendar, User } from "lucide-react"
import { TaskSteps } from "~/components/task-steps"

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
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

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{task.title}</CardTitle>
          <Badge className={`${getStatusColor(task.status)} text-white`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace("-", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{task.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Due: {formatDate(task.dueDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Created: {formatDate(task.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Assigned to: {task.assignee}</span>
          </div>
        </div>
        <TaskSteps steps={task.steps} />
      </CardContent>
      <CardFooter className="bg-muted/50 py-2 px-6">
        <div className="flex justify-between items-center w-full">
          <span className="text-xs text-muted-foreground">ID: {task.id}</span>
          <span className="text-xs font-medium">Priority: {task.priority}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

