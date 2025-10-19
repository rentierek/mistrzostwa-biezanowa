import React from 'react';
import { getActiveTournament, getUpcomingMatches, getLeagueTable } from '@/lib/supabase';
import { LeagueTable } from '@/components/tournament/LeagueTable';
import { MatchesList } from '@/components/tournament/MatchesList';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Trophy, Calendar, Users, Target } from 'lucide-react';
import { MatchWithDetails, LeagueTableEntry } from '@/types/database';

export default async function HomePage() {
  // Fetch data for the homepage
  const activeTournament = await getActiveTournament();
  
  let upcomingMatches: MatchWithDetails[] = [];
  let leagueTable: LeagueTableEntry[] = [];
  
  if (activeTournament) {
    upcomingMatches = await getUpcomingMatches(activeTournament.id, 5);
    leagueTable = await getLeagueTable(activeTournament.id);
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Mistrzostwa Bieżanowa EA FC 25
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          Oficjalne Turnieje EA FC
        </p>
        {activeTournament && (
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {activeTournament.thumbnail_url ? (
              <img 
                src={activeTournament.thumbnail_url} 
                alt={`${activeTournament.name} thumbnail`}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <Trophy size={16} />
            )}
            {activeTournament.name}
          </div>
        )}
      </div>

      {activeTournament ? (
        <>
          {/* Main Two-Column Layout (SofaScore inspired) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Upcoming Matches */}
            <div>
              <MatchesList 
                matches={upcomingMatches}
                title="Nadchodzące Mecze"
                maxItems={5}
                showExport={false}
              />
            </div>

            {/* Right Column - League Table */}
            <div>
              <LeagueTable 
                data={leagueTable.slice(0, 10)}
                title="Tabela Ligi"
                showExport={false}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card padding="sm">
              <CardContent className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{leagueTable.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Graczy</div>
                </div>
              </CardContent>
            </Card>

            <Card padding="sm">
              <CardContent className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingMatches.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Nadchodzące Mecze</div>
                </div>
              </CardContent>
            </Card>

            <Card padding="sm">
              <CardContent className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {leagueTable.length > 0 ? leagueTable[0].nickname : '-'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Lider</div>
                </div>
              </CardContent>
            </Card>

            <Card padding="sm">
              <CardContent className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {leagueTable.reduce((total, player) => total + player.goals_for, 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Bramek Ogółem</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gallery Section Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Galeria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((item) => (
                  <div 
                    key={item}
                    className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center"
                  >
                    <div className="text-gray-500 text-center">
                      <Trophy className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Zdjęcie {item}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Galeria zostanie wkrótce uzupełniona o zdjęcia i filmy z turniejów
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* No Active Tournament */
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Brak Aktywnego Turnieju
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Obecnie nie ma żadnego aktywnego turnieju. Sprawdź archiwum poprzednich turniejów lub skontaktuj się z organizatorami.
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href="/archives" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all"
              >
                <Trophy size={16} />
                Zobacz Archiwum
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
