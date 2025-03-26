"use client"

import { Button } from "~/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Don't show pagination if there's only one page
  if (totalPages <= 1) return null

  const renderPageButtons = () => {
    const pages = []

    // Always show first page
    pages.push(
      <Button
        key={1}
        variant={currentPage === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => onPageChange(1)}
        className="h-8 w-8"
      >
        1
      </Button>,
    )

    // Show ellipsis if needed
    if (currentPage > 3) {
      pages.push(
        <Button key="start-ellipsis" variant="ghost" size="sm" disabled className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>,
      )
    }

    // Show current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue // Skip first and last page as they're always shown

      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
          className="h-8 w-8"
        >
          {i}
        </Button>,
      )
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      pages.push(
        <Button key="end-ellipsis" variant="ghost" size="sm" disabled className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>,
      )
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className="h-8 w-8"
        >
          {totalPages}
        </Button>,
      )
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {renderPageButtons()}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  )
}

