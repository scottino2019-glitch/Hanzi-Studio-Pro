import React from 'react';
import { BookOpen, Plus, FolderHeart } from 'lucide-react';

interface HeaderProps {
  onOpenLibrary: () => void;
  onNewCard: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLibrary,
  onNewCard,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark in display font */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-editorial font-bold tracking-tight text-stone-900">
            HanziCard Studio
          </span>
          <span className="text-xs font-calligraphy text-amber-900 font-bold opacity-80 pl-1 select-none">
            汉字研习
          </span>
        </div>

        {/* Zone 2: Clean navigation / view switch links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-stone-600">
          <button
            onClick={onOpenLibrary}
            className="hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-800" />
            <span>Biblioteca Classici ({savedCount})</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenLibrary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
          >
            <FolderHeart className="w-3.5 h-3.5 text-stone-500" />
            <span>Le mie schede</span>
          </button>

          <button
            onClick={onNewCard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-800 rounded-lg hover:bg-amber-900 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crea Scheda</span>
          </button>
        </div>
      </div>
    </header>
  );
};
