// src/lib/utils.ts
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/ø/gi, 'o') // Handle special Nordic characters
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^a-z0-9-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
}
