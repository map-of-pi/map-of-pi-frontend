declare interface Window {
  Pi: any;
}

// Declaration for leaflet-control-geocoder
declare module 'leaflet-control-geocoder/dist/Control.Geocoder.js' {
  const Geocoder: any;
  export default Geocoder;
}

/**
 * Global interface for paginated responses across the application.
 * Matches the backend PaginationResult structure exactly.
 */
export interface PaginationResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  hasPrevPage: boolean;
  pagingCounter: number;
}
