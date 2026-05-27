import LinkifyIt from 'linkify-it';

const linkify = new LinkifyIt();

export default function removeUrls(text: string): string {
  text = text.trim();
  const matches = linkify.match(text);
  if (!matches) return text;

  let result = text;
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    result = result.slice(0, match.index) + '[URL removed]' + result.slice(match.lastIndex);
  }
  return result;
}
