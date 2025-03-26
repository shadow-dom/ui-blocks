import { Button } from "~/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { Filter } from "lucide-react"

interface TaskFilterProps {
  currentFilter: string
  onFilterChange: (filter: string) => void
}

export function TaskFilter({ currentFilter, onFilterChange }: TaskFilterProps) {
  const filters = [
    { value: "all", label: "All Tasks" },
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ]

  const currentFilterLabel = filters.find((f) => f.value === currentFilter)?.label || "All Tasks"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Filter: {currentFilterLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {filters.map((filter) => (
          <DropdownMenuItem
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={currentFilter === filter.value ? "bg-muted font-medium" : ""}
          >
            {filter.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

