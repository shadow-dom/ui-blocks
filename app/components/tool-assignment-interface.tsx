"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Calendar, ChevronDown, Plus, Search, X, Filter, Table, Grid, Eye } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Input } from "~/components/ui/input"
import { Badge } from "~/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Calendar as CalendarComponent } from "~/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { format } from "date-fns"
import { cn } from "~/lib/utils"
import NavigationMenu from "./navigation-menu"

// Mock data
const tools = [
  {
    id: "drill-press",
    name: "Drill Press",
    slots: [
      { id: "chuck", name: "Chuck", type: "drill-bit" },
      { id: "table", name: "Work Table", type: "workpiece" },
      { id: "fence", name: "Fence", type: "guide" },
    ],
  },
  {
    id: "cnc-machine",
    name: "CNC Machine",
    slots: [
      { id: "spindle", name: "Spindle", type: "cutting-tool" },
      { id: "bed", name: "Machine Bed", type: "workpiece" },
      { id: "tool-changer", name: "Tool Changer", type: "cutting-tool" },
      { id: "coolant", name: "Coolant System", type: "consumable" },
    ],
  },
  {
    id: "lathe",
    name: "Lathe",
    slots: [
      { id: "chuck-lathe", name: "Chuck", type: "workpiece" },
      { id: "tool-post", name: "Tool Post", type: "cutting-tool" },
      { id: "tailstock", name: "Tailstock", type: "support" },
    ],
  },
]

const availableItems = [
  { id: "1", name: '1/4" Drill Bit', type: "drill-bit" },
  { id: "2", name: '1/2" Drill Bit', type: "drill-bit" },
  { id: "3", name: "Steel Block 4x4", type: "workpiece" },
  { id: "4", name: "Aluminum Plate", type: "workpiece" },
  { id: "5", name: 'End Mill 1/8"', type: "cutting-tool" },
  { id: "6", name: 'End Mill 1/4"', type: "cutting-tool" },
  { id: "7", name: "Turning Tool", type: "cutting-tool" },
  { id: "8", name: "Fence Guide", type: "guide" },
  { id: "9", name: "Coolant Fluid", type: "consumable" },
  { id: "10", name: "Live Center", type: "support" },
]

interface Assignment {
  id: string
  toolId: string
  toolName: string
  slotId: string
  slotName: string
  itemId: string
  itemName: string
  date: string
  dateKey: string
}

export default function ToolAssignmentInterface() {
  const [selectedTool, setSelectedTool] = useState<string>("drill-press")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentView, setCurrentView] = useState<"assignment" | "table">("assignment")
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({})
  const [showDropdown, setShowDropdown] = useState<Record<string, boolean>>({})

  // Table view states
  const [globalSearch, setGlobalSearch] = useState("")
  const [toolFilter, setToolFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>()
  const [itemFilter, setItemFilter] = useState("")

  const currentTool = tools.find((tool) => tool.id === selectedTool)
  const dateKey = format(selectedDate, "yyyy-MM-dd")

  // Fixed assignment key format using a separator that won't conflict
  const createAssignmentKey = (toolId: string, slotId: string, date: string) => {
    return `${toolId}|${slotId}|${date}`
  }

  const parseAssignmentKey = (key: string) => {
    const parts = key.split("|")
    return {
      toolId: parts[0],
      slotId: parts[1],
      date: parts[2],
    }
  }

  const getAssignedItem = (slotId: string) => {
    const assignmentKey = createAssignmentKey(selectedTool, slotId, dateKey)
    return assignments[assignmentKey]
  }

  const assignItemToSlot = (slotId: string, itemId: string) => {
    const assignmentKey = createAssignmentKey(selectedTool, slotId, dateKey)
    setAssignments((prev) => ({
      ...prev,
      [assignmentKey]: itemId,
    }))
  }

  const removeAssignment = (slotId: string) => {
    const assignmentKey = createAssignmentKey(selectedTool, slotId, dateKey)
    setAssignments((prev) => {
      const newAssignments = { ...prev }
      delete newAssignments[assignmentKey]
      return newAssignments
    })
  }

  // Mobile-friendly drag and drop handlers
  const handleTouchStart = (e: React.TouchEvent, itemId: string) => {
    setDraggedItem(itemId)
  }

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault()
    if (draggedItem) {
      assignItemToSlot(slotId, draggedItem)
      setDraggedItem(null)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent, slotId: string) => {
    if (draggedItem) {
      assignItemToSlot(slotId, draggedItem)
      setDraggedItem(null)
    }
  }

  const getFilteredItems = (slotType: string, searchTerm: string) => {
    return availableItems.filter(
      (item) => item.type === slotType && item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const getItemById = (itemId: string) => {
    return availableItems.find((item) => item.id === itemId)
  }

  const toggleDropdown = (slotId: string) => {
    setShowDropdown((prev) => ({
      ...prev,
      [slotId]: !prev[slotId],
    }))
  }

  // Generate all assignments for table view - FIXED
  const allAssignments: Assignment[] = useMemo(() => {
    const assignmentList: Assignment[] = []

    Object.entries(assignments).forEach(([key, itemId]) => {
      const { toolId, slotId, date } = parseAssignmentKey(key)
      const tool = tools.find((t) => t.id === toolId)
      const slot = tool?.slots.find((s) => s.id === slotId)
      const item = availableItems.find((i) => i.id === itemId)

      if (tool && slot && item) {
        assignmentList.push({
          id: key,
          toolId,
          toolName: tool.name,
          slotId,
          slotName: slot.name,
          itemId,
          itemName: item.name,
          date: format(new Date(date), "MMM d, yyyy"),
          dateKey: date,
        })
      }
    })

    return assignmentList
  }, [assignments])

  // Filter assignments for table view
  const filteredAssignments = useMemo(() => {
    return allAssignments.filter((assignment) => {
      const matchesGlobalSearch =
        globalSearch === "" ||
        assignment.toolName.toLowerCase().includes(globalSearch.toLowerCase()) ||
        assignment.slotName.toLowerCase().includes(globalSearch.toLowerCase()) ||
        assignment.itemName.toLowerCase().includes(globalSearch.toLowerCase()) ||
        assignment.date.toLowerCase().includes(globalSearch.toLowerCase())

      const matchesToolFilter = toolFilter === "all" || assignment.toolId === toolFilter
      const matchesDateFilter = !dateFilter || assignment.dateKey === format(dateFilter, "yyyy-MM-dd")
      const matchesItemFilter =
        itemFilter === "" || assignment.itemName.toLowerCase().includes(itemFilter.toLowerCase())

      return matchesGlobalSearch && matchesToolFilter && matchesDateFilter && matchesItemFilter
    })
  }, [allAssignments, globalSearch, toolFilter, dateFilter, itemFilter])

  // Navigation handlers
  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleViewChange = (view: "assignment" | "table") => {
    setCurrentView(view)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tool Assignment Manager</h1>
        </div>

        {/* Navigation Menu */}
        <NavigationMenu
          onToolSelect={handleToolSelect}
          onDateSelect={handleDateSelect}
          onViewChange={handleViewChange}
          selectedTool={selectedTool}
          selectedDate={selectedDate}
          currentView={currentView}
        />

        <Tabs
          value={currentView}
          onValueChange={(value) => setCurrentView(value as "assignment" | "table")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assignment" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Assignment View
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Table View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assignment" className="space-y-6">
            {/* Tool and Date Selection */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedTool} onValueChange={setSelectedTool}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select a tool" />
                </SelectTrigger>
                <SelectContent>
                  {tools.map((tool) => (
                    <SelectItem key={tool.id} value={tool.id}>
                      {tool.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-[200px] justify-start text-left font-normal bg-transparent"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(selectedDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {selectedTool && currentTool ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Available Items Panel */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Search className="h-5 w-5" />
                      Available Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {availableItems.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => handleDragStart(item.id)}
                          onTouchStart={(e) => handleTouchStart(e, item.id)}
                          className={cn(
                            "p-3 bg-white border rounded-lg cursor-move hover:shadow-md transition-all touch-manipulation",
                            draggedItem === item.id ? "shadow-lg scale-105 bg-blue-50 border-blue-300" : "",
                          )}
                        >
                          <div className="font-medium text-sm">{item.name}</div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {item.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tool Slots */}
                <div className="lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span>
                          {currentTool.name} - {format(selectedDate, "MMM d, yyyy")}
                        </span>
                        <Badge variant="outline">{currentTool.slots.length} slots</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4">
                        {currentTool.slots.map((slot) => {
                          const assignedItemId = getAssignedItem(slot.id)
                          const assignedItem = assignedItemId ? getItemById(assignedItemId) : null
                          const searchTerm = searchTerms[slot.id] || ""
                          const filteredItems = getFilteredItems(slot.type, searchTerm)
                          const isDropdownOpen = showDropdown[slot.id]

                          return (
                            <Card key={slot.id} className="border-2 border-dashed border-gray-200">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center justify-between">
                                  {slot.name}
                                  <Badge variant="outline" className="text-xs">
                                    {slot.type}
                                  </Badge>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {/* Drop Zone */}
                                <div
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, slot.id)}
                                  onTouchEnd={(e) => handleTouchEnd(e, slot.id)}
                                  className={cn(
                                    "min-h-[80px] border-2 border-dashed rounded-lg p-4 transition-colors touch-manipulation",
                                    draggedItem ? "border-blue-400 bg-blue-50" : "border-gray-300",
                                    assignedItem ? "bg-green-50 border-green-300" : "",
                                  )}
                                >
                                  {assignedItem ? (
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-medium text-sm">{assignedItem.name}</div>
                                        <Badge variant="secondary" className="text-xs mt-1">
                                          {assignedItem.type}
                                        </Badge>
                                      </div>
                                      <Button variant="ghost" size="sm" onClick={() => removeAssignment(slot.id)}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="text-center text-gray-500">
                                      <Plus className="h-6 w-6 mx-auto mb-2 opacity-50" />
                                      <p className="text-xs">Drop item here or search below</p>
                                    </div>
                                  )}
                                </div>

                                {/* Mobile-friendly Type-ahead */}
                                <div className="space-y-2">
                                  <div className="relative">
                                    <Input
                                      placeholder={`Search ${slot.type} items...`}
                                      value={searchTerm}
                                      onChange={(e) => {
                                        const value = e.target.value
                                        setSearchTerms((prev) => ({
                                          ...prev,
                                          [slot.id]: value,
                                        }))
                                        setShowDropdown((prev) => ({
                                          ...prev,
                                          [slot.id]: value.length > 0,
                                        }))
                                      }}
                                      onFocus={() => {
                                        if (searchTerm.length > 0) {
                                          setShowDropdown((prev) => ({
                                            ...prev,
                                            [slot.id]: true,
                                          }))
                                        }
                                      }}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-1 top-1 h-8 w-8 p-0"
                                      onClick={() => toggleDropdown(slot.id)}
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  {(isDropdownOpen || (searchTerm && filteredItems.length > 0)) && (
                                    <Card className="absolute z-10 w-full max-h-48 overflow-y-auto">
                                      <CardContent className="p-0">
                                        {(searchTerm
                                          ? filteredItems
                                          : availableItems.filter((item) => item.type === slot.type)
                                        ).map((item) => (
                                          <button
                                            key={item.id}
                                            onClick={() => {
                                              assignItemToSlot(slot.id, item.id)
                                              setSearchTerms((prev) => ({
                                                ...prev,
                                                [slot.id]: "",
                                              }))
                                              setShowDropdown((prev) => ({
                                                ...prev,
                                                [slot.id]: false,
                                              }))
                                            }}
                                            className="w-full text-left p-3 hover:bg-gray-100 border-b last:border-b-0 touch-manipulation"
                                          >
                                            <div className="font-medium text-sm">{item.name}</div>
                                            <Badge variant="secondary" className="text-xs mt-1">
                                              {item.type}
                                            </Badge>
                                          </button>
                                        ))}
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-500">
                    <ChevronDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a tool to begin assigning items</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="table" className="space-y-6">
            {/* Table Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Global Search */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium mb-2">Global Search</label>
                    <Input
                      placeholder="Search across all fields..."
                      value={globalSearch}
                      onChange={(e) => setGlobalSearch(e.target.value)}
                    />
                  </div>

                  {/* Tool Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Tool</label>
                    <Select value={toolFilter} onValueChange={setToolFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All tools" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All tools</SelectItem>
                        {tools.map((tool) => (
                          <SelectItem key={tool.id} value={tool.id}>
                            {tool.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateFilter ? format(dateFilter, "MMM d, yyyy") : "All dates"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
                        <div className="p-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDateFilter(undefined)}
                            className="w-full"
                          >
                            Clear Date Filter
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Item Search</label>
                  <Input
                    placeholder="Search items..."
                    value={itemFilter}
                    onChange={(e) => setItemFilter(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Assignments Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>All Assignments</span>
                  <Badge variant="outline">{filteredAssignments.length} assignments</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredAssignments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Tool</th>
                          <th className="text-left p-3 font-medium">Slot</th>
                          <th className="text-left p-3 font-medium">Assigned Item</th>
                          <th className="text-left p-3 font-medium">Date</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAssignments.map((assignment) => (
                          <tr key={assignment.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div className="font-medium">{assignment.toolName}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">{assignment.slotName}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">{assignment.itemName}</div>
                            </td>
                            <td className="p-3">
                              <div className="text-sm text-gray-600">{assignment.date}</div>
                            </td>
                            <td className="p-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newAssignments = { ...assignments }
                                  delete newAssignments[assignment.id]
                                  setAssignments(newAssignments)
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No assignments found</p>
                    <p className="text-sm">
                      Try adjusting your filters or create some assignments in the Assignment View
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
