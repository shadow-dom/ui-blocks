import { useState } from "react"
import { TaskList } from "~/components/task-list"
import { TaskFilter } from "~/components/task-filter"
import { TaskSearch } from "~/components/task-search"
import type { Task } from "../../types/task"
import { MOCK_TASKS } from "../../data/mock-tasks"

export function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const tasksPerPage = 5

  // Filter tasks based on status and search query
  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === "all" || task.status === filter
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Calculate pagination
  const indexOfLastTask = currentPage * tasksPerPage
  const indexOfFirstTask = indexOfLastTask - tasksPerPage
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask)
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when search changes
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Task Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
        <TaskSearch onSearch={handleSearch} />
        <TaskFilter currentFilter={filter} onFilterChange={handleFilterChange} />
      </div>

      <TaskList
        tasks={currentTasks}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

