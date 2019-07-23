const underlineStart = '\x1b[4m';
const underlineEnd = '\x1b[24m';

export const highlightStart = '\x1b[42m';
export const highlightEnd = '\x1b[49m';

export function underlined(text: string): string {
  return `${underlineStart}${text}${underlineEnd}`;
}

export function highlight(text: string): string {
  return `${highlightStart}${text}${highlightEnd}`;
}
