import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import L, { LatLngExpression, LatLngBounds, LatLngTuple } from 'leaflet';
import _ from 'lodash';

import { ISeller, ISellerWithSettings } from '@/constants/types';
import { fetchSellers } from '@/services/sellerApi';

import MapMarkerPopup from './MapMarkerPopup';

import { AppContext } from '../../../../context/AppContextProvider';
import logger from '../../../../logger.config.mjs';

// Function to fetch seller coordinates based on bounds and optional search query
const fetchSellerCoordinates = async (
  bounds: L.LatLngBounds,
  searchQuery?: string
): Promise<ISellerWithSettings[]> => {
  try {
    const sellersData = await fetchSellers(bounds, searchQuery);

    // Map the seller data to include coordinates in the desired format
    const sellersWithCoordinates = sellersData?.map((seller: any) => {
      const [lng, lat] = seller.sell_map_center.coordinates;
      return {
        ...seller,
        coordinates: [lat, lng] as LatLngTuple,
      };
    });

    logger.info('Fetched sellers data:', { sellersWithCoordinates });

    return sellersWithCoordinates;
  } catch (error) {
    logger.error('Error fetching seller coordinates:', error);
    throw error;
  }
};

/* TODO: Analyze to see if we need this function to remove duplicates if sellers are already
restricted to one shop at the time of registration. */
const removeDuplicates = (sellers: ISellerWithSettings[]): ISellerWithSettings[] => {
  const uniqueSellers: { [key: string]: ISellerWithSettings } = {};
  sellers.forEach(seller => {
    uniqueSellers[seller.seller_id] = seller;
  });
  return Object.values(uniqueSellers);
};

const Map = ({
  center,
  zoom,
  mapRef,
  searchQuery,
  isSearchClicked,
  searchResults,
  onMapReady,
}: {
  center: LatLngExpression | null;
  zoom: number;
  mapRef: React.MutableRefObject<L.Map | null>;   
  searchQuery: string;
  isSearchClicked: boolean;
  searchResults: ISeller[];
  onMapReady?: () => void;
}) => {
  const t = useTranslations();
  const { isSigningInUser } = useContext(AppContext);

  const customIcon = L.icon({
    iconUrl: 'images/icons/map-of-pi-icon.png',
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  // Define the crosshair icon for the center of the map
  const crosshairIcon = new L.Icon({
    iconUrl: '/images/icons/crosshair.png',
    iconSize: [100, 100],
    iconAnchor: [60, 60],
  });

  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [sellers, setSellers] = useState<ISellerWithSettings[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [isLocationAvailable, setIsLocationAvailable] = useState(false);
  const [initialLocationSet, setInitialLocationSet] = useState(false);

  useEffect(() => {
    if (searchResults.length > 0) {
      const sellersWithCoordinates = searchResults.map((seller: any) => {
        const [lng, lat] = seller.sell_map_center.coordinates;
        return {
          ...seller,
          coordinates: [lat, lng] as LatLngTuple,
        };
      });

      // Remove duplicates and limit to 36 sellers
      const uniqueSellers = removeDuplicates(sellersWithCoordinates).slice(0, 36);

      setSellers(uniqueSellers);
    } else if (!searchQuery) {
      // If no search results and no search query, fetch initial sellers
      fetchInitialCoordinates();
    } else {
      setSellers([]); // Clear sellers when search yields no results
    }
  }, [searchResults]);

  // Effect to zoom to fit all sellers when the search button is clicked
  useEffect(() => {
    if (isSearchClicked && searchResults.length > 0) {
      // Ensure that only valid coordinates are used to create bounds
      const validCoordinates = searchResults
        .map((seller) => seller.coordinates)
        .filter((coordinates) => coordinates && coordinates.length === 2);
  
      if (validCoordinates.length > 0) {
        const bounds = L.latLngBounds(validCoordinates);
        mapRef.current?.fitBounds(bounds, { padding: [50, 50] }); // zoom to fit all sellers
      } else {
        logger.warn("No valid coordinates found to fit bounds.");
      }
    }
  }, [isSearchClicked, searchResults]);

  // Log sellers array for debugging
  useEffect(() => {
    logger.debug('Sellers Array:', { sellers });
  }, [sellers]);

  const useMarkerZoomHandler = (mapRef: React.RefObject<L.Map>) => {
    const lastClickedMarker = useRef<string | null>(null);
  
    // Function to handle marker click
    const handleMarkerClick = (sellerCoordinates: LatLngTuple) => {
      if (!mapRef.current) return;
  
      const map = mapRef.current;
      const currentZoom = map.getZoom();
      const maxZoom = map.getMaxZoom();
  
      const coordKey = sellerCoordinates.join(',');
  
      // Prevent zooming again on the same marker
      if (lastClickedMarker.current === coordKey) return;
  
      // Update the last clicked marker
      lastClickedMarker.current = coordKey;
  
      // Calculate target zoom
      const targetZoom = Math.min(currentZoom + 3, maxZoom);
  
      // Convert lat/lng to pixel position
      const markerPoint = map.latLngToContainerPoint(sellerCoordinates);
  
      // Offset to move popup up and left
      const OFFSET_X = -3;
      const OFFSET_Y = 28;
      const panOffset = L.point(OFFSET_X, OFFSET_Y);
  
      // New center for map
      const newCenter = map.containerPointToLatLng(markerPoint.subtract(panOffset));
  
      // Zoom and pan with animation
      map.setView(newCenter, targetZoom, { animate: true });
    };
  
    return handleMarkerClick;
  };
  
  useEffect(() => {
    if (mapRef.current) {
      fetchInitialCoordinates();  // Fetch sellers when map is ready
      onMapReady?.(); // Notify parent that map is ready
    }
  }, [mapRef.current]);

  const handleMarkerClick = useMarkerZoomHandler(mapRef);

  const saveMapState = () => {
    try{
      if (!mapRef.current) {
        return;
      }
      logger.debug('called handle navigation');
      const currentCenter = mapRef.current.getCenter();
      const currentZoom = mapRef.current.getZoom();
      sessionStorage.setItem('prevMapCenter', JSON.stringify(currentCenter));
      sessionStorage.setItem('prevMapZoom', currentZoom.toString());
      
    } catch (error) {
      logger.warn('map not ready');
    }
  };
  
  const fetchInitialCoordinates = async () => {
    if (searchQuery) {
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const mapInstance = mapRef.current;
  
      if (!mapInstance) {
        logger.warn('Map instance is not ready yet');
        return;
      }
  
      let prevCenter = sessionStorage.getItem('prevMapCenter');
      let prevZoom = sessionStorage.getItem('prevMapZoom');
  
      if (prevCenter && prevZoom) {
        // Parse prevCenter to LatLngExpression type
        const parsedPrevCenter = JSON.parse(prevCenter) as { lat: number; lng: number };
        const parsedPrevZoom = parseInt(prevZoom);
        logger.info("prev map center is focused to previous center:", parsedPrevCenter?.toString());  
        mapInstance.setView(parsedPrevCenter, parsedPrevZoom, { animate: false });
      } else if (center) {
        logger.info("initial map center is focused to user center:", center.toString());
        mapInstance.setView(center, 8, { animate: false });
      } else {
        const worldCenter = mapRef.current?.getCenter();
        logger.info("initial map center focused to world:", worldCenter?.toString());
        worldCenter
          ? mapInstance.setView(worldCenter, 2, { animate: false })
          : (mapRef.current = mapInstance);
      }
  
      const bounds = mapInstance.getBounds();
      if (bounds) {
        let sellersData = await fetchSellerCoordinates(bounds, '');
        sellersData = removeDuplicates(sellersData);
        setSellers(sellersData);
      }
    } catch (error) {
      logger.error('Failed to fetch initial coordinates:', error);
      setError('Failed to fetch initial coordinates');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle map interactions (only when there's no search query)
  const handleMapInteraction = async (newBounds: L.LatLngBounds, mapInstance: L.Map) => {
    const newCenter = newBounds.getCenter();
    if (searchQuery) return;

    logger.info('Handling map interaction with new center:', { newCenter });
    setLoading(true);
    setError(null);

    try {
      let additionalSellers = await fetchSellerCoordinates(newBounds, searchQuery);
      additionalSellers = removeDuplicates(additionalSellers);

      logger.info('Fetched additional sellers:', { additionalSellers });

      setSellers(additionalSellers); // Cap the total sellers to 50

      logger.info('Sellers after capping at 36:', {
        additionalSellers: additionalSellers,
      });

    } catch (error) {
      logger.error('Failed to fetch additional data:', error);
      setError('Failed to fetch additional data');
    } finally {
      setLoading(false);
    }
  };

  // Debounced function to handle map interactions
  const debouncedHandleMapInteraction = useCallback(
    _.debounce((bounds: LatLngBounds, mapInstance: L.Map) => {
      handleMapInteraction(bounds, mapInstance);
      saveMapState();
    }, 500),
    [sellers] // Dependency array ensures the debounced function is updated with the latest sellers
  );

  // Component to handle location and map events
  function LocationMarker() {
    const map = useMapEvents({
      locationfound(e) {
        logger.info(`Location found: ${e.latlng.toString()}`);
        setPosition(e.latlng);
        setLocationError(false);
        if (center) {
          map.setView(center, zoom, { animate: false });
        }
      },
      locationerror() {
        logger.warn('Location not found');
        setLocationError(true);
        setTimeout(() => setLocationError(false), 3000);
      },
      moveend() {
        const bounds = map.getBounds();
        debouncedHandleMapInteraction(bounds, map);
      },
      zoomend() {
        const bounds = map.getBounds();
        debouncedHandleMapInteraction(bounds, map);
      },
    });

    useEffect(() => {
      mapRef.current = map;
    }, [map]);

    // Initially set the view to user location without animation
    useEffect(() => {
      if (position && !initialLocationSet) {
        map.setView(position, zoom, { animate: false });
        setInitialLocationSet(true); // Prevent further automatic view resets
        setIsLocationAvailable(true);
      }
    }, [position, map, initialLocationSet]);

    return center === null ? null : <Marker position={center} />;
  }

  // Define map boundaries
  const bounds = L.latLngBounds(
    L.latLng(-90, -180), // SW corner
    L.latLng(90, 180) // NE corner
  );

  return (
    <>
      {loading && <div className="loading">{t('SHARED.LOADING_SCREEN_MESSAGE')}</div>}
      {error && <div className="error">{error}</div>}
      {locationError && (
        <div
          style={{
            position: 'fixed',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 0, 0, 0.8)',
            color: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            zIndex: 1000,
            textAlign: 'center',
            maxWidth: '90%',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
          }}
        >
          {t('HOME.LOCATION_SERVICES.DISABLED_LOCATION_SERVICES_MESSAGE')}
        </div>
      )}
      {isSigningInUser ? (
        <div className="w-full flex-1 fixed bottom-0 h-[calc(100vh-76.19px)] left-0 right-0 bg-[#f5f1e6] ">
          <div className="flex justify-center items-center w-full h-full">
            <Image 
              src="/default.png" 
              width={120} 
              height={140} 
              alt="splashscreen" 
            />
          </div>
        </div>
        ) : (
        <MapContainer
          center={center ? center : [0,0]}
          zoom={center ? zoom : 2}
          zoomControl={false}
          minZoom={2}
          maxZoom={18}
          whenReady={
            ((mapInstance: L.Map) => {
              mapRef.current = mapInstance;
            }) as unknown as () => void // utilize Type assertion
          }
          className="w-full flex-1 fixed bottom-0 h-[calc(100vh-76.19px)] left-0 right-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            noWrap={true}
          />
          <LocationMarker />
          {sellers.map((seller) => (
            <Marker
              position={seller.coordinates as LatLngExpression}
              key={seller.seller_id}
              icon={customIcon}
              eventHandlers={{
                click: () => handleMarkerClick(seller.coordinates as LatLngTuple),
              }}
            >
              <Popup
                closeButton={true}
                minWidth={200}
                maxWidth={250}
                className="custom-popup"
                offset={L.point(0, -3)} // Ensures the popup is slightly lower than the marker
              >
                <MapMarkerPopup seller={seller} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </>
  );
};

export default Map;