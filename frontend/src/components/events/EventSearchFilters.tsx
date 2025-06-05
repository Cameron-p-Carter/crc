'use client';

import { useState } from 'react';
import { EventCategory, SearchEventsParams } from '@/types/event';

interface EventSearchFiltersProps {
  onSearch: (filters: SearchEventsParams) => void;
}

export default function EventSearchFilters({ onSearch }: EventSearchFiltersProps) {
  const [filters, setFilters] = useState<SearchEventsParams>({
    category: undefined,
    location: '',
    startDate: '',
    endDate: '',
    minPrice: undefined,
    maxPrice: undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            className="w-full p-2 border rounded"
            value={filters.category || ''}
            onChange={(e) => setFilters({
              ...filters,
              category: e.target.value ? e.target.value as EventCategory : undefined
            })}
          >
            <option value="">All Categories</option>
            {Object.values(EventCategory).map((category) => (
              <option key={category} value={category}>
                {category.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Enter location"
            value={filters.location || ''}
            onChange={(e) => setFilters({
              ...filters,
              location: e.target.value
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={filters.startDate || ''}
            onChange={(e) => setFilters({
              ...filters,
              startDate: e.target.value
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={filters.endDate || ''}
            onChange={(e) => setFilters({
              ...filters,
              endDate: e.target.value
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Price
          </label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            placeholder="Min price"
            min="0"
            value={filters.minPrice || ''}
            onChange={(e) => setFilters({
              ...filters,
              minPrice: e.target.value ? Number(e.target.value) : undefined
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Price
          </label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            placeholder="Max price"
            min="0"
            value={filters.maxPrice || ''}
            onChange={(e) => setFilters({
              ...filters,
              maxPrice: e.target.value ? Number(e.target.value) : undefined
            })}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
          onClick={() => {
            setFilters({});
            onSearch({});
          }}
        >
          Clear
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>
    </form>
  );
}
