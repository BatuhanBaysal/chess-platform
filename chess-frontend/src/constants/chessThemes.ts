export const CHESS_THEMES = {
  classic: { 
    dark: 'bg-[#b58863]', 
    light: 'bg-[#f0d9b5]', 
    textDark: 'text-[#f0d9b5]', 
    textLight: 'text-[#b58863]' 
  },
  modern: { 
    dark: 'bg-[#4b7399]', 
    light: 'bg-[#e2e8f0]', 
    textDark: 'text-[#e2e8f0]', 
    textLight: 'text-[#4b7399]' 
  },
  emerald: { 
    dark: 'bg-[#6a8d5c]', 
    light: 'bg-[#eceed1]', 
    textDark: 'text-[#eceed1]', 
    textLight: 'text-[#6a8d5c]' 
  }
} as const;

export type ChessThemeKey = keyof typeof CHESS_THEMES;
