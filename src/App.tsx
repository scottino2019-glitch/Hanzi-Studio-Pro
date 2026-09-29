import { useState, useRef, useEffect } from 'react';
import { ChineseThematicCard, CardTheme } from './types';
import { PRESET_CARDS } from './data/presetCards';
import { CardView } from './components/CardView';
import { CardEditor } from './components/CardEditor';
import { Header } from './components/Header';
import { CardLibraryModal } from './components/CardLibraryModal';
import { exportCardAsPng, exportCardAsJpeg, copyCardToClipboard } from './utils/exportUtils';
import {
  Download,
  Copy,
  Printer,
  Check,
  Palette,
  Eye,
  Edit3,
} from 'lucide-react';

const STORAGE_KEY = 'hanzicard_studio_cards_v1';
const ACTIVE_CARD_KEY = 'hanzicard_studio_active_id_v1';

export default function App() {
  const [cards, setCards] = useState<ChineseThematicCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Errore lettura storage:', e);
    }
    return PRESET_CARDS;
  });

  const [activeCardId, setActiveCardId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_CARD_KEY);
      if (savedId) return savedId;
    } catch (e) {}
    return PRESET_CARDS[0].id;
  });

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  const cardRef = useRef<HTMLDivElement | null>(null);

  // Sync cards to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (e) {
      console.warn('Errore salvataggio storage:', e);
    }
  }, [cards]);

  // Sync activeCardId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_CARD_KEY, activeCardId);
    } catch (e) {}
  }, [activeCardId]);

  // Active card selector
  const activeCard = cards.find((c) => c.id === activeCardId) || cards[0] || PRESET_CARDS[0];

  // Card update handler
  const handleUpdateActiveCard = (updated: ChineseThematicCard) => {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Create new blank card
  const handleCreateNewCard = () => {
    const newCard: ChineseThematicCard = {
      id: `card-${Date.now()}`,
      title: 'Nuova Scheda Hanzi',
      category: 'Proverbio & Filosofia',
      phrase: '知足常乐',
      phraseTraditional: '知足常樂',
      pinyin: 'Zhī zú cháng lè',
      italianTranslation: 'Chi sa accontentarsi è sempre felice.',
      literalTranslation: 'Sapere (知) di avere abbastanza (足), sempre (常) gioia (乐).',
      philosophicalMeaning: 'Concetto fondamentale del pensiero taoista e confuciano sulla moderazione dei desideri e la serenità interiore.',
      culturalContext: 'Espressione classica usata per ricordare il valore della gratitudine per ciò che si ha nel momento presente.',
      grammarPoints: [
        {
          id: `gp-${Date.now()}-1`,
          topic: 'Predicato 知足 (zhīzú)',
          explanation: 'Composto verbo-oggetto grammaticalizzato: 知 (sapere/riconoscere) + 足 (sufficiente/abbondante) = "essere pago / accontentarsi".',
        },
        {
          id: `gp-${Date.now()}-2`,
          topic: 'Avverbio di frequenza 常 (cháng)',
          explanation: 'Funziona come modificatore temporale del predicato nominale/aggettivale 乐 (lè, gioia).',
        },
      ],
      characters: [
        {
          id: `c-${Date.now()}-1`,
          char: '知',
          pinyin: 'zhī',
          tone: 1,
          radical: '矢 (freccia)',
          strokes: 8,
          hskLevel: 'HSK 2',
          literalMeaning: 'Sapere, conoscere, riconoscere',
          etymology: 'Freccia diretta e bocca: comprensione rapida e chiara.',
          roleInPhrase: 'Verbo reggente',
        },
        {
          id: `c-${Date.now()}-2`,
          char: '足',
          pinyin: 'zú',
          tone: 2,
          radical: '足 (piede)',
          strokes: 7,
          hskLevel: 'HSK 3',
          literalMeaning: 'Piede; sufficiente, bastante',
          etymology: 'Disegno di gamba e piede fermo a terra; completezza.',
          roleInPhrase: 'Oggetto / attributo di sufficienza',
        },
        {
          id: `c-${Date.now()}-3`,
          char: '常',
          pinyin: 'cháng',
          tone: 2,
          radical: '巾 (telo)',
          strokes: 11,
          hskLevel: 'HSK 2',
          literalMeaning: 'Costante, frequente, sempre',
          etymology: 'Stendardo tenuto fermo: regolarità ininterrotta.',
          roleInPhrase: 'Avverbio di tempo',
        },
        {
          id: `c-${Date.now()}-4`,
          char: '乐',
          pinyin: 'lè',
          tone: 4,
          radical: '丿 (tratto)',
          strokes: 5,
          hskLevel: 'HSK 2',
          literalMeaning: 'Gioia, felicità, allegria; musica (pron. yuè)',
          etymology: 'Campane e tamburi su supporti di legno per le feste liete.',
          roleInPhrase: 'Predicato di gioia',
        },
      ],
      visual: {
        type: 'emoji',
        emoji: '🍵',
        caption: 'Una tazza di tè caldo in silenzio',
      },
      style: {
        theme: 'xuan',
        layout: 'poster',
        fontFamily: 'calligraphy',
        showRadicals: true,
        showEtymology: true,
        showGrammar: true,
        showPhilosophy: true,
        showTianzige: true,
        sealName: 'Serenità',
      },
      tags: ['Saggezza', 'Proverbio'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setCards((prev) => [newCard, ...prev]);
    setActiveCardId(newCard.id);
    setIsLibraryOpen(false);
    showNotice('Nuova scheda creata!');
  };

  // Duplicate active card
  const handleDuplicateCard = (targetCard: ChineseThematicCard) => {
    const duplicated: ChineseThematicCard = {
      ...targetCard,
      id: `card-${Date.now()}`,
      title: `${targetCard.title} (Copia)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCards((prev) => [duplicated, ...prev]);
    setActiveCardId(duplicated.id);
    showNotice('Scheda duplicata!');
  };

  // Delete card
  const handleDeleteCard = (cardId: string) => {
    const remaining = cards.filter((c) => c.id !== cardId);
    if (remaining.length === 0) {
      setCards(PRESET_CARDS);
      setActiveCardId(PRESET_CARDS[0].id);
    } else {
      setCards(remaining);
      if (activeCardId === cardId) {
        setActiveCardId(remaining[0].id);
      }
    }
    showNotice('Scheda eliminata');
  };

  // Import cards
  const handleImportCards = (imported: ChineseThematicCard[]) => {
    setCards(imported);
    if (imported.length > 0) {
      setActiveCardId(imported[0].id);
    }
  };

  // Quick theme switcher helper
  const handleSetTheme = (theme: CardTheme) => {
    handleUpdateActiveCard({
      ...activeCard,
      style: {
        ...activeCard.style,
        theme,
      },
    });
  };

  const showNotice = (msg: string) => {
    setExportMessage(msg);
    setTimeout(() => {
      setExportMessage(null);
    }, 2800);
  };

  // Export handlers
  const handleExportPng = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      await exportCardAsPng(cardRef.current, {
        fileName: `${activeCard.phrase}_${activeCard.title}`,
        pixelRatio: 2, // High resolution for print & sharing
      });
      showNotice('Scheda scaricata in formato PNG (alta risoluzione)!');
    } catch (err) {
      console.error('Errore export PNG:', err);
      showNotice('Errore durante l\'esportazione PNG');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJpeg = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      await exportCardAsJpeg(cardRef.current, {
        fileName: `${activeCard.phrase}_${activeCard.title}`,
        pixelRatio: 2,
        quality: 0.95,
      });
      showNotice('Scheda scaricata in formato JPEG!');
    } catch (err) {
      console.error('Errore export JPEG:', err);
      showNotice('Errore durante l\'esportazione JPEG');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      const ok = await copyCardToClipboard(cardRef.current, { pixelRatio: 2 });
      if (ok) {
        showNotice('Immagine copiata negli appunti! Pronta da incollare.');
      } else {
        showNotice('Funzione appunti non supportata dal browser, usa il download.');
      }
    } catch (err) {
      showNotice('Impossibile copiare negli appunti');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex flex-col font-sans">
      {/* Top Bar navigation */}
      <Header
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onNewCard={handleCreateNewCard}
        savedCount={cards.length}
      />

      {/* Hero / Context Sub-Banner */}
      <div className="bg-[#FAF8F4] border-b border-stone-200/80 px-4 sm:px-6 py-3.5 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-stone-600">
            <span className="font-semibold text-stone-900">Studio Schede Didattiche:</span>
            <span>Componi frasi, analizza ogni singolo ideogramma, la sintassi e la filosofia cinese classica.</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-500 hidden sm:inline">100% Locale · Senza Server · Esportabile</span>
          </div>
        </div>
      </div>

      {/* Main Dual Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Mobile View Switcher */}
        <div className="lg:hidden flex items-center justify-center p-1 bg-stone-200/70 rounded-xl max-w-xs mx-auto w-full print:hidden">
          <button
            onClick={() => setMobileView('editor')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              mobileView === 'editor' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor Dati</span>
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              mobileView === 'preview' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Anteprima & Esporta</span>
          </button>
        </div>

        {/* Dual Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Editor (Cols 5/12) */}
          <section
            className={`lg:col-span-5 print:hidden ${
              mobileView === 'editor' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="sticky top-20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Pannello di Modifica
                </span>
                <span className="text-xs text-stone-400">
                  Modifiche in tempo reale
                </span>
              </div>

              <CardEditor card={activeCard} onChange={handleUpdateActiveCard} />
            </div>
          </section>

          {/* Right Column: Live WYSIWYG Preview & Export Controls (Cols 7/12) */}
          <section
            className={`lg:col-span-7 flex flex-col gap-4 ${
              mobileView === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Top Toolbar for the Preview */}
            <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-2xs flex items-center justify-between flex-wrap gap-3 print:hidden">
              {/* Theme Quick Switcher */}
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-stone-400" />
                <span className="text-xs font-semibold text-stone-700 hidden sm:inline">Tema:</span>
                <div className="flex items-center gap-1">
                  {[
                    { id: 'xuan' as CardTheme, title: 'Carta di Riso', color: 'bg-[#F9F6F0] border-[#D9CCB8]' },
                    { id: 'ink' as CardTheme, title: 'Inchiostro Notte', color: 'bg-[#18191D] border-[#373A44]' },
                    { id: 'jade' as CardTheme, title: 'Giada Imperiale', color: 'bg-[#F2F6F3] border-[#CCD9CF]' },
                    { id: 'vermilion' as CardTheme, title: 'Rosso Cinabro', color: 'bg-[#B93826] border-[#B93826]' },
                    { id: 'minimal' as CardTheme, title: 'Minimal Studio', color: 'bg-[#FFFFFF] border-[#E5E7EB]' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSetTheme(t.id)}
                      title={t.title}
                      className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer ${t.color} ${
                        activeCard.style.theme === t.id ? 'ring-2 ring-amber-800 scale-110' : 'opacity-80'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons: Export PNG, JPEG, Copy, Print */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleExportPng}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
                  title="Scarica immagine PNG nitida a 300 DPI"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG</span>
                </button>

                <button
                  onClick={handleExportJpeg}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-300 rounded-lg hover:bg-stone-200 disabled:opacity-50 transition-colors cursor-pointer"
                  title="Scarica file JPEG leggero"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JPEG</span>
                </button>

                <button
                  onClick={handleCopyImage}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-stone-50 text-stone-700 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                  title="Copia negli appunti"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copia</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="p-1.5 text-stone-500 hover:text-stone-900 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                  title="Stampa scheda o salva in PDF"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification Toast */}
            {exportMessage && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-xs font-medium rounded-lg shadow-lg border border-stone-800 animate-in fade-in slide-in-from-top-2 duration-150">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{exportMessage}</span>
              </div>
            )}

            {/* Card Render Container */}
            <div className="overflow-x-auto p-1 sm:p-2 flex justify-center">
              <div
                style={{
                  transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : 'none',
                  transformOrigin: 'top center',
                  width: '100%',
                }}
              >
                <CardView card={activeCard} cardRef={cardRef} isExporting={isExporting} />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Library Drawer/Modal */}
      <CardLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        cards={cards}
        activeCardId={activeCardId}
        onSelectCard={(c) => setActiveCardId(c.id)}
        onCreateNewCard={handleCreateNewCard}
        onDuplicateCard={handleDuplicateCard}
        onDeleteCard={handleDeleteCard}
        onImportCards={handleImportCards}
      />
    </div>
  );
}
