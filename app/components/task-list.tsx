import { TaskCard } from "~/components/task-card"
import { Pagination } from "~/components/pagination"
import type { Task } from "~/types/task"
import { Card } from "~/components/ui/card"

interface TaskListProps {
  tasks: Task[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function TaskList({ tasks, currentPage, totalPages, onPageChange }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No tasks found. Try adjusting your filters.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}

