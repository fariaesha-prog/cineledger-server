import { env } from '@config/env';
import { AppError } from '@utils/AppError';
import { GENRE_SLUG_TO_TMDB_ID, TMDB_ID_TO_GENRE_NAME } from '@config/tmdbGenres';

interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface TmdbResponse {
  results: TmdbMovie[];
  total_results: number;
  total_pages: number;
  page: number;
}

export interface MovieQuery {
  search: string;
  genre: string;
  year: string;
  rating: string;
  sortBy: string;
  page: number;
}

const SORT_MAP: Record<string, string> = {
  popularity: 'popularity.desc',
  rating: 'vote_average.desc',
  newest: 'primary_release_date.desc',
  oldest: 'primary_release_date.asc',
  title: 'original_title.asc',
};

function mapTmdbMovie(movie: TmdbMovie) {
  return {
    _id: `tmdb-${movie.id}`,
    tmdbId: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    releaseDate: movie.release_date,
    voteAverage: movie.vote_average,
    genres: movie.genre_ids.map((id) => TMDB_ID_TO_GENRE_NAME[id]).filter(Boolean),
  };
}

export async function fetchMovies(filters: MovieQuery) {
  const isSearching = filters.search.trim().length > 0;
  const url = new URL(`${env.TMDB_BASE_URL}/${isSearching ? 'search/movie' : 'discover/movie'}`);

  url.searchParams.set('api_key', env.TMDB_API_KEY);
  url.searchParams.set('page', String(filters.page));

  if (isSearching) {
    url.searchParams.set('query', filters.search.trim());
  } else {
    url.searchParams.set('sort_by', SORT_MAP[filters.sortBy] ?? SORT_MAP.popularity);
    if (filters.genre && GENRE_SLUG_TO_TMDB_ID[filters.genre]) {
      url.searchParams.set('with_genres', String(GENRE_SLUG_TO_TMDB_ID[filters.genre]));
    }
    if (filters.year) {
      url.searchParams.set('primary_release_year', filters.year);
    }
    if (filters.rating) {
      url.searchParams.set('vote_average.gte', filters.rating);
    }
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new AppError('Failed to fetch movies from TMDB', 502);
  }

  const data = (await response.json()) as TmdbResponse;

  // TMDB's search endpoint doesn't support rating filtering server-side,
  // so it's applied here as a page-local filter. Note: this means
  // totalMovies/totalPages reflect TMDB's count, not the post-filtered
  // count, which is an acceptable simplification for a portfolio project.
  let movies = data.results.map(mapTmdbMovie);
  if (isSearching && filters.rating) {
    const minRating = parseFloat(filters.rating);
    movies = movies.filter((m) => m.voteAverage >= minRating);
  }

  return {
    movies,
    totalMovies: data.total_results,
    currentPage: data.page,
    totalPages: Math.min(data.total_pages, 500), // TMDB caps at 500 pages
  };
}

export async function fetchTrendingMovies(limit = 4) {
  const url = new URL(`${env.TMDB_BASE_URL}/trending/movie/week`);
  url.searchParams.set('api_key', env.TMDB_API_KEY);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new AppError('Failed to fetch trending movies from TMDB', 502);
  }

  const data = (await response.json()) as TmdbResponse;
  return data.results.slice(0, limit).map(mapTmdbMovie);
}
interface TmdbMovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  vote_average: number;
  original_language: string;
  genres: { id: number; name: string }[];
  spoken_languages: { english_name: string }[];
}

interface TmdbCredits {
  cast: { id: number; name: string; character: string; profile_path: string | null }[];
  crew: { id: number; name: string; job: string }[];
}

interface TmdbVideos {
  results: { key: string; site: string; type: string }[];
}

export async function fetchMovieDetails(tmdbId: number) {
  const base = env.TMDB_BASE_URL;
  const key = env.TMDB_API_KEY;

  const [movieRes, creditsRes, videosRes] = await Promise.all([
    fetch(`${base}/movie/${tmdbId}?api_key=${key}`),
    fetch(`${base}/movie/${tmdbId}/credits?api_key=${key}`),
    fetch(`${base}/movie/${tmdbId}/videos?api_key=${key}`),
  ]);

  if (!movieRes.ok) {
    throw new AppError('Movie not found', 404);
  }

  const movie = (await movieRes.json()) as TmdbMovieDetails;
  const credits = (await creditsRes.json()) as TmdbCredits;
  const videos = (await videosRes.json()) as TmdbVideos;

  const director = credits.crew.find((p) => p.job === 'Director')?.name ?? 'Unknown';
  const cast = credits.cast.slice(0, 6);
  const trailer = videos.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube');

  return { movie, director, cast, trailerKey: trailer?.key };
}
export async function fetchSimilarMovies(tmdbId: number, limit = 4) {
  const url = new URL(`${env.TMDB_BASE_URL}/movie/${tmdbId}/similar`);
  url.searchParams.set('api_key', env.TMDB_API_KEY);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new AppError('Failed to fetch similar movies from TMDB', 502);
  }

  const data = (await response.json()) as TmdbResponse;
  return data.results.slice(0, limit).map(mapTmdbMovie);
}