import LinkifyIt from 'linkify-it';

const linkify = new LinkifyIt();
const DEFAULT_URL_REPLACEMENT = '[URL removed]';

type LinkifyMatch = NonNullable<ReturnType<typeof linkify.match>>[number];

function replaceLinks(
  text: string,
  shouldReplace: (match: LinkifyMatch) => boolean,
): string {
  text = text.trim();
  const matches = linkify.match(text);
  if (!matches) return text;

  let result = text;
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    if (!shouldReplace(match)) continue;

    result =
      result.slice(0, match.index) +
      DEFAULT_URL_REPLACEMENT +
      result.slice(match.lastIndex);
  }
  return result;
}

export function removeUrls(text: string): string {
  return replaceLinks(text, () => true);
}

export function removeUrlsFromEmailField(text: string): string {
  return replaceLinks(text, (match) => match.schema !== 'mailto:');
}
