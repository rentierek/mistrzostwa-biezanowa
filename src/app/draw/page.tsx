import React from 'react';
import { TeamDrawTool } from '@/components/tournament/TeamDrawTool';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Shuffle, Users, Trophy, Info } from 'lucide-react';

export default function DrawPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Losowanie Drużyn
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Narzędzie do losowego przydzielania drużyn graczom
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-400 rounded-full text-sm font-medium">
          <Shuffle size={16} />
          Organizacja Turnieju
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Instrukcje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Dodaj Graczy</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Wprowadź listę graczy, którzy będą uczestniczyć w turnieju
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Dodaj Drużyny</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Wprowadź nazwy drużyn, które będą dostępne do losowania
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shuffle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Wylosuj</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Kliknij przycisk losowania, aby przydzielić drużyny graczom
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Draw Tool */}
      <TeamDrawTool />

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-green-600" />
            Wskazówki
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Równa liczba:</strong> Upewnij się, że liczba graczy jest równa liczbie drużyn dla najlepszego rezultatu.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Eksport:</strong> Po losowaniu możesz wyeksportować wyniki do pliku Excel.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Kopiowanie:</strong> Użyj przycisku kopiowania, aby szybko udostępnić wyniki.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Ponowne losowanie:</strong> Możesz losować wielokrotnie, aż otrzymasz satysfakcjonujący rezultat.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}