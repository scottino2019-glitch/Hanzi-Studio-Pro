import React, { useState } from 'react';
import {
  ChineseThematicCard,
  HanziAnalysis,
  GrammarPoint,
  CardTheme,
  VisualType,
} from '../types';
import { lookupHanzi, segmentChinesePhrase } from '../data/chineseDictionary';
import { getPhrasePinyin } from '../utils/pinyinUtils';
import {
  Sparkles,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  BookOpen,
  Languages,
  PenTool,
  Image as ImageIcon,
  Check,
  Upload,
  AlertCircle,
} from 'lucide-react';

interface CardEditorProps {
  card: ChineseThematicCard;
  onChange: (updated: ChineseThematicCard) => void;
}

export const CardEditor: React.FC<CardEditorProps> = ({ card, onChange }) => {
  const [activeTab, setActiveTab] = useState<'phrase' | 'characters' | 'grammar' | 'visual'>('phrase');
  const [copiedPinyinHelper, setCopiedPinyinHelper] = useState<string | null>(null);
  const [analysisNotice, setAnalysisNotice] = useState<{ type: 'success' | 'warn'; text: string } | null>(null);

  // Helper to update root properties
  const updateField = <K extends keyof ChineseThematicCard>(field: K, value: ChineseThematicCard[K]) => {
    onChange({
      ...card,
      [field]: value,
      updatedAt: Date.now(),
    });
  };

  // Helper to update style properties
  const updateStyle = (key: keyof ChineseThematicCard['style'], value: any) => {
    onChange({
      ...card,
      style: {
        ...card.style,
        [key]: value,
      },
      updatedAt: Date.now(),
    });
  };

  // Helper to update visual properties
  const updateVisual = (key: keyof ChineseThematicCard['visual'], value: any) => {
    onChange({
      ...card,
      visual: {
        ...card.visual,
        [key]: value,
      },
      updatedAt: Date.now(),
    });
  };

  // Automatically parse phrase into character breakdowns using client-side dictionary & pinyin engine
  const handleAutoSegmentPhrase = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    const chars = segmentChinesePhrase(card.phrase);
    if (chars.length === 0) {
      setAnalysisNotice({
        type: 'warn',
        text: 'Nessun ideogramma cinese rilevato nella frase. Inserisci prima dei caratteri cinesi (es. 塞翁失马).',
      });
      setTimeout(() => setAnalysisNotice(null), 4000);
      return;
    }

    // Parse every character fresh using dictionary or pinyin-pro engine
    const newCharacters: HanziAnalysis[] = chars.map((char) => lookupHanzi(char));

    // Calculate full phrase pinyin with proper tones
    const generatedPinyin = getPhrasePinyin(card.phrase);
    const updatedPinyin = generatedPinyin
      ? (generatedPinyin.charAt(0).toUpperCase() + generatedPinyin.slice(1))
      : newCharacters.map((c) => c.pinyin).filter(Boolean).join(' ');

    onChange({
      ...card,
      pinyin: updatedPinyin,
      characters: newCharacters,
      updatedAt: Date.now(),
    });

    // Provide immediate visual feedback & jump to characters tab so user sees the results!
    setAnalysisNotice({
      type: 'success',
      text: `✓ Analizzati con successo ${chars.length} ideogrammi con Pinyin, toni e radicali!`,
    });
    setActiveTab('characters');
    setTimeout(() => setAnalysisNotice(null), 3500);
  };

  // Character operations
  const updateCharacter = (index: number, key: keyof HanziAnalysis, value: any) => {
    const updatedChars = [...card.characters];
    updatedChars[index] = {
      ...updatedChars[index],
      [key]: value,
    };
    updateField('characters', updatedChars);
  };

  const removeCharacter = (index: number) => {
    const updatedChars = card.characters.filter((_, i) => i !== index);
    updateField('characters', updatedChars);
  };

  const moveCharacter = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= card.characters.length) return;
    const updatedChars = [...card.characters];
    const temp = updatedChars[index];
    updatedChars[index] = updatedChars[targetIndex];
    updatedChars[targetIndex] = temp;
    updateField('characters', updatedChars);
  };

  const addManualCharacter = () => {
    const newChar = lookupHanzi('新');
    updateField('characters', [...card.characters, newChar]);
  };

  // Grammar operations
  const addGrammarPoint = () => {
    const newPoint: GrammarPoint = {
      id: `g-${Date.now()}`,
      topic: 'Nuovo punto grammaticale',
      explanation: 'Spiegazione della regola sintattica, particella o costrutto.',
    };
    updateField('grammarPoints', [...card.grammarPoints, newPoint]);
  };

  const updateGrammarPoint = (index: number, field: keyof GrammarPoint, value: string) => {
    const updated = [...card.grammarPoints];
    updated[index] = { ...updated[index], [field]: value };
    updateField('grammarPoints', updated);
  };

  const removeGrammarPoint = (index: number) => {
    updateField('grammarPoints', card.grammarPoints.filter((_, i) => i !== index));
  };

  // Handle local image file upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        onChange({
          ...card,
          visual: {
            ...card.visual,
            type: 'upload',
            imageUrl: base64,
          },
          updatedAt: Date.now(),
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Pinyin tone insert helper
  const pinyinAccentedVowels = [
    'ā', 'á', 'ǎ', 'à',
    'ē', 'é', 'ě', 'è',
    'ī', 'í', 'ǐ', 'ì',
    'ō', 'ó', 'ǒ', 'ò',
    'ū', 'ú', 'ǔ', 'ù',
    'ǖ', 'ǘ', 'ǚ', 'ǜ',
  ];

  const quickEmojis = ['☯️', '🍵', '🎋', '📜', '🐉', '🏮', '🏔️', '🌸', '🌊', '🥋', '🪷', '🐅', '🐎', '🏯', '🖌️', '🌞', '🌙'];

  return (
    <div className="bg-white rounded-xl shadow-xs border border-stone-200 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-stone-200 bg-stone-50/80 px-4 pt-2 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('phrase')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'phrase'
              ? 'bg-white text-stone-900 border-t-2 border-amber-800 shadow-2xs'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>1. Frase & Traduzione</span>
        </button>

        <button
          onClick={() => setActiveTab('characters')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'characters'
              ? 'bg-white text-stone-900 border-t-2 border-amber-800 shadow-2xs'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>2. Scomposizione Ideogrammi ({card.characters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('grammar')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'grammar'
              ? 'bg-white text-stone-900 border-t-2 border-amber-800 shadow-2xs'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>3. Grammatica & Filosofia</span>
        </button>

        <button
          onClick={() => setActiveTab('visual')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'visual'
              ? 'bg-white text-stone-900 border-t-2 border-amber-800 shadow-2xs'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>4. Immagine, Sigillo & Tema</span>
        </button>
      </div>

      {/* TAB 1: PHRASE & GENERAL */}
      {activeTab === 'phrase' && (
        <div className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Titolo Tematico della Scheda
              </label>
              <input
                type="text"
                value={card.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="es. Il Tao segue la Natura"
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Categoria / Opera / Origine
              </label>
              <input
                type="text"
                value={card.category}
                onChange={(e) => updateField('category', e.target.value)}
                placeholder="es. Filosofia Taoista · Daodejing"
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700"
              />
            </div>
          </div>

          {/* Main Phrase in Chinese */}
          <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Frase in Caratteri Cinesi (Hanzi 汉字)
                </label>
                <span className="text-[11px] font-sans font-medium text-amber-900/80 bg-amber-100/80 px-2 py-0.5 rounded">
                  {segmentChinesePhrase(card.phrase).length} ideogrammi rilevati
                </span>
              </div>
              <button
                type="button"
                onClick={handleAutoSegmentPhrase}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-amber-800 text-white rounded-md hover:bg-amber-900 transition-all shadow-xs hover:shadow-sm cursor-pointer active:scale-95"
                title="Scompone la frase ideogramma per ideogramma e compila automaticamente il dizionario e pinyin"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analizza Caratteri Automaticamente</span>
              </button>
            </div>

            <input
              type="text"
              value={card.phrase}
              onChange={(e) => updateField('phrase', e.target.value)}
              placeholder="Inserisci la frase in cinese, es: 塞翁失马焉知非福"
              className="w-full px-4 py-3 text-2xl font-chinese font-bold bg-white border border-amber-300 rounded-lg tracking-widest focus:outline-hidden focus:ring-2 focus:ring-amber-700 text-stone-900 shadow-2xs"
            />

            {/* Notification alert banner */}
            {analysisNotice && (
              <div
                className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                  analysisNotice.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {analysisNotice.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                )}
                <span>{analysisNotice.text}</span>
              </div>
            )}

            <p className="text-[11px] text-stone-500">
              Suggerimento: clicca su <strong>"Analizza Caratteri Automaticamente"</strong> per popolare all'istante pinyin, radicali ed etimologie dal dizionario integrato (senza connessione internet).
            </p>
          </div>

          {/* Traditional Characters (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Caratteri Tradizionali (opzionale)
            </label>
            <input
              type="text"
              value={card.phraseTraditional || ''}
              onChange={(e) => updateField('phraseTraditional', e.target.value)}
              placeholder="es. 道法自然 / 千里之行，始於足下"
              className="w-full px-3 py-2 text-sm font-chinese bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
            />
          </div>

          {/* Pinyin with Quick Tone Inserter */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Trascrizione Pinyin (con toni)
              </label>
              <span className="text-[11px] text-stone-500">
                Clicca una vocale per inserirla:
              </span>
            </div>

            <input
              type="text"
              value={card.pinyin}
              onChange={(e) => updateField('pinyin', e.target.value)}
              placeholder="es. Dào fǎ zì rán"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg font-medium tracking-wide focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
            />

            {/* Quick pinyin vowel picker */}
            <div className="mt-2 flex items-center gap-1 flex-wrap p-2 bg-stone-100 rounded-md">
              {pinyinAccentedVowels.map((vowel) => (
                <button
                  key={vowel}
                  type="button"
                  onClick={() => {
                    updateField('pinyin', card.pinyin + vowel);
                    setCopiedPinyinHelper(vowel);
                    setTimeout(() => setCopiedPinyinHelper(null), 800);
                  }}
                  className="w-7 h-7 flex items-center justify-center text-xs font-semibold bg-white border border-stone-200 rounded hover:bg-stone-200 transition-colors"
                >
                  {vowel}
                </button>
              ))}
              {copiedPinyinHelper && (
                <span className="text-[10px] text-amber-800 ml-2 font-medium">
                  Aggiunto '{copiedPinyinHelper}'
                </span>
              )}
            </div>
          </div>

          {/* Italian Current Translation */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Traduzione Italiana (Espressione fluida)
            </label>
            <textarea
              rows={2}
              value={card.italianTranslation}
              onChange={(e) => updateField('italianTranslation', e.target.value)}
              placeholder="es. Il Tao prende a modello e segue la spontaneità della propria natura."
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
            />
          </div>

          {/* Literal Meaning (word-for-word) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Significato Letterale (Parola per parola)
            </label>
            <textarea
              rows={2}
              value={card.literalTranslation}
              onChange={(e) => updateField('literalTranslation', e.target.value)}
              placeholder="es. Il Tao (道) si conforma / segue (法) ciò che è spontaneamente tale per sé stesso (自然)."
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
            />
          </div>
        </div>
      )}

      {/* TAB 2: INDIVIDUAL CHARACTERS ANALYSIS */}
      {activeTab === 'characters' && (
        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                Scomposizione degli Ideogrammi ({card.characters.length})
              </h3>
              <p className="text-xs text-stone-500">
                Dettaglio per ogni singolo carattere: fonetica, tono, radicale, etimologia e ruolo.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoSegmentPhrase}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-800 text-white rounded-md hover:bg-amber-900 transition-colors shadow-2xs cursor-pointer active:scale-95"
                title="Sincronizza e analizza tutti i caratteri dalla frase"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rianalizza dalla Frase</span>
              </button>

              <button
                type="button"
                onClick={addManualCharacter}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-800 text-white rounded-md hover:bg-stone-900 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi</span>
              </button>
            </div>
          </div>

          {/* Notice banner if triggered */}
          {analysisNotice && (
            <div
              className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                analysisNotice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {analysisNotice.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              )}
              <span>{analysisNotice.text}</span>
            </div>
          )}

          {card.characters.length === 0 ? (
            <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300">
              <p className="text-sm text-stone-600 font-medium">Nessun ideogramma configurato.</p>
              <p className="text-xs text-stone-400 mt-1 mb-4">
                Inserisci una frase nel primo pannello o clicca sul pulsante qui sotto.
              </p>
              <button
                type="button"
                onClick={handleAutoSegmentPhrase}
                className="px-4 py-2 text-xs font-semibold bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition-colors"
              >
                Scomponi dalla Frase Attuale
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {card.characters.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 relative group"
                >
                  {/* Top Bar for this character */}
                  <div className="flex items-center justify-between gap-3 border-b border-stone-200/80 pb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-stone-400">
                        #{index + 1}
                      </span>
                      <input
                        type="text"
                        value={item.char}
                        maxLength={2}
                        onChange={(e) => updateCharacter(index, 'char', e.target.value)}
                        className="w-12 h-12 text-center text-3xl font-chinese font-bold bg-white border border-stone-300 rounded-lg shadow-2xs focus:ring-2 focus:ring-amber-700 focus:outline-hidden"
                      />
                      <div>
                        <span className="text-xs font-semibold text-stone-700">Pinyin:</span>
                        <input
                          type="text"
                          value={item.pinyin}
                          onChange={(e) => updateCharacter(index, 'pinyin', e.target.value)}
                          placeholder="es. dào"
                          className="ml-1.5 px-2 py-1 text-sm bg-white border border-stone-300 rounded w-24 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Tone selector */}
                      <select
                        value={item.tone}
                        onChange={(e) => updateCharacter(index, 'tone', Number(e.target.value) as any)}
                        className="px-2 py-1 text-xs bg-white border border-stone-300 rounded focus:outline-hidden"
                      >
                        <option value={1}>1° Tono (ā)</option>
                        <option value={2}>2° Tono (á)</option>
                        <option value={3}>3° Tono (ǎ)</option>
                        <option value={4}>4° Tono (à)</option>
                        <option value={5}>Tono neutro</option>
                      </select>

                      {/* Reorder and Delete controls */}
                      <button
                        type="button"
                        onClick={() => moveCharacter(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-stone-400 hover:text-stone-700 disabled:opacity-30 rounded hover:bg-stone-200"
                        title="Sposta su"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCharacter(index, 'down')}
                        disabled={index === card.characters.length - 1}
                        className="p-1.5 text-stone-400 hover:text-stone-700 disabled:opacity-30 rounded hover:bg-stone-200"
                        title="Sposta giù"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCharacter(index)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                        title="Rimuovi ideogramma"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Character Metadata Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                        Radicale (Busou 部首)
                      </label>
                      <input
                        type="text"
                        value={item.radical}
                        onChange={(e) => updateCharacter(index, 'radical', e.target.value)}
                        placeholder="es. 辶 (cammino)"
                        className="w-full px-2.5 py-1 text-xs bg-white border border-stone-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                        Numero di Tratti
                      </label>
                      <input
                        type="number"
                        value={item.strokes || ''}
                        onChange={(e) => updateCharacter(index, 'strokes', Number(e.target.value) || undefined)}
                        placeholder="es. 12"
                        className="w-full px-2.5 py-1 text-xs bg-white border border-stone-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                        Livello HSK / Difficoltà
                      </label>
                      <input
                        type="text"
                        value={item.hskLevel || ''}
                        onChange={(e) => updateCharacter(index, 'hskLevel', e.target.value)}
                        placeholder="es. HSK 3"
                        className="w-full px-2.5 py-1 text-xs bg-white border border-stone-300 rounded"
                      />
                    </div>
                  </div>

                  {/* Meaning & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                        Significato Letterale
                      </label>
                      <input
                        type="text"
                        value={item.literalMeaning}
                        onChange={(e) => updateCharacter(index, 'literalMeaning', e.target.value)}
                        placeholder="es. Via, sentiero, principio"
                        className="w-full px-2.5 py-1 text-xs bg-white border border-stone-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                        Ruolo / Funzione nella Frase
                      </label>
                      <input
                        type="text"
                        value={item.roleInPhrase || ''}
                        onChange={(e) => updateCharacter(index, 'roleInPhrase', e.target.value)}
                        placeholder="es. Soggetto grammaticale"
                        className="w-full px-2.5 py-1 text-xs bg-white border border-stone-300 rounded"
                      />
                    </div>
                  </div>

                  {/* Etymology / Mnemonic */}
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                      Etimologia / Origine Ideografica & Mnemotecnica
                    </label>
                    <textarea
                      rows={2}
                      value={item.etymology}
                      onChange={(e) => updateCharacter(index, 'etymology', e.target.value)}
                      placeholder="Spiega l'origine visiva, i componenti o la chiave mnemotecnica..."
                      className="w-full px-2.5 py-1 text-xs bg-white border border-stone-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GRAMMAR & PHILOSOPHY */}
      {activeTab === 'grammar' && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Grammar Points Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                  Analisi Grammaticale & Sintattica
                </h3>
                <p className="text-xs text-stone-500">
                  Regole, particelle, ordine dei costituenti o peculiarità del cinese classico/moderno.
                </p>
              </div>
              <button
                type="button"
                onClick={addGrammarPoint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-800 text-white rounded-md hover:bg-stone-900 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi Nota</span>
              </button>
            </div>

            {card.grammarPoints.map((point, idx) => (
              <div
                key={point.id || idx}
                className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 space-y-2 relative"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={point.topic}
                    onChange={(e) => updateGrammarPoint(idx, 'topic', e.target.value)}
                    placeholder="Argomento (es. Particella di legame 之 zhī)"
                    className="w-full px-2.5 py-1 text-xs font-semibold bg-white border border-stone-300 rounded focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => removeGrammarPoint(idx)}
                    className="text-stone-400 hover:text-red-600 p-1"
                    title="Rimuovi nota"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={point.explanation}
                  onChange={(e) => updateGrammarPoint(idx, 'explanation', e.target.value)}
                  placeholder="Spiegazione dettagliata della regola o del fenomeno sintattico..."
                  className="w-full px-2.5 py-1 text-xs bg-white border border-stone-300 rounded focus:outline-hidden"
                />
              </div>
            ))}
          </div>

          <hr className="border-stone-200" />

          {/* Philosophical & Cultural Depth */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                Significato Filosofico & Morale
              </h3>
              <p className="text-xs text-stone-500">
                La riflessione concettuale, l'interpretazione morale e la visione del mondo sottostante.
              </p>
            </div>

            <textarea
              rows={4}
              value={card.philosophicalMeaning}
              onChange={(e) => updateField('philosophicalMeaning', e.target.value)}
              placeholder="Approfondisci il significato filosofico della frase (es. il concetto di Wu Wei nel Taoismo, la rettitudine confuciana...)"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
            />

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Contesto Culturale & Storico (opzionale)
              </label>
              <textarea
                rows={3}
                value={card.culturalContext || ''}
                onChange={(e) => updateField('culturalContext', e.target.value)}
                placeholder="Aneddoti storici, provenienza dal testo classico o uso nei Chengyu..."
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VISUAL, SEAL & THEME */}
      {activeTab === 'visual' && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Visual Element Type */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              Elemento Visivo della Scheda
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'seal' as VisualType, label: 'Sigillo Rosso (印章)', icon: '印' },
                { type: 'emoji' as VisualType, label: 'Emoji Tematica', icon: '🎋' },
                { type: 'upload' as VisualType, label: 'Carica Immagine', icon: '📁' },
                { type: 'url' as VisualType, label: 'Link Immagine Web', icon: '🔗' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => updateVisual('type', item.type)}
                  className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    card.visual.type === item.type
                      ? 'border-amber-800 bg-amber-50 text-amber-950 ring-1 ring-amber-800 font-semibold'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-xl select-none">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration based on visual type */}
          {card.visual.type === 'emoji' && (
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <label className="block text-xs font-semibold text-stone-700">
                Seleziona o Inserisci un'Emoji:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {quickEmojis.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => updateVisual('emoji', em)}
                    className={`w-10 h-10 flex items-center justify-center text-2xl rounded-lg border transition-transform hover:scale-110 ${
                      card.visual.emoji === em ? 'border-amber-700 bg-white ring-2 ring-amber-700' : 'border-stone-200 bg-white'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-stone-500">Oppure inserisci emoji personalizzata:</span>
                <input
                  type="text"
                  value={card.visual.emoji || ''}
                  onChange={(e) => updateVisual('emoji', e.target.value)}
                  className="w-16 px-2 py-1 text-center text-lg bg-white border border-stone-300 rounded"
                />
              </div>
            </div>
          )}

          {card.visual.type === 'seal' && (
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <label className="block text-xs font-semibold text-stone-700">
                Carattere del Sigillo Tradizionale (Yin-Zhang):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  maxLength={2}
                  value={card.visual.sealText || '道'}
                  onChange={(e) => updateVisual('sealText', e.target.value)}
                  className="w-14 h-14 text-center text-2xl font-chinese font-bold bg-white border border-stone-300 rounded-lg shadow-2xs"
                />
                <div className="text-xs text-stone-500 space-y-1">
                  <p>Inserisci 1 o 2 caratteri per il sigillo decorativo principale.</p>
                  <p className="text-[11px] text-stone-400">Esempi tradizionali: 道 (Via), 德 (Virtù), 心 (Cuore), 智 (Saggezza), 静 (Quiete).</p>
                </div>
              </div>
            </div>
          )}

          {card.visual.type === 'upload' && (
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <label className="block text-xs font-semibold text-stone-700">
                Carica immagine dal tuo computer (nessun server necessario):
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white text-xs font-semibold rounded-lg hover:bg-stone-900 cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-4 h-4" />
                  <span>Scegli File Immagine</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>
                {card.visual.imageUrl && (
                  <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Immagine caricata in memoria
                  </span>
                )}
              </div>
            </div>
          )}

          {card.visual.type === 'url' && (
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <label className="block text-xs font-semibold text-stone-700">
                URL dell'Immagine (Web link):
              </label>
              <input
                type="url"
                value={card.visual.imageUrl || ''}
                onChange={(e) => updateVisual('imageUrl', e.target.value)}
                placeholder="https://esempio.it/immagine.jpg"
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Didascalia dell'Immagine o del Sigillo (opzionale)
            </label>
            <input
              type="text"
              value={card.visual.caption || ''}
              onChange={(e) => updateVisual('caption', e.target.value)}
              placeholder="es. Simbolo taoista dell'armonia naturale"
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
            />
          </div>

          <hr className="border-stone-200" />

          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              Tema Grafico della Scheda
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'xuan' as CardTheme, name: 'Carta di Riso', preview: 'bg-[#F9F6F0] border-[#D9CCB8] text-[#2C2723]' },
                { id: 'ink' as CardTheme, name: 'Inchiostro Notte', preview: 'bg-[#18191D] border-[#373A44] text-[#EFEBE4]' },
                { id: 'jade' as CardTheme, name: 'Giada Imperiale', preview: 'bg-[#F2F6F3] border-[#CCD9CF] text-[#1E2E24]' },
                { id: 'vermilion' as CardTheme, name: 'Rosso Cinabro', preview: 'bg-[#FCF9F4] border-[#B93826] text-[#29221C]' },
                { id: 'minimal' as CardTheme, name: 'Minimal Studio', preview: 'bg-[#FFFFFF] border-[#E5E7EB] text-[#111827]' },
              ].map((themeItem) => (
                <button
                  key={themeItem.id}
                  type="button"
                  onClick={() => updateStyle('theme', themeItem.id)}
                  className={`p-3 rounded-lg border text-center transition-all ${themeItem.preview} ${
                    card.style.theme === themeItem.id ? 'ring-2 ring-amber-800 font-bold scale-[1.02]' : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  <span className="text-xs block">{themeItem.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Stile Calligrafico Caratteri
              </label>
              <select
                value={card.style.fontFamily}
                onChange={(e) => updateStyle('fontFamily', e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden"
              >
                <option value="calligraphy">Pennello Tradizionale (Ma Shan Zheng)</option>
                <option value="serif">Serif Classico Editoriale (Noto Serif SC)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Sigillo in Alto a Destra (Nome Studente / Studio)
              </label>
              <input
                type="text"
                maxLength={8}
                value={card.style.sealName}
                onChange={(e) => updateStyle('sealName', e.target.value)}
                placeholder="es. Studio Hanzi o tue iniziali"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={card.style.showTianzige}
                onChange={(e) => updateStyle('showTianzige', e.target.checked)}
                className="rounded text-amber-800 focus:ring-amber-800"
              />
              <span>Mostra Griglia Tianzige (田字格) nei riquadri</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={card.style.showRadicals}
                onChange={(e) => updateStyle('showRadicals', e.target.checked)}
                className="rounded text-amber-800 focus:ring-amber-800"
              />
              <span>Mostra Radicali e Conteggio Tratti</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={card.style.showEtymology}
                onChange={(e) => updateStyle('showEtymology', e.target.checked)}
                className="rounded text-amber-800 focus:ring-amber-800"
              />
              <span>Mostra Etimologia & Scomposizione Ideografica</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={card.style.showGrammar}
                onChange={(e) => updateStyle('showGrammar', e.target.checked)}
                className="rounded text-amber-800 focus:ring-amber-800"
              />
              <span>Includi Sezione Analisi Grammaticale</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={card.style.showPhilosophy}
                onChange={(e) => updateStyle('showPhilosophy', e.target.checked)}
                className="rounded text-amber-800 focus:ring-amber-800"
              />
              <span>Includi Sezione Significato Filosofico</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
