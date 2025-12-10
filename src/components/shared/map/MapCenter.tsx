'use client';

import 'leaflet/dist/leaflet.css';
import './MapCenter.css';
import Image from 'next/image';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useContext, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-control-geocoder';

import { ConfirmDialogX } from '../confirm';
import { Button } from '../Forms/Buttons/Buttons';
import RecenterAutomatically from './RecenterAutomatically';
import SearchBar from '../SearchBar/SearchBar';
import { saveMapCenter, fetchMapCenter, checkSanctionStatus } from '@/services/mapCenterApi';

import { AppContext } from '../../../../context/AppContextProvider';
import logger from '../../../../logger.config.mjs';

// Define the crosshair icon for the center of the map
const crosshairIcon = new L.Icon({
  iconUrl: '/images/icons/crosshair.png',
  iconSize: [100, 100],
  iconAnchor: [60, 60],
});

interface MapCenterProps {
  entryType: 'search' | 'sell';
  locale: string;
}

const MapCenter = ({ entryType }: MapCenterProps) => {
  const t = useTranslations();
  const [showPopup, setShowPopup] = useState(false);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lng: 19.944544,
    lat: 50.064192,
  });
  const { currentUser, authenticateUser } = useContext(AppContext);
  const mapRef = useRef<L.Map | null>(null);

  const isSigningInUser = false;

  useEffect(() => {
    if (!currentUser) {
      logger.info("User not logged in; attempting auto-login..");
      authenticateUser();
    }

    // Fetch the map center from the backend if the user is authenticated
    const getMapCenter = async () => {
      if (currentUser?.pi_uid) {
        try {
          const mapCenter = await fetchMapCenter(entryType);
          if (mapCenter?.latitude !== undefined && mapCenter.longitude !== undefined) {
            setCenter({ lat: mapCenter.latitude, lng: mapCenter.longitude });
            logger.info(`Map center set to longitude: ${mapCenter.longitude}, latitude: ${mapCenter.latitude}}`
            );
          } else {
            logger.warn('Map center is undefined, falling back to default coordinates');
            setCenter({ lat: 50.064192, lng: 19.944544 });
          }
        } catch (error) {
          logger.error('Error fetching map center:', error);
        }
      }
    };
    getMapCenter();
  }, [currentUser]);

  // Geocode the query and update the map center
  const handleSearch = async (query: string) => {
    try {
      const geocoder = new (L.Control as any).Geocoder.nominatim();
      geocoder.geocode(query, (results: any) => {
        if (results.length > 0) {
          const { center: resultCenter } = results[0];
          // Check if the new center is different from the current center before setting it
          if (resultCenter.lat !== center.lat || resultCenter.lng !== center.lng) {
            setCenter({ lat: resultCenter.lat, lng: resultCenter.lng });
            if (mapRef.current) {
              mapRef.current.setView([resultCenter.lat, resultCenter.lng], 13);
            }
          }
        } else {
          logger.warn(`No result found for the query: ${query}`);
        }
      });
    } catch (error) {
      logger.error('Error during geocoding:', error);
    }
  };

  // Access the map instance and set initial center without causing an infinite loop
  const MapHandler = () => {
    const map = useMap();

    useEffect(() => {
      if (mapRef.current !== map) {
        mapRef.current = map;
        const initialCenter = map.getCenter();
        setCenter({ lat: initialCenter.lat, lng: initialCenter.lng });
        logger.debug('Map instance and reference set on load.');
      }
    }, [map]);

    return null;
  };

  // Component to handle map events without triggering infinite loops
  const CenterMarker = () => {
    useMapEvents({
      moveend() {
        const newCenter = mapRef.current?.getCenter();
        if (newCenter && (newCenter.lat !== center.lat || newCenter.lng !== center.lng)) {
          setCenter({ lat: newCenter.lat, lng: newCenter.lng }); // Update local center state
          logger.debug(`Map center updated to: ${newCenter.lat}, ${newCenter.lng}`);
        }
      },
    });

    return center ? <Marker position={center} icon={crosshairIcon} /> : null;
  };

  const setMapCenter = async () => {
    if (!center || !currentUser?.pi_uid) return;
  
    const { lat, lng } = center;
  
    try {
      switch (entryType) {
        case 'sell': {
          const response = await checkSanctionStatus(lat, lng);
          if (response?.isSanctioned) {
            setShowWarningPopup(true);
          } else {
            await saveMapCenter(lat, lng, entryType);
            setShowPopup(true);
            logger.info(`Sell Center saved at [${lat}, ${lng}]`);
          }
          break;
        }
  
        case 'search': {
          await saveMapCenter(lat, lng, entryType);
          setShowPopup(true);
          logger.info(`Search Center saved at [${lat}, ${lng}]`);
          break;
        }
  
        default: {
          logger.warn(`Unexpected entryType: ${entryType}`);
          break;
        }
      }
    } catch (error) {
      logger.error('Error setting map center:', error);
    }
  };
  
  const handleClickDialog = () => {
    setShowPopup(false);
  };

  const handleWarningClickDialog = async () => {
    const responseData = await saveMapCenter(center.lat, center.lng, entryType);
    if (responseData) {
      setShowWarningPopup(false);
    }
  };

  const bounds = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));

  const handleLocationButtonClick = () => { // Temporary placeholders for handling errors
    console.log('Location Button Clicked')
  }

  return (
    <div className="search-container">
      <p className="search-text">
        {t('SHARED.MAP_CENTER.SEARCH_BAR_PLACEHOLDER')}
      </p>
      <SearchBar onSearch={handleSearch} page={'map_center'} />
      <MapContainer
        center={center}
        zoom={2}
        zoomControl={false}
        minZoom={2}
        maxZoom={18}
        // maxBounds={bounds}
        // maxBoundsViscosity={1.0}
        className="w-full flex-1 fixed top-[76.19px] h-[calc(100vh-76.19px)] left-0 right-0 bottom-0"
        whenReady={() => {
          const mapInstance: any = mapRef.current;
          if (mapInstance) {
            logger.info('Map instance set during map container ready state.');
          }
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="Map data © OpenStreetMap contributors"
          noWrap={true}
        />
        <CenterMarker />
        <MapHandler />
        <RecenterAutomatically position={center} />
      </MapContainer>
      
      <div className="absolute bottom-8 z-10 flex justify-start px-6 right-0 left-0 m-auto pointer-events-none">
        {/* Add Set Map Center Button */}
        <div className="pointer-events-auto">
          <Button
            label={entryType === 'sell'
              ? t('SCREEN.SELLER_REGISTRATION.SELLER_SELL_CENTER')
              : t('SHARED.SEARCH_CENTER')}
            onClick={setMapCenter}
            styles={{
              color: '#ffc153',
              height: '50px',
              padding: '20px',
              fontSize: '22px',
            }}
          />
        </div>
      </div>
      <div className="absolute bottom-8 z-10 flex justify-end px-6 right-0 left-0 m-auto pointer-events-none">
        {/* Find Me Button */}
        <div className="pointer-events-auto">
          <Button
            icon={
              <Image
                src="/images/shared/my_location.png"
                width={40}
                height={40}
                alt="my location"
              />
            }
            styles={{
              borderRadius: '50%',
              width: '55px',
              height: '55px',
              padding: '0px',
            }}
            onClick={handleLocationButtonClick}
            disabled={isSigningInUser}
          />
        </div>
      </div>
      {/* Static Scope - should always be centered */}
      <div className="absolute z-10 pointer-events-none top-[53.5%] left-[47.3%] transform -translate-x-1/2 -translate-y-1/2" style={{ width: '65px', height: '65px' }}>
        <Image
          src="/images/icons/scope.png"
          alt="Scope"
          layout="fill"
          className="w-full h-full object-contain" // Ensure proper scaling
        />
      </div>

      {showPopup && (
        <ConfirmDialogX
          toggle={() => setShowPopup(false)}
          handleClicked={handleClickDialog}
          message={t('SHARED.MAP_CENTER.VALIDATION.MAP_CENTER_SUCCESS_MESSAGE')}
        />
      )}
      {showWarningPopup && (
        <ConfirmDialogX
          toggle={() => setShowWarningPopup(false)}
          handleClicked={handleWarningClickDialog}
          message={t('SHARED.MAP_CENTER.VALIDATION.SELL_CENTER_SANCTIONED_MESSAGE')}
        />
      )}
    </div>
  );
};

export default MapCenter;
