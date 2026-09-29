export type VisualType = 'emoji' | 'url' | 'upload' | 'seal';

export type CardTheme = 'xuan' | 'ink' | 'jade' | 'vermilion' | 'minimal';
export type CardLayout = 'poster' | 'split' | 'flashcard';

export interface HanziAnalysis {
  id: string;
  char: string;
  pinyin: string;
  tone: 1 | 2 | 3 | 4 | 5;
  radical: string;
  strokes?: number;
  hskLevel?: string;
  literalMeaning: string;
  etymology: string;
  roleInPhrase?: string;
}

export interface GrammarPoint {
  id: string;
  topic: string;
  explanation: string;
}

export interface CardVisual {
  type: VisualType;
  emoji?: string;
  imageUrl?: string;
  sealText?: string;
  caption?: string;
}

export interface CardStyle {
  theme: CardTheme;
  layout: CardLayout;
  fontFamily: 'serif' | 'calligraphy';
  showRadicals: boolean;
  showEtymology: boolean;
  showGrammar: boolean;
  showPhilosophy: boolean;
  showTianzige: boolean;
  sealName: string;
}

export interface ChineseThematicCard {
  id: string;
  title: string;
  category: string;
  phrase: string;
  phraseTraditional?: string;
  pinyin: string;
  italianTranslation: string;
  literalTranslation: string;
  philosophicalMeaning: string;
  culturalContext?: string;
  grammarPoints: GrammarPoint[];
  characters: HanziAnalysis[];
  visual: CardVisual;
  style: CardStyle;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}
