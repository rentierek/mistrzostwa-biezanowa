'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Trophy, 
  Archive, 
  Users, 
  BarChart3, 
  Shuffle, 
  Menu, 
  X,
  Lock,
  LogOut,
  Shield,
  DollarSign
} from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { AdminLoginModal } from './AdminLoginModal';
import { ThemeToggleCompact } from './ThemeToggle';

export const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAdmin, logout } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();

  // Keyboard shortcut for admin login (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        if (!isAdmin) {
          router.push('/admin-login');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin, router]);

  const navItems = [
    { href: '/', label: 'Strona Główna', icon: Home },
    { href: '/tournament', label: 'Aktualny Turniej', icon: Trophy },
    { href: '/archives', label: 'Archiwum', icon: Archive },
    { href: '/players', label: 'Gracze', icon: Users },
    { href: '/stats', label: 'Statystyki', icon: BarChart3 },
    { href: '/betting', label: 'Betowanie', icon: DollarSign },
    { href: '/draw', label: 'Losowanie Drużyn', icon: Shuffle },
    ...(isAdmin ? [{ href: '/admin', label: 'Panel Admin', icon: Shield }] : []),
  ];

  const handleAdminAction = () => {
    if (isAdmin) {
      logout();
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-lg fixed top-0 left-0 right-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Trophy className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Mistrzostwa Bieżanowa
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Theme Toggle */}
              <ThemeToggleCompact />
              
              {/* Admin Button - Only show logout when already admin */}
              {isAdmin && (
                <button
                  onClick={handleAdminAction}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
                >
                  <LogOut size={16} />
                  <span>Wyloguj</span>
                </button>
              )}
              
              {/* Admin Indicator */}
              {isAdmin && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                  <Shield size={12} />
                  <span>Administrator</span>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Theme Toggle Mobile */}
              <ThemeToggleCompact />
              
              {/* Admin Button Mobile - Only show logout when already admin */}
              {isAdmin && (
                <button
                  onClick={handleAdminAction}
                  className="p-2 rounded-lg transition-colors bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
                >
                  <LogOut size={18} />
                </button>
              )}
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                
                {/* Admin Status Mobile */}
                {isAdmin && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <Shield size={18} className="text-green-600 dark:text-green-400" />
                    <span className="text-green-700 dark:text-green-300 font-medium">Tryb Administratora</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Admin Login Modal */}
      <AdminLoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
};