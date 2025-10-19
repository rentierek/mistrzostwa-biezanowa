'use client';

import React from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { AdminTournamentPanel } from '@/components/admin/AdminTournamentPanel';
import { AdminPlayerPanel } from '@/components/admin/AdminPlayerPanel';
import { AdminTeamPanel } from '@/components/admin/AdminTeamPanel';
import { AdminMatchPanel } from '@/components/admin/AdminMatchPanel';
import { AdminAchievementPanel } from '@/components/admin/AdminAchievementPanel';

export default function AdminPage() {
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dostęp Ograniczony</h1>
            <p className="text-gray-600 mb-6">
              Ta strona jest dostępna tylko dla administratorów. 
              Zaloguj się jako administrator, aby uzyskać dostęp do panelu zarządzania.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertTriangle size={16} />
              <span>Skontaktuj się z administratorem systemu, jeśli potrzebujesz dostępu.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel Administratora</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Zarządzaj turniejami, meczami i graczami w systemie Mistrzostwa Bieżanowa.
          </p>
        </div>

        {/* Admin Sections */}
        <div className="space-y-8">
          {/* Tournament Management */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <AdminTournamentPanel />
          </section>
          
          {/* Player Management */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <AdminPlayerPanel />
          </section>
          
          {/* Team Management */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <AdminTeamPanel />
          </section>
          
          {/* Match Management */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <AdminMatchPanel />
          </section>
          
          {/* Achievement Management */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <AdminAchievementPanel />
          </section>

          {/* Future Admin Features */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Przyszłe funkcje administracyjne</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Statystyki zaawansowane</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Szczegółowe raporty i analizy</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Eksport danych</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Eksport do różnych formatów</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}