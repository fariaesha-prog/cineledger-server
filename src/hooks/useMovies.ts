'use client';

import { useState, useEffect } from 'react';
import { MovieFilters, MoviesResponse } from '@/types/movie';
import { movieService } from '@/services/movie.service';

const INITIAL_FILTERS: MovieFilters = {
  search: '',
  genre: 'all',
  rating: 'all',
  sortBy: 'popularity',
  page: 1,
  limit: 12,
};

export function useMovies() {
  const [filters, setFilters] = useState<MovieFilters>(INITIAL_FILTERS);
  const [data, setData] = useState<MoviesResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await movieService.getMovies(filters);
        setData(response);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchMovies();
    }, filters.search ? 400 : 0); // Debounce search queries

    return () => clearTimeout(delayDebounce);
  }, [filters]);

  const updateFilter = (key: keyof MovieFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1, // Reset to page 1 on filter changes
    }));
  };

  return { data, isLoading, error, filters, updateFilter };
}