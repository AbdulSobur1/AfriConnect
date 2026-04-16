'use client'

import { useState } from 'react'
import { ExperienceFilters, ExperienceCategory } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'

interface ExperienceFilterProps {
  filters: ExperienceFilters
  onFiltersChange: (filters: ExperienceFilters) => void
}

export function ExperienceFilter({ filters, onFiltersChange }: ExperienceFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const categories: { value: ExperienceCategory; label: string }[] = [
    { value: 'cultural', label: 'Cultural' },
    { value: 'culinary', label: 'Culinary' },
    { value: 'craft', label: 'Craft' },
    { value: 'ritual', label: 'Spiritual' },
    { value: 'community', label: 'Community' },
  ]

  const budgetRanges = [
    { label: 'Budget ($0-50)', range: [0, 50] },
    { label: 'Moderate ($50-100)', range: [50, 100] },
    { label: 'Luxury ($100+)', range: [100, 500] },
  ]

  const handleCategoryToggle = (category: ExperienceCategory) => {
    const newCategories = filters.category?.includes(category)
      ? filters.category.filter((c) => c !== category)
      : [...(filters.category || []), category]

    onFiltersChange({
      ...filters,
      category: newCategories.length > 0 ? newCategories : undefined,
    })
  }

  const handleBudgetChange = (range: [number, number]) => {
    onFiltersChange({
      ...filters,
      priceRange: range,
    })
  }

  const handleSearch = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
    })
  }

  const hasActiveFilters =
    filters.category?.length ||
    filters.priceRange ||
    filters.search ||
    filters.rating

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search experiences..."
          value={filters.search || ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Toggle */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full"
      >
        Filters {hasActiveFilters && `(${[filters.category?.length || 0, filters.priceRange ? 1 : 0, filters.rating ? 1 : 0].reduce((a, b) => a + b)})`}
      </Button>

      {/* Filters Dropdown */}
      {isOpen && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          {/* Categories */}
          <div>
            <h3 className="font-semibold text-sm mb-2 text-foreground">Type</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category.value}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.category?.includes(category.value) || false}
                    onChange={() => handleCategoryToggle(category.value)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">
                    {category.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <h3 className="font-semibold text-sm mb-2 text-foreground">Budget</h3>
            <div className="space-y-2">
              {budgetRanges.map((range) => (
                <label key={range.label} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="budget"
                    checked={
                      filters.priceRange?.[0] === range.range[0] &&
                      filters.priceRange?.[1] === range.range[1]
                    }
                    onChange={() => handleBudgetChange(range.range as [number, number])}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">
                    {range.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={() => {
                onFiltersChange({})
              }}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
