import * as fuzzysort from 'fuzzysort';

const underlineStart = '\x1b[4m';
const underlineEnd = '\x1b[24m';

const highlightStart = '\x1b[42m';
const highlightEnd = '\x1b[49m';

export function underlined(text: string): string {
  return `${underlineStart}${text}${underlineEnd}`;
}

export function highlight(text: string): string {
  return `${highlightStart}${text}${highlightEnd}`;
}

export function highlightMatchResult(result: Fuzzysort.Result) {
  return fuzzysort.highlight(result, highlightStart, highlightEnd)!;
}
