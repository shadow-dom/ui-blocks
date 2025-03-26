"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Search, X } from "lucide-react"

interface TaskSearchProps {
  onSearch: (query: string) => void
}

export function TaskSearch({ onSearch }: TaskSearchProps) {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleClear = () => {
    setQuery("")
    onSearch("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tasks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8 pr-8"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      <Button type="submit">Search</Button>
    </form>
  )
}

