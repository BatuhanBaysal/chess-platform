export const CHESS_THEMES = {
  classic: {
    dark: 'bg-[#b58863]',
    light: 'bg-[#f0d9b5]',
    previewDark: '#b58863',
    previewLight: '#f0d9b5',
  },
  modern: {
    dark: 'bg-[#4b7399]',
    light: 'bg-[#e2e8f0]',
    previewDark: '#4b7399',
    previewLight: '#e2e8f0',
  },
  emerald: {
    dark: 'bg-[#6a8d5c]',
    light: 'bg-[#eceed1]',
    previewDark: '#6a8d5c',
    previewLight: '#eceed1',
  }
} as const;

export type ChessThemeKey = keyof typeof CHESS_THEMES;
