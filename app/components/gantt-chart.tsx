"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import {
  ChevronDown,
  ChevronRight,
  Diamond,
  GripVertical,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRightIcon,
  Search,
  X,
  Star,
  Palette,
} from "lucide-react"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Badge } from "~/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"

interface Task {
  id: string
  name: string
  startDate: Date
  endDate: Date
  progress?: number
  type: "task" | "milestone" | "project"
  color: "blue" | "green" | "orange" | "red" | "purple" | "pink" | "indigo" | "teal"
  children?: Task[]
  expanded?: boolean
  level: number
  tags?: string[]
  assignee?: string
  priority?: "high" | "normal"
}

interface Milestone {
  id: string
  name: string
  date: Date
  type: "start" | "important" | "deadline"
}

interface DragState {
  isDragging: boolean
  dragType: "reorder" | "move" | "resize-left" | "resize-right" | null
  draggedTaskId: string | null
  startX: number
  startDate: Date | null
  originalDuration: number
}

interface FilterState {
  searchTerm: string
  selectedTags: string[]
}

const colorOptions = [
  { name: "Blue", value: "blue", class: "bg-blue-500" },
  { name: "Green", value: "green", class: "bg-green-500" },
  { name: "Orange", value: "orange", class: "bg-orange-500" },
  { name: "Red", value: "red", class: "bg-red-500" },
  { name: "Purple", value: "purple", class: "bg-purple-500" },
  { name: "Pink", value: "pink", class: "bg-pink-500" },
  { name: "Indigo", value: "indigo", class: "bg-indigo-500" },
  { name: "Teal", value: "teal", class: "bg-teal-500" },
] as const

const sampleTasks: Task[] = [
  {
    id: "1",
    name: "Launch SaaS Product",
    startDate: new Date("2025-06-30"),
    endDate: new Date("2025-08-15"),
    type: "project",
    color: "blue",
    level: 0,
    expanded: true,
    tags: ["high-priority", "launch"],
    assignee: "Project Manager",
    priority: "high",
    children: [
      {
        id: "2",
        name: "Setup web server",
        startDate: new Date("2025-06-30"),
        endDate: new Date("2025-07-10"),
        type: "project",
        color: "blue",
        level: 1,
        expanded: true,
        tags: ["infrastructure"],
        assignee: "DevOps Team",
        priority: "normal",
        children: [
          {
            id: "3",
            name: "Install Apache",
            startDate: new Date("2025-06-30"),
            endDate: new Date("2025-07-03"),
            type: "task",
            color: "green",
            level: 2,
            tags: ["apache"],
            assignee: "John Doe",
            priority: "normal",
          },
          {
            id: "4",
            name: "Configure firewall",
            startDate: new Date("2025-07-01"),
            endDate: new Date("2025-07-04"),
            type: "task",
            color: "green",
            level: 2,
            tags: ["security"],
            assignee: "Jane Smith",
            priority: "high",
          },
          {
            id: "5",
            name: "Setup load balancer",
            startDate: new Date("2025-07-02"),
            endDate: new Date("2025-07-05"),
            type: "task",
            color: "green",
            level: 2,
            tags: ["performance"],
            assignee: "Mike Johnson",
            priority: "normal",
          },
          {
            id: "6",
            name: "Configure ports",
            startDate: new Date("2025-07-03"),
            endDate: new Date("2025-07-04"),
            type: "task",
            color: "green",
            level: 2,
            tags: ["networking"],
            assignee: "John Doe",
            priority: "normal",
          },
          {
            id: "7",
            name: "Run tests",
            startDate: new Date("2025-07-08"),
            endDate: new Date("2025-07-09"),
            type: "task",
            color: "green",
            level: 2,
            tags: ["testing"],
            assignee: "QA Team",
            priority: "normal",
          },
        ],
      },
      {
        id: "8",
        name: "Website Design",
        startDate: new Date("2025-07-15"),
        endDate: new Date("2025-08-10"),
        type: "project",
        color: "purple",
        level: 1,
        expanded: true,
        tags: ["design"],
        assignee: "Design Team",
        priority: "high",
        children: [
          {
            id: "9",
            name: "Contact designers",
            startDate: new Date("2025-07-15"),
            endDate: new Date("2025-07-18"),
            type: "task",
            color: "pink",
            level: 2,
            tags: ["recruitment"],
            assignee: "HR Team",
            priority: "normal",
          },
          {
            id: "10",
            name: "Create shortlist",
            startDate: new Date("2025-07-20"),
            endDate: new Date("2025-07-22"),
            type: "task",
            color: "indigo",
            level: 2,
            tags: ["selection"],
            assignee: "Design Lead",
            priority: "normal",
          },
          {
            id: "11",
            name: "Review final design",
            startDate: new Date("2025-07-25"),
            endDate: new Date("2025-07-28"),
            type: "task",
            color: "teal",
            level: 2,
            tags: ["review"],
            assignee: "Design Team",
            priority: "high",
          },
          {
            id: "12",
            name: "Management approval",
            startDate: new Date("2025-07-30"),
            endDate: new Date("2025-07-30"),
            type: "milestone",
            color: "blue",
            level: 2,
            tags: ["milestone"],
            assignee: "Project Manager",
            priority: "high",
          },
          {
            id: "13",
            name: "Apply design to website",
            startDate: new Date("2025-08-01"),
            endDate: new Date("2025-08-10"),
            type: "task",
            color: "green",
            level: 2,
            tags: ["implementation"],
            assignee: "Frontend Team",
            priority: "normal",
          },
        ],
      },
      {
        id: "14",
        name: "Setup Test Strategy",
        startDate: new Date("2025-06-30"),
        endDate: new Date("2025-07-10"),
        type: "project",
        color: "blue",
        level: 1,
        expanded: true,
        tags: ["testing"],
        assignee: "QA Lead",
        priority: "normal",
        children: [
          {
            id: "15",
            name: "Hire QA staff",
            startDate: new Date("2025-06-30"),
            endDate: new Date("2025-07-08"),
            type: "task",
            color: "orange",
            level: 2,
            tags: ["hiring"],
            assignee: "HR Team",
            priority: "high",
          },
        ],
      },
    ],
  },
]

const milestones: Milestone[] = [
  {
    id: "m1",
    name: "Project start",
    date: new Date("2025-06-30"),
    type: "start",
  },
  {
    id: "m2",
    name: "Important date",
    date: new Date("2025-07-15"),
    type: "important",
  },
]

export function GanttChart() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks)
  const [startDate, setStartDate] = useState(new Date("2025-06-29"))
  const [endDate, setEndDate] = useState(new Date("2025-08-17"))
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [filterState, setFilterState] = useState<FilterState>({
    searchTerm: "",
    selectedTags: [],
  })
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: null,
    draggedTaskId: null,
    startX: 0,
    startDate: null,
    originalDuration: 0,
  })
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // Sync header and body scrolling
  const handleTimelineScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerRef.current) {
      headerRef.current.scrollLeft = e.currentTarget.scrollLeft
    }
  }

  // Get all unique tags for filtering
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    const extractTags = (taskList: Task[]) => {
      taskList.forEach((task) => {
        task.tags?.forEach((tag) => tags.add(tag))
        if (task.children) extractTags(task.children)
      })
    }
    extractTags(tasks)
    return Array.from(tags)
  }, [tasks])

  // Auto-adjust parent task boundaries
  const adjustParentBoundaries = useCallback((taskList: Task[]): Task[] => {
    return taskList.map((task) => {
      if (task.children && task.children.length > 0) {
        const adjustedChildren = adjustParentBoundaries(task.children)

        // Calculate min start date and max end date from children
        const childStartDates = adjustedChildren.map((child) => child.startDate)
        const childEndDates = adjustedChildren.map((child) => child.endDate)

        const minStartDate = new Date(Math.min(...childStartDates.map((d) => d.getTime())))
        const maxEndDate = new Date(Math.max(...childEndDates.map((d) => d.getTime())))

        return {
          ...task,
          children: adjustedChildren,
          startDate: minStartDate,
          endDate: maxEndDate,
        }
      }
      return task
    })
  }, [])

  // Get the current working task list (with parent boundaries adjusted)
  const workingTasks = useMemo(() => adjustParentBoundaries(tasks), [tasks, adjustParentBoundaries])

  // Create a flat list of all visible tasks for consistent rendering
  const flattenTasks = useCallback((taskList: Task[]): Task[] => {
    const result: Task[] = []

    const flatten = (tasks: Task[]) => {
      tasks.forEach((task) => {
        result.push(task)
        if (task.expanded && task.children) {
          flatten(task.children)
        }
      })
    }

    flatten(taskList)
    return result
  }, [])

  // Filter the working tasks
  const filteredTasks = useMemo(() => {
    if (!filterState.searchTerm && !filterState.selectedTags.length) {
      return workingTasks
    }

    const filterTask = (task: Task): Task | null => {
      const matchesSearch =
        !filterState.searchTerm || task.name.toLowerCase().includes(filterState.searchTerm.toLowerCase())

      const matchesTags =
        !filterState.selectedTags.length || filterState.selectedTags.some((tag) => task.tags?.includes(tag))

      const filteredChildren = (task.children?.map(filterTask).filter(Boolean) as Task[]) || []

      const hasMatchingChildren = filteredChildren.length > 0
      const taskMatches = matchesSearch && matchesTags

      if (taskMatches || hasMatchingChildren) {
        return {
          ...task,
          children: filteredChildren,
          expanded: hasMatchingChildren ? true : task.expanded,
        }
      }

      return null
    }

    return workingTasks.map(filterTask).filter(Boolean) as Task[]
  }, [workingTasks, filterState])

  // Get flat list of visible tasks for rendering
  const visibleTasks = useMemo(() => flattenTasks(filteredTasks), [filteredTasks, flattenTasks])

  const toggleTaskExpansion = (taskId: string, taskList: Task[]): Task[] => {
    return taskList.map((task) => {
      if (task.id === taskId) {
        return { ...task, expanded: !task.expanded }
      }
      if (task.children) {
        return { ...task, children: toggleTaskExpansion(taskId, task.children) }
      }
      return task
    })
  }

  const handleToggleExpansion = (taskId: string) => {
    setTasks((prev) => toggleTaskExpansion(taskId, prev))
  }

  const findTaskById = (taskId: string, taskList: Task[]): Task | null => {
    for (const task of taskList) {
      if (task.id === taskId) return task
      if (task.children) {
        const found = findTaskById(taskId, task.children)
        if (found) return found
      }
    }
    return null
  }

  const updateTaskById = (taskId: string, updates: Partial<Task>, taskList: Task[]): Task[] => {
    return taskList.map((task) => {
      if (task.id === taskId) {
        return { ...task, ...updates }
      }
      if (task.children) {
        return { ...task, children: updateTaskById(taskId, updates, task.children) }
      }
      return task
    })
  }

  const removeTaskById = (taskId: string, taskList: Task[]): Task[] => {
    return taskList.filter((task) => {
      if (task.id === taskId) return false
      if (task.children) {
        task.children = removeTaskById(taskId, task.children)
      }
      return true
    })
  }

  const insertTaskAtPosition = (
    task: Task,
    targetId: string,
    position: "before" | "after",
    taskList: Task[],
  ): Task[] => {
    const result: Task[] = []

    for (let i = 0; i < taskList.length; i++) {
      const currentTask = taskList[i]

      if (currentTask.id === targetId) {
        if (position === "before") {
          result.push(task)
          result.push(currentTask)
        } else if (position === "after") {
          result.push(currentTask)
          result.push(task)
        }
      } else {
        if (currentTask.children) {
          const updatedChildren = insertTaskAtPosition(task, targetId, position, currentTask.children)
          if (updatedChildren !== currentTask.children) {
            result.push({ ...currentTask, children: updatedChildren })
          } else {
            result.push(currentTask)
          }
        } else {
          result.push(currentTask)
        }
      }
    }

    return result
  }

  // Toggle priority
  const toggleTaskPriority = (taskId: string) => {
    const updatedTasks = updateTaskById(
      taskId,
      { priority: findTaskById(taskId, tasks)?.priority === "high" ? "normal" : "high" },
      tasks,
    )
    setTasks(updatedTasks)
  }

  // Change task color
  const changeTaskColor = (taskId: string, color: Task["color"]) => {
    const updatedTasks = updateTaskById(taskId, { color }, tasks)
    setTasks(updatedTasks)
  }

  // Date navigation
  const shiftDates = (direction: "left" | "right") => {
    const shiftDays = 7
    const multiplier = direction === "left" ? -1 : 1

    setStartDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() + shiftDays * multiplier)
      return newDate
    })

    setEndDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() + shiftDays * multiplier)
      return newDate
    })
  }

  // Fixed Drag and Drop for Task Reordering
  const handleTaskDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId)
    setDragState((prev) => ({ ...prev, draggedTaskId: taskId, dragType: "reorder" }))
  }

  const handleTaskDragOver = (e: React.DragEvent, taskId: string) => {
    e.preventDefault()
    setDragOverTaskId(taskId)
  }

  const handleTaskDragLeave = () => {
    setDragOverTaskId(null)
  }

  const handleTaskDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault()
    const draggedTaskId = e.dataTransfer.getData("text/plain")

    if (draggedTaskId === targetTaskId) {
      setDragOverTaskId(null)
      setDragState((prev) => ({ ...prev, draggedTaskId: null, dragType: null }))
      return
    }

    const draggedTask = findTaskById(draggedTaskId, tasks)
    if (!draggedTask) {
      setDragOverTaskId(null)
      setDragState((prev) => ({ ...prev, draggedTaskId: null, dragType: null }))
      return
    }

    // Remove the dragged task from its current position
    const tasksWithoutDragged = removeTaskById(draggedTaskId, tasks)

    // Insert the task at the new position
    const updatedTasks = insertTaskAtPosition(draggedTask, targetTaskId, "after", tasksWithoutDragged)

    setTasks(updatedTasks)
    setDragOverTaskId(null)
    setDragState((prev) => ({ ...prev, draggedTaskId: null, dragType: null }))
  }

  // Gantt Bar Drag and Resize
  const handleBarMouseDown = (e: React.MouseEvent, taskId: string, action: "move" | "resize-left" | "resize-right") => {
    e.preventDefault()
    const task = findTaskById(taskId, tasks)
    if (!task) return

    const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    setDragState({
      isDragging: true,
      dragType: action,
      draggedTaskId: taskId,
      startX: e.clientX,
      startDate: new Date(task.startDate),
      originalDuration: duration,
    })
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging || !dragState.draggedTaskId || !dragState.startDate) return

      const deltaX = e.clientX - dragState.startX
      const daysDelta = Math.round(deltaX / 30)

      const task = findTaskById(dragState.draggedTaskId, tasks)
      if (!task) return

      let newStartDate = new Date(dragState.startDate)
      let newEndDate = new Date(task.endDate)

      if (dragState.dragType === "move") {
        newStartDate.setDate(newStartDate.getDate() + daysDelta)
        newEndDate = new Date(newStartDate)
        newEndDate.setDate(newEndDate.getDate() + dragState.originalDuration - 1)
      } else if (dragState.dragType === "resize-left") {
        newStartDate.setDate(dragState.startDate.getDate() + daysDelta)
        if (newStartDate >= task.endDate) {
          newStartDate = new Date(task.endDate)
          newStartDate.setDate(newStartDate.getDate() - 1)
        }
      } else if (dragState.dragType === "resize-right") {
        newEndDate = new Date(task.endDate)
        newEndDate.setDate(newEndDate.getDate() + daysDelta)
        if (newEndDate <= task.startDate) {
          newEndDate = new Date(task.startDate)
          newEndDate.setDate(newEndDate.getDate() + 1)
        }
      }

      const updatedTasks = updateTaskById(
        dragState.draggedTaskId!,
        { startDate: newStartDate, endDate: newEndDate },
        tasks,
      )
      setTasks(updatedTasks)
    },
    [dragState, tasks],
  )

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      dragType: null,
      draggedTaskId: null,
      startX: 0,
      startDate: null,
      originalDuration: 0,
    })
  }, [])

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp])

  // Generate all individual days for the timeline
  const getAllDays = () => {
    const days = []
    const current = new Date(startDate)

    while (current <= endDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const allDays = getAllDays()
  const totalDays = allDays.length
  const timelineWidth = totalDays * 30

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-screen flex flex-col">
      {/* Search and Filter Section */}
      <div className="p-3 bg-gray-50 border-b flex-shrink-0">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search tasks..."
              value={filterState.searchTerm}
              onChange={(e) => setFilterState((prev) => ({ ...prev, searchTerm: e.target.value }))}
              className="w-48 h-8"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {allTags.slice(0, 6).map((tag) => (
              <Badge
                key={tag}
                variant={filterState.selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer text-xs h-6"
                onClick={() => {
                  setFilterState((prev) => ({
                    ...prev,
                    selectedTags: prev.selectedTags.includes(tag)
                      ? prev.selectedTags.filter((t) => t !== tag)
                      : [...prev.selectedTags, tag],
                  }))
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>

          {(filterState.searchTerm || filterState.selectedTags.length) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterState({ searchTerm: "", selectedTags: [] })}
              className="h-6 px-2"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Task List Sidebar */}
        <div
          className={cn(
            "bg-gray-50 border-r transition-all duration-300 ease-in-out flex-shrink-0",
            sidebarCollapsed ? "w-12" : "w-80",
          )}
        >
          <div className="h-16 bg-gray-100 border-b flex items-center px-3 justify-between">
            {!sidebarCollapsed && <h3 className="font-semibold text-gray-700 text-sm">TASKS</h3>}
            <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1">
              {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </Button>
          </div>
          <div className="overflow-y-auto flex-1">
            {visibleTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggleExpansion={handleToggleExpansion}
                onTogglePriority={toggleTaskPriority}
                onChangeColor={changeTaskColor}
                onDragStart={handleTaskDragStart}
                onDragOver={handleTaskDragOver}
                onDragLeave={handleTaskDragLeave}
                onDrop={handleTaskDrop}
                isDraggedOver={dragOverTaskId === task.id}
                collapsed={sidebarCollapsed}
              />
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Fixed Timeline Header */}
          <div className="h-16 bg-gray-100 border-b flex-shrink-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 h-8 bg-gray-200 border-b">
              <Button variant="ghost" size="sm" onClick={() => shiftDates("left")} className="p-1">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs font-medium">
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </span>
              <Button variant="ghost" size="sm" onClick={() => shiftDates("right")} className="p-1">
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Synchronized Header Scroll */}
            <div ref={headerRef} className="overflow-hidden">
              <div className="flex h-8" style={{ width: `${timelineWidth}px` }}>
                {allDays.map((day, index) => (
                  <div
                    key={index}
                    className="border-r border-gray-200 flex flex-col items-center justify-center text-xs bg-gray-100"
                    style={{ width: "30px", minWidth: "30px", maxWidth: "30px" }}
                  >
                    <div className="font-medium">{day.toLocaleDateString("en-US", { weekday: "narrow" })}</div>
                    <div className="text-gray-600">{day.getDate()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Body with Synchronized Scrolling */}
          <div className="flex-1 overflow-auto" ref={scrollRef} onScroll={handleTimelineScroll}>
            <div style={{ width: `${timelineWidth}px` }} className="h-full flex flex-col relative">
              {/* Grid Lines - Full Height */}
              <div className="absolute inset-0 pointer-events-none" style={{ width: `${timelineWidth}px` }}>
                {allDays.map((_, i) => (
                  <div key={i} className="absolute top-0 bottom-0 w-px bg-gray-200" style={{ left: `${i * 30}px` }} />
                ))}
                {/* Final grid line */}
                <div className="absolute top-0 bottom-0 w-px bg-gray-200" style={{ left: `${totalDays * 30}px` }} />
              </div>

              {/* Milestones */}
              {milestones.map((milestone) => {
                const dayOffset = Math.floor((milestone.date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                const leftPosition = dayOffset * 30 + 15

                return (
                  <div key={milestone.id}>
                    <div
                      className={cn(
                        "absolute top-0 bottom-0 w-0.5 z-10",
                        milestone.type === "start" && "bg-orange-400",
                        milestone.type === "important" && "bg-red-400",
                        milestone.type === "deadline" && "bg-red-600",
                      )}
                      style={{ left: `${leftPosition}px` }}
                    />
                    <div
                      className={cn(
                        "absolute top-2 z-20 px-2 py-1 rounded text-xs text-white font-medium",
                        milestone.type === "start" && "bg-orange-400",
                        milestone.type === "important" && "bg-red-400",
                        milestone.type === "deadline" && "bg-red-600",
                      )}
                      style={{ left: `${leftPosition + 5}px` }}
                    >
                      {milestone.name}
                    </div>
                  </div>
                )
              })}

              {/* Task Bars */}
              <div className="space-y-0 relative z-5">
                {visibleTasks.map((task) => (
                  <TaskBar
                    key={`bar-${task.id}`}
                    task={task}
                    startDate={startDate}
                    onMouseDown={handleBarMouseDown}
                    dragState={dragState}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface TaskRowProps {
  task: Task
  onToggleExpansion: (id: string) => void
  onTogglePriority: (id: string) => void
  onChangeColor: (id: string, color: Task["color"]) => void
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onDragOver: (e: React.DragEvent, taskId: string) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, taskId: string) => void
  isDraggedOver: boolean
  collapsed: boolean
}

function TaskRow({
  task,
  onToggleExpansion,
  onTogglePriority,
  onChangeColor,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  isDraggedOver,
  collapsed,
}: TaskRowProps) {
  const hasChildren = task.children && task.children.length > 0

  if (collapsed) {
    return (
      <div className="h-10 border-b border-gray-200 flex items-center justify-center">
        <div className="w-2 h-4 bg-gray-400 rounded" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "h-10 border-b border-gray-200 flex items-center px-2 hover:bg-gray-100 cursor-move text-sm group",
        task.level === 0 && "bg-orange-50 font-semibold",
        task.level === 1 && "bg-blue-50 font-medium",
        isDraggedOver && "bg-blue-200 border-blue-400 border-2",
        task.priority === "high" && "border-l-4 border-l-red-500",
      )}
      style={{ paddingLeft: `${8 + task.level * 16}px` }}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragOver={(e) => onDragOver(e, task.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, task.id)}
    >
      <div className="flex items-center space-x-1 flex-1 min-w-0">
        <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />

        {hasChildren ? (
          <button onClick={() => onToggleExpansion(task.id)} className="p-0.5 hover:bg-gray-200 rounded flex-shrink-0">
            {task.expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : (
          <div className="w-4 flex-shrink-0" />
        )}

        {task.type === "milestone" && <Diamond className="w-3 h-3 text-blue-500 flex-shrink-0" />}

        <div className="flex-1 min-w-0">
          <div className="truncate flex items-center gap-1">
            {task.name}
            {task.priority === "high" && <Star className="w-3 h-3 text-red-500 fill-red-500 flex-shrink-0" />}
          </div>
          {task.assignee && <div className="text-xs text-gray-500 truncate">{task.assignee}</div>}
        </div>

        {/* Controls - visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Priority Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onTogglePriority(task.id)
            }}
            className="h-6 w-6 p-0"
            title={task.priority === "high" ? "Remove high priority" : "Set high priority"}
          >
            <Star className={cn("w-3 h-3", task.priority === "high" ? "text-red-500 fill-red-500" : "text-gray-400")} />
          </Button>

          {/* Color Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Change color">
                <Palette className="w-3 h-3 text-gray-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" side="right">
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    className={cn(
                      "w-8 h-8 rounded border-2 hover:scale-110 transition-transform",
                      color.class,
                      task.color === color.value ? "border-gray-800" : "border-gray-300",
                    )}
                    onClick={() => onChangeColor(task.id, color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {task.tags && task.tags.length > 0 && (
          <Badge variant="secondary" className="text-xs px-1 py-0 h-4 flex-shrink-0">
            {task.tags[0]}
          </Badge>
        )}
      </div>
    </div>
  )
}

interface TaskBarProps {
  task: Task
  startDate: Date
  onMouseDown: (e: React.MouseEvent, taskId: string, action: "move" | "resize-left" | "resize-right") => void
  dragState: DragState
}

function TaskBar({ task, startDate, onMouseDown, dragState }: TaskBarProps) {
  const startOffset = Math.floor((task.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const leftPosition = startOffset * 30
  const width = duration * 30
  const isBeingDragged = dragState.draggedTaskId === task.id

  const getTaskBarColor = (task: Task) => {
    const baseColors = {
      blue: task.type === "project" ? "bg-blue-400 border-2 border-blue-600" : "bg-blue-500",
      green: "bg-green-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
      purple: "bg-purple-500",
      pink: "bg-pink-500",
      indigo: "bg-indigo-500",
      teal: "bg-teal-500",
    }

    return baseColors[task.color] || baseColors.blue
  }

  return (
    <div className="h-10 relative border-b border-gray-100">
      <div
        className={cn(
          "absolute top-1.5 h-7 rounded flex items-center px-2 text-xs text-white font-medium group cursor-move select-none",
          getTaskBarColor(task),
          task.type === "milestone" && "bg-blue-600 w-4 h-4 rotate-45 top-3",
          isBeingDragged && "opacity-75 shadow-lg z-30",
          task.priority === "high" && "ring-2 ring-red-400 ring-offset-1",
        )}
        style={{
          left: `${leftPosition}px`,
          width: task.type === "milestone" ? "16px" : `${Math.max(width, 60)}px`,
          minWidth: task.type === "milestone" ? "16px" : "60px",
        }}
        onMouseDown={(e) => onMouseDown(e, task.id, "move")}
      >
        {task.type !== "milestone" && (
          <>
            {/* Left resize handle */}
            <div
              className="absolute left-0 top-0 w-2 h-full bg-black bg-opacity-20 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => {
                e.stopPropagation()
                onMouseDown(e, task.id, "resize-left")
              }}
            />

            <span className="truncate flex-1 pointer-events-none flex items-center gap-1">
              {task.name}
              {task.priority === "high" && <Star className="w-3 h-3 fill-white" />}
            </span>

            {/* Right resize handle */}
            <div
              className="absolute right-0 top-0 w-2 h-full bg-black bg-opacity-20 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => {
                e.stopPropagation()
                onMouseDown(e, task.id, "resize-right")
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}
