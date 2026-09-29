import React, { useState } from 'react';
import { ChineseThematicCard } from '../types';
import { PRESET_CARDS } from '../data/presetCards';
import { Search, Plus, Trash2, Copy, Download, Upload, BookMarked, X } from 'lucide-react';

interface CardLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: ChineseThematicCard[];
  activeCardId: string;
  onSelectCard: (card: ChineseThematicCard) => void;
  onCreateNewCard: () => void;
  onDuplicateCard: (card: ChineseThematicCard) => void;
  onDeleteCard: (cardId: string) => void;
  onImportCards: (cards: ChineseThematicCard[]) => void;
}

export const CardLibraryModal: React.FC<CardLibraryModalProps> = ({
  isOpen,
  onClose,
  cards,
  activeCardId,
  onSelectCard,
  onCreateNewCard,
  onDuplicateCard,
  onDeleteCard,
  onImportCards,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'presets' | 'custom'>('all');

  if (!isOpen) return null;

  const filteredCards = cards.filter((c) => {
    const isPreset = PRESET_CARDS.some((p) => p.id === c.id);
    if (selectedFilter === 'presets' && !isPreset) return false;
    if (selectedFilter === 'custom' && isPreset) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.title.toLowerCase().includes(term) ||
      c.phrase.includes(term) ||
      c.pinyin.toLowerCase().includes(term) ||
      c.category.toLowerCase().includes(term) ||
      c.italianTranslation.toLowerCase().includes(term)
    );
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cards, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hanzicard_studio_archivio_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportCards(parsed);
          alert(`Importate con successo ${parsed.length} schede!`);
        }
      } catch (err) {
        alert('File JSON non valido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <BookMarked className="w-5 h-5 text-amber-800" />
            <div>
              <h2 className="text-base font-bold text-stone-900">Archivio Schede Tematiche</h2>
              <p className="text-xs text-stone-500">Gestisci, cerca o crea schede di studio ({cards.length} schede salvate)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Filters, New Card & JSON */}
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca frase, ideogramma o titolo..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-100 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-amber-800/30"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            {/* Filter buttons */}
            <div className="flex items-center p-1 bg-stone-100 rounded-lg text-xs">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                }`}
              >
                Tutte
              </button>
              <button
                onClick={() => setSelectedFilter('presets')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedFilter === 'presets' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                }`}
              >
                Classici ({PRESET_CARDS.length})
              </button>
              <button
                onClick={() => setSelectedFilter('custom')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedFilter === 'custom' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                }`}
              >
                Mie Schede
              </button>
            </div>

            {/* Actions */}
            <button
              onClick={onCreateNewCard}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuova Scheda</span>
            </button>
          </div>
        </div>

        {/* Card Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredCards.map((c) => {
            const isActive = c.id === activeCardId;
            return (
              <div
                key={c.id}
                onClick={() => {
                  onSelectCard(c);
                  onClose();
                }}
                className={`group relative rounded-xl p-4 border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-amber-800 bg-amber-50/40 ring-2 ring-amber-800 shadow-sm'
                    : 'border-stone-200 bg-stone-50/50 hover:bg-white hover:border-stone-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-sans font-semibold tracking-wider text-amber-800 uppercase truncate">
                      {c.category}
                    </span>
                    {isActive && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-800 text-white px-1.5 py-0.5 rounded">
                        Attiva
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 leading-snug line-clamp-1 mb-1">
                    {c.title}
                  </h3>

                  <div className="my-2 py-2 border-y border-stone-200/60 flex items-center justify-between">
                    <span className="text-2xl font-chinese font-bold tracking-wider text-stone-900">
                      {c.phrase}
                    </span>
                    <span className="text-xl">
                      {c.visual.type === 'emoji' && c.visual.emoji ? c.visual.emoji : '📜'}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-stone-500 font-sans tracking-wide">
                    {c.pinyin}
                  </p>
                  <p className="text-xs text-stone-600 line-clamp-2 mt-1 italic">
                    «{c.italianTranslation}»
                  </p>
                </div>

                {/* Card hover / action bar */}
                <div className="mt-4 pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-400">
                  <span>{c.characters.length} ideogrammi</span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onDuplicateCard(c)}
                      className="p-1 hover:text-stone-800 hover:bg-stone-200 rounded"
                      title="Duplica scheda"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {cards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Eliminare la scheda "${c.title}"?`)) {
                            onDeleteCard(c.id);
                          }
                        }}
                        className="p-1 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Elimina scheda"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Backup Tools */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Esporta Backup JSON</span>
            </button>
            <label className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-medium cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Importa JSON</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
          <span>Tutti i dati sono salvati nel browser locale (senza server)</span>
        </div>
      </div>
    </div>
  );
};
