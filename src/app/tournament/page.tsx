import React from 'react';
import { getActiveTournament, getMatchesForTournament, getLeagueTable } from '@/lib/supabase';
import { TournamentStats } from '@/components/tournament/TournamentStats';
import { Trophy } from 'lucide-react';
import Link from 'next/link';

export default async function TournamentPage() {
  const activeTournament = await getActiveTournament();

  if (!activeTournament) {
    return (
      <div className="text-center py-16">
        <Trophy className="w-24 h-24 text-gray-400 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Brak Aktywnego Turnieju
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Obecnie nie ma żadnego aktywnego turnieju. Sprawdź archiwum lub wróć później.
        </p>
        <Link 
          href="/archives"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all"
        >
          <Trophy size={20} />
          Zobacz Archiwum
        </Link>
      </div>
    );
  }

  const [matches, leagueTable] = await Promise.all([
    getMatchesForTournament(activeTournament.id),
    getLeagueTable(activeTournament.id)
  ]);

  return (
    <TournamentStats 
      tournament={activeTournament}
      initialMatches={matches}
      initialLeagueTable={leagueTable}
    />
  );
}