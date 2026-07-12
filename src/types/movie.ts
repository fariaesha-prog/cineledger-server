export interface Movie {
  _id: string;
  title: string;
  posterUrl: string;
  releaseYear: number;
  rating: number;
  genres: string[];
  overview: string;
}

export interface MovieFilters {
  search: string;
  genre: string;
  rating: string;
  sortBy: string;
  page: number;
  limit: number;
}

export interface MoviesResponse {
  movies: Movie[];
  totalMovies: number;
  totalPages: number;
  currentPage: number;
}