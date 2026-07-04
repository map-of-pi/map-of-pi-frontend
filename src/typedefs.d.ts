declare interface Window {
  Pi: any;
}

// Declaration for leaflet-control-geocoder
declare module 'leaflet-control-geocoder/dist/Control.Geocoder.js' {
  const Geocoder: any;
  export default Geocoder;
}

declare module 'linkify-it' {
  interface Match {
    schema: string;
    index: number;
    lastIndex: number;
    url: string;
  }

  interface Options {
    fuzzyLink?: boolean;
    fuzzyEmail?: boolean;
    fuzzyIP?: boolean;
  }

  class LinkifyIt {
    constructor(opts?: Options);

    match(text: string): Match[] | null;
    test(text: string): boolean;
    pretest(text: string): boolean;
    testSchemaAt(text: string, schema: string, pos: number): number;
    set(schemas: Record<string, unknown>): LinkifyIt;
    add(schema: string, definition: unknown): LinkifyIt;
    normalize(match: Match): void;
    tlds(list: string | string[], keepOld?: boolean): LinkifyIt;
    onCompile(): void;
  }

  export default LinkifyIt;
}
