import { useState } from "react"
import { Calendar, ChevronDown, Menu, X } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Calendar as CalendarComponent } from "~/components/ui/calendar"
import { format, addDays, subDays } from "date-fns"
import { cn } from "~/lib/utils"

const tools = [
  { id: "drill-press", name: "Drill Press", color: "bg-blue-100 text-blue-800" },
  { id: "cnc-machine", name: "CNC Machine", color: "bg-green-100 text-green-800" },
  { id: "lathe", name: "Lathe", color: "bg-purple-100 text-purple-800" },
]

interface NavigationMenuProps {
  onToolSelect: (toolId: string) => void
  onDateSelect: (date: Date) => void
  onViewChange: (view: "assignment" | "table") => void
  selectedTool: string
  selectedDate: Date
  currentView: "assignment" | "table"
}

export default function NavigationMenu({
  onToolSelect,
  onDateSelect,
  onViewChange,
  selectedTool,
  selectedDate,
  currentView,
}: NavigationMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const today = new Date()
  const yesterday = subDays(today, 1)
  const tomorrow = addDays(today, 1)

  const quickDates = [
    { label: "Yesterday", date: yesterday },
    { label: "Today", date: today },
    { label: "Tomorrow", date: tomorrow },
  ]

  const handleToolClick = (toolId: string) => {
    onToolSelect(toolId)
    onViewChange("assignment")
    setIsMenuOpen(false)
  }

  const handleDateClick = (date: Date) => {
    onDateSelect(date)
    onViewChange("table")
    setShowDatePicker(false)
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden mb-4">
        <Button variant="outline" onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-full justify-between">
          <span className="flex items-center gap-2">
            <Menu className="h-4 w-4" />
            Navigation Menu
          </span>
          {isMenuOpen ? <X className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Menu */}
      <Card className={cn("mb-6", isMenuOpen ? "block" : "hidden md:block")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Menu className="h-5 w-5" />
            Quick Navigation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tools Section */}
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-3">Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {tools.map((tool) => (
                <Button
                  key={tool.id}
                  variant={selectedTool === tool.id ? "default" : "outline"}
                  onClick={() => handleToolClick(tool.id)}
                  className="justify-start h-auto p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", tool.color.split(" ")[0])} />
                    <span className="text-sm">{tool.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Dates Section */}
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-3">Quick Dates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {quickDates.map((quickDate) => (
                <Button
                  key={quickDate.label}
                  variant={
                    format(selectedDate, "yyyy-MM-dd") === format(quickDate.date, "yyyy-MM-dd") ? "default" : "outline"
                  }
                  onClick={() => handleDateClick(quickDate.date)}
                  className="justify-start h-auto p-3"
                >
                  <div className="text-left">
                    <div className="text-sm font-medium">{quickDate.label}</div>
                    <div className="text-xs text-gray-500">{format(quickDate.date, "MMM d")}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date Picker */}
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-3">Custom Date</h3>
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  Select Custom Date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && handleDateClick(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* View Toggle */}
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-3">Current View</h3>
            <div className="flex gap-2">
              <Button
                variant={currentView === "assignment" ? "default" : "outline"}
                onClick={() => onViewChange("assignment")}
                size="sm"
              >
                Assignment
              </Button>
              <Button
                variant={currentView === "table" ? "default" : "outline"}
                onClick={() => onViewChange("table")}
                size="sm"
              >
                Table
              </Button>
            </div>
          </div>

          {/* Current Selection Summary */}
          <div className="pt-4 border-t">
            <h3 className="font-medium text-sm text-gray-700 mb-2">Current Selection</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Tool</Badge>
                <span className="text-sm">{tools.find((t) => t.id === selectedTool)?.name || "None selected"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Date</Badge>
                <span className="text-sm">{format(selectedDate, "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">View</Badge>
                <span className="text-sm capitalize">{currentView}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
