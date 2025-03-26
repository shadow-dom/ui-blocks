export interface TaskStep {
  id: string
  title: string
  status: string
  startDate: string
  endDate: string
  assignee: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  createdAt: string
  dueDate: string
  assignee: string
  steps: TaskStep[]
}

