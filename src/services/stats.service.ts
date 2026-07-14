import { Review } from '@models/Review.model';
import { User } from '@models/User.model';

const GENRE_META: Record<string, { title: string; description: string }> = {
  Drama: { title: 'The Auteur', description: 'You gravitate toward director-driven cinema with bold visual language.' },
  Thriller: { title: 'The Auteur', description: 'You gravitate toward director-driven cinema with bold visual language.' },
  'Sci-Fi': { title: 'The Visionary', description: 'You chase big ideas and ambitious world-building on screen.' },
  Comedy: { title: 'The Populist', description: 'You love films that bring people together and lift the room.' },
  Horror: { title: 'The Thrill Seeker', description: 'You crave tension, dread, and the rush of being scared.' },
  Animation: { title: 'The Dreamer', description: 'You find wonder in imaginative, hand-crafted worlds.' },
};
const DEFAULT_PERSONALITY = { title: 'The Explorer', description: 'Your taste spans genres — you watch widely and judge each film on its own terms.' };

export async function getUserStats(userId: string) {
  const [reviews, user, platformAgg] = await Promise.all([
    Review.find({ userId }).sort({ createdAt: 1 }),
    User.findById(userId),
    Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
  ]);

  const filmsLogged = reviews.length;
  const avgRating = filmsLogged ? reviews.reduce((s, r) => s + r.rating, 0) / filmsLogged : 0;
  const platformMean = platformAgg[0]?.avg ?? 0;

  const genreCounts: Record<string, number> = {};
  const directorCounts: Record<string, number> = {};
  const monthBuckets: Record<string, { count: number; ratingSum: number }> = {};

  for (const r of reviews) {
    for (const g of r.movieGenres ?? []) genreCounts[g] = (genreCounts[g] ?? 0) + 1;
    if (r.movieDirector && r.movieDirector !== 'Unknown') {
      directorCounts[r.movieDirector] = (directorCounts[r.movieDirector] ?? 0) + 1;
    }
    const key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (!monthBuckets[key]) monthBuckets[key] = { count: 0, ratingSum: 0 };
    monthBuckets[key].count += 1;
    monthBuckets[key].ratingSum += r.rating;
  }

  const genreBreakdown = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

  const monthLabel = (key: string) => {
    const [y, m] = key.split('-');
    return new Date(Number(y), Number(m) - 1, 1).toLocaleString('en-US', { month: 'short' });
  };

  const sortedMonths = Object.keys(monthBuckets).sort();
  const filmsPerMonth = sortedMonths.map((k) => ({ month: monthLabel(k), count: monthBuckets[k].count }));
  const ratingTrend = sortedMonths.map((k) => ({
    month: monthLabel(k),
    rating: Number((monthBuckets[k].ratingSum / monthBuckets[k].count).toFixed(1)),
  }));

  const topGenre = genreBreakdown[0]?.name;
  const topDirectors = Object.entries(directorCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n);
  const base = (topGenre && GENRE_META[topGenre]) || DEFAULT_PERSONALITY;
  const diff = avgRating && platformMean ? (avgRating - platformMean).toFixed(1) : '0.0';
  const description = topDirectors.length
    ? `${base.description} Your average sits ${diff.startsWith('-') ? diff : `+${diff}`} vs the platform mean. Favorite directors: ${topDirectors.join(', ')}.`
    : `${base.description} Keep reviewing to unlock director insights.`;

  return {
    filmsLogged,
    avgRating: Number(avgRating.toFixed(1)),
    watchlistCount: user?.watchlist.length ?? 0,
    favoritesCount: user?.favorites.length ?? 0,
    genreBreakdown,
    filmsPerMonth,
    ratingTrend,
    personality: { title: base.title, description },
  };
}