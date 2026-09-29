import React from 'react';
import { ChineseThematicCard } from '../types';

interface CardViewProps {
  card: ChineseThematicCard;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  isExporting?: boolean;
}

export const CardView: React.FC<CardViewProps> = ({ card, cardRef }) => {
  const {
    title,
    category,
    phrase,
    phraseTraditional,
    pinyin,
    italianTranslation,
    literalTranslation,
    philosophicalMeaning,
    culturalContext,
    grammarPoints,
    characters,
    visual,
    style,
  } = card;

  // Theme configuration
  const themeClasses = {
    xuan: {
      wrapper: 'bg-[#F9F6F0] text-[#2C2723] border-[#E2D8C7]',
      innerBorder: 'border-[#D9CCB8]',
      cardHeader: 'text-[#8C2D19]',
      accentColor: 'text-[#8C2D19]',
      accentBg: 'bg-[#8C2D19]',
      accentBorder: 'border-[#8C2D19]',
      charBoxBg: 'bg-[#FFFDF9]',
      charBoxBorder: 'border-[#E0D5C3]',
      tianzigeLine: 'border-[#EADDCF]',
      subtleBg: 'bg-[#F2ECE1]/70',
      subtleText: 'text-[#6B635A]',
      hairline: 'border-[#E4DACB]',
      sealBg: 'bg-[#B22222]',
      sealText: 'text-[#FFF9F5]',
    },
    ink: {
      wrapper: 'bg-[#18191D] text-[#EFEBE4] border-[#2E313A]',
      innerBorder: 'border-[#2E313A]',
      cardHeader: 'text-[#D4AF37]',
      accentColor: 'text-[#D4AF37]',
      accentBg: 'bg-[#D4AF37]',
      accentBorder: 'border-[#D4AF37]',
      charBoxBg: 'bg-[#202228]',
      charBoxBorder: 'border-[#373A44]',
      tianzigeLine: 'border-[#2D3039]',
      subtleBg: 'bg-[#21242C]/80',
      subtleText: 'text-[#A6A29A]',
      hairline: 'border-[#2F323D]',
      sealBg: 'bg-[#A82824]',
      sealText: 'text-[#FFF5EA]',
    },
    jade: {
      wrapper: 'bg-[#F2F6F3] text-[#1E2E24] border-[#CCD9CF]',
      innerBorder: 'border-[#C2D2C6]',
      cardHeader: 'text-[#1F5438]',
      accentColor: 'text-[#1F5438]',
      accentBg: 'bg-[#1F5438]',
      accentBorder: 'border-[#1F5438]',
      charBoxBg: 'bg-[#FAFDFB]',
      charBoxBorder: 'border-[#CCD9D0]',
      tianzigeLine: 'border-[#DBE5DE]',
      subtleBg: 'bg-[#E3EDE6]/70',
      subtleText: 'text-[#4A6353]',
      hairline: 'border-[#CFDCD2]',
      sealBg: 'bg-[#A82824]',
      sealText: 'text-[#F4F9F5]',
    },
    vermilion: {
      wrapper: 'bg-[#FCF9F4] text-[#29221C] border-[#B93826]',
      innerBorder: 'border-[#E5C9C3]',
      cardHeader: 'text-[#B93826]',
      accentColor: 'text-[#B93826]',
      accentBg: 'bg-[#B93826]',
      accentBorder: 'border-[#B93826]',
      charBoxBg: 'bg-[#FFFDFC]',
      charBoxBorder: 'border-[#E8D4CE]',
      tianzigeLine: 'border-[#F0DFD9]',
      subtleBg: 'bg-[#F7EBE8]/60',
      subtleText: 'text-[#6E5C54]',
      hairline: 'border-[#EED5CE]',
      sealBg: 'bg-[#B93826]',
      sealText: 'text-white',
    },
    minimal: {
      wrapper: 'bg-[#FFFFFF] text-[#1F2421] border-[#E5E7EB]',
      innerBorder: 'border-[#F3F4F6]',
      cardHeader: 'text-[#4B5563]',
      accentColor: 'text-[#111827]',
      accentBg: 'bg-[#111827]',
      accentBorder: 'border-[#111827]',
      charBoxBg: 'bg-[#F9FAFB]',
      charBoxBorder: 'border-[#E5E7EB]',
      tianzigeLine: 'border-[#E5E7EB]',
      subtleBg: 'bg-[#F3F4F6]/80',
      subtleText: 'text-[#6B7280]',
      hairline: 'border-[#E5E7EB]',
      sealBg: 'bg-[#B91C1C]',
      sealText: 'text-white',
    },
  }[style.theme || 'xuan'];

  const fontClass = style.fontFamily === 'calligraphy' ? 'font-calligraphy' : 'font-chinese';

  // Render Tianzige Grid (cross-lines inside character box)
  const renderTianzige = () => {
    if (!style.showTianzige) return null;
    return (
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        {/* Horizontal center dashed line */}
        <div className={`absolute top-1/2 left-0 right-0 border-t border-dashed ${themeClasses.tianzigeLine}`} />
        {/* Vertical center dashed line */}
        <div className={`absolute left-1/2 top-0 bottom-0 border-l border-dashed ${themeClasses.tianzigeLine}`} />
      </div>
    );
  };

  // Tone color helper
  const getToneBadge = (tone: number) => {
    const toneLabels = ['1° tono (pianeggiante)', '2° tono (ascendente)', '3° tono (discendente-ascendente)', '4° tono (discendente brusco)', 'Tono neutro'];
    return (
      <span className="text-[11px] font-sans font-medium tracking-tight opacity-80">
        {toneLabels[tone - 1] || 'Neutro'}
      </span>
    );
  };

  return (
    <div
      ref={cardRef}
      id="chinese-study-card"
      className={`relative w-full max-w-4xl mx-auto rounded-xl p-6 sm:p-10 shadow-lg border-2 transition-colors ${themeClasses.wrapper}`}
      style={{
        boxSizing: 'border-box',
      }}
    >
      {/* Decorative Traditional Corner Brackets */}
      <div className={`absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 ${themeClasses.innerBorder} pointer-events-none`} />
      <div className={`absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 ${themeClasses.innerBorder} pointer-events-none`} />
      <div className={`absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 ${themeClasses.innerBorder} pointer-events-none`} />
      <div className={`absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 ${themeClasses.innerBorder} pointer-events-none`} />

      {/* TOP HEADER: Category & Theme metadata */}
      <div className="flex items-start justify-between gap-4 pb-5 border-b border-dashed border-current/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-sans font-medium tracking-wider uppercase mb-1">
            <span className={themeClasses.accentColor}>{category || 'Filosofia & Lingua Cinese'}</span>
            <span className="opacity-40">·</span>
            <span className={themeClasses.subtleText}>Scheda Didattica Hanzi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-editorial font-bold tracking-tight text-inherit">
            {title || 'Analisi Frase Classica'}
          </h2>
        </div>

        {/* Traditional Yin-Zhang Red Seal (stamp in upper right corner) */}
        {style.sealName && (
          <div className="flex flex-col items-center shrink-0">
            <div
              className={`w-11 h-11 rounded-sm flex items-center justify-center p-1 shadow-sm font-calligraphy text-base leading-none select-none ${themeClasses.sealBg} ${themeClasses.sealText}`}
              title="Sigillo di Studio"
              style={{
                boxShadow: 'inset 0 0 4px rgba(0,0,0,0.25)',
              }}
            >
              <span className="transform rotate-0">{style.sealName.slice(0, 2)}</span>
            </div>
            <span className="text-[9px] font-sans tracking-widest uppercase opacity-60 mt-1">印章</span>
          </div>
        )}
      </div>

      {/* MONUMENTAL PHRASE HERO DISPLAY */}
      <div className="py-7 text-center border-b border-dashed border-current/20">
        {/* Pinyin with tones */}
        <p className="font-sans text-sm sm:text-base font-medium tracking-widest opacity-80 mb-2">
          {pinyin}
        </p>

        {/* Main Chinese characters */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
          <h1
            className={`text-5xl sm:text-7xl font-bold tracking-wide select-text py-2 transition-transform duration-200 text-inherit ${fontClass}`}
            style={{
              textWrap: 'balance',
              letterSpacing: '0.08em',
            }}
          >
            {phrase}
          </h1>

          {/* Visual element (Emoji / Seal / Image / Photo) if top-aligned */}
          {visual.type === 'emoji' && visual.emoji && (
            <div className="text-4xl sm:text-5xl select-none" title={visual.caption || ''}>
              {visual.emoji}
            </div>
          )}
          {visual.type === 'seal' && visual.sealText && (
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded border-2 border-red-700/60 flex items-center justify-center ${themeClasses.sealBg} ${themeClasses.sealText} font-calligraphy text-2xl sm:text-3xl shadow-sm`}
            >
              {visual.sealText}
            </div>
          )}
        </div>

        {/* Traditional characters if available */}
        {phraseTraditional && phraseTraditional !== phrase && (
          <p className="text-xs font-chinese opacity-60 mt-1 tracking-wider">
            Caratteri tradizionali (繁體): <span className="font-semibold">{phraseTraditional}</span>
          </p>
        )}

        {/* Visual Image if URL or Upload */}
        {(visual.type === 'url' || visual.type === 'upload') && visual.imageUrl && (
          <div className="mt-4 flex flex-col items-center">
            <div className="relative max-w-xs sm:max-w-sm rounded-lg overflow-hidden border border-current/20 shadow-sm">
              <img
                src={visual.imageUrl}
                alt={visual.caption || 'Illustrazione tematica'}
                className="w-full h-44 object-cover object-center"
                referrerPolicy="no-referrer"
              />
              {visual.caption && (
                <div className="text-[11px] font-sans px-3 py-1 bg-black/60 text-white text-center backdrop-blur-xs">
                  {visual.caption}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Translations Cardlet */}
        <div className="mt-5 max-w-2xl mx-auto space-y-2">
          {/* Italian current translation */}
          <p className="text-base sm:text-lg font-editorial italic font-medium text-inherit leading-relaxed">
            «{italianTranslation}»
          </p>

          {/* Literal translation */}
          {literalTranslation && (
            <div className={`p-2.5 rounded-md text-xs sm:text-sm font-sans ${themeClasses.subtleBg}`}>
              <span className="font-semibold opacity-90">Significato Letterale: </span>
              <span className={themeClasses.subtleText}>{literalTranslation}</span>
            </div>
          )}
        </div>
      </div>

      {/* INDIVIDUAL IDEOGRAMS DECOMPOSITION (Scomposizione Ideogrammi) */}
      <div className="py-7 border-b border-dashed border-current/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans font-semibold tracking-wider uppercase opacity-75">
              Analisi dei Singoli Ideogrammi ({characters.length})
            </span>
          </div>
          <span className="text-xs font-sans opacity-50">
            Scomposizione Radicale · Tratti · Etimologia
          </span>
        </div>

        {/* Grid of Hanzi cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {characters.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`relative rounded-lg p-4 border transition-all ${themeClasses.charBoxBg} ${themeClasses.charBoxBorder} shadow-2xs flex flex-col justify-between`}
            >
              {/* Top row of character box */}
              <div className="flex items-start gap-4">
                {/* Character Box with Tianzige grid */}
                <div
                  className={`relative w-20 h-20 shrink-0 rounded border flex items-center justify-center overflow-hidden ${themeClasses.charBoxBorder}`}
                  style={{
                    backgroundColor: style.theme === 'ink' ? '#1B1D23' : '#FFFEFA',
                  }}
                >
                  {renderTianzige()}
                  <span
                    className={`relative z-10 text-4xl sm:text-5xl font-bold select-text ${fontClass} text-inherit`}
                  >
                    {item.char}
                  </span>
                </div>

                {/* Phonetics and Radical info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-xl font-sans font-bold tracking-wide text-inherit">
                      {item.pinyin || '—'}
                    </span>
                    {getToneBadge(item.tone)}
                  </div>

                  {/* Metadata line: Radical, Strokes, HSK */}
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs font-sans mt-1 opacity-80">
                    {style.showRadicals && item.radical && (
                      <span>Radicale: <strong className="font-semibold">{item.radical}</strong></span>
                    )}
                    {item.strokes && (
                      <>
                        <span aria-hidden="true" className="opacity-40">·</span>
                        <span>{item.strokes} tratti</span>
                      </>
                    )}
                    {item.hskLevel && (
                      <>
                        <span aria-hidden="true" className="opacity-40">·</span>
                        <span>{item.hskLevel}</span>
                      </>
                    )}
                  </div>

                  {/* Role in this specific phrase */}
                  {item.roleInPhrase && (
                    <div className="mt-1.5 text-xs font-sans">
                      <span className="opacity-60">Funzione: </span>
                      <span className="font-medium text-inherit">{item.roleInPhrase}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Character Details: Meaning & Etymology */}
              <div className="mt-3 pt-3 border-t border-dashed border-current/15 text-xs font-sans space-y-1.5">
                <div>
                  <span className="font-semibold opacity-90">Significato: </span>
                  <span className={themeClasses.subtleText}>{item.literalMeaning}</span>
                </div>

                {style.showEtymology && item.etymology && (
                  <div className="pt-1">
                    <span className="font-semibold opacity-90">Etimologia / Origine: </span>
                    <span className="italic opacity-85 leading-relaxed">{item.etymology}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GRAMMATICAL & PHILOSOPHICAL ANALYSIS SECTION */}
      <div className="pt-7 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Grammatical Analysis */}
        {style.showGrammar && (
          <div className={`rounded-lg p-5 border ${themeClasses.subtleBg} ${themeClasses.charBoxBorder}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-1.5 h-4 rounded-full ${themeClasses.accentBg}`} />
              <h3 className="text-sm font-sans font-bold tracking-wider uppercase text-inherit">
                Analisi Grammaticale & Sintattica
              </h3>
            </div>

            {grammarPoints && grammarPoints.length > 0 ? (
              <div className="space-y-3">
                {grammarPoints.map((gp, idx) => (
                  <div key={gp.id || idx} className="text-xs sm:text-sm font-sans">
                    <h4 className="font-semibold text-inherit flex items-center gap-1.5">
                      <span className="text-[10px] opacity-60">0{idx + 1}.</span>
                      <span>{gp.topic}</span>
                    </h4>
                    <p className={`mt-0.5 leading-relaxed ${themeClasses.subtleText}`}>
                      {gp.explanation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-sans opacity-60 italic">Nessuna annotazione grammaticale registrata.</p>
            )}
          </div>
        )}

        {/* Philosophical & Cultural Depth */}
        {style.showPhilosophy && (
          <div className={`rounded-lg p-5 border ${themeClasses.subtleBg} ${themeClasses.charBoxBorder}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-1.5 h-4 rounded-full ${themeClasses.accentBg}`} />
              <h3 className="text-sm font-sans font-bold tracking-wider uppercase text-inherit">
                Significato Filosofico & Morale
              </h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm font-sans">
              <div>
                <p className={`leading-relaxed ${themeClasses.subtleText}`}>
                  {philosophicalMeaning || 'Nessuna riflessione filosofica inserita.'}
                </p>
              </div>

              {culturalContext && (
                <div className="pt-2 border-t border-dashed border-current/15">
                  <h4 className="font-semibold text-inherit mb-1">Contesto Culturale & Storico:</h4>
                  <p className={`leading-relaxed italic ${themeClasses.subtleText}`}>
                    {culturalContext}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CARD FOOTER */}
      <div className="mt-8 pt-4 border-t border-current/15 flex items-center justify-between text-[11px] font-sans opacity-60">
        <div className="flex items-center gap-2">
          <span>HanziCard Studio</span>
          <span>·</span>
          <span>Didattica della Lingua Cinese</span>
        </div>
        <div className="flex items-center gap-2">
          <span>学以致用 · Imparare per Praticare</span>
        </div>
      </div>
    </div>
  );
};
