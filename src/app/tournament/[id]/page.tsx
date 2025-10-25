import { notFound } from 'next/navigation';
import { getTournamentById, getLeagueTable, getMatchesForTournament } from '@/lib/supabase';
import TournamentPageClient from '@/components/tournament/TournamentPageClient';

interface TournamentPageProps {
  params: Promise<{ id: string }>;
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { id } = await params;
  const tournament = await getTournamentById(id);

  if (!tournament) {
    notFound();
  }

  // Fetch tournament data
  const [leagueTable, matches] = await Promise.all([
    getLeagueTable(id),
    getMatchesForTournament(id)
  ]);

  return (
    <TournamentPageClient
      tournament={tournament}
      leagueTable={leagueTable}
      matches={matches}
    />
  );
}