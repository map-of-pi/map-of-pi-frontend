'use client';

import L from 'leaflet';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useContext, useEffect, useState, useRef } from 'react';

import { Button } from '@/components/shared/Forms/Buttons/Buttons';
import SearchBar from '@/components/shared/SearchBar/SearchBar';
import { fetchSellers } from '@/services/sellerApi';
import { fetchUserLocation, fetchUserSettings } from '@/services/userSettingsApi';
import { DeviceLocationType, IUserSettings } from '@/constants/types';

import { AppContext } from '../../../context/AppContextProvider';
import logger from '../../../logger.config.mjs';

export default function Index() {
  const t = useTranslations();
  const DynamicMap = dynamic(() => import('@/components/shared/map/Map'), {
    ssr: false,
  });
  const mapRef = useRef<L.Map | null>(null);

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 0,
    lng: 0,
  });
  const [searchCenter, setSetSearchCenter] = useState<{ lat: number; lng: number }>({
    lat: 0,
    lng: 0,
  });
  const [findme, setFindme] = useState<DeviceLocationType>(DeviceLocationType.SearchCenter);
  const [dbUserSettings, setDbUserSettings] = useState<IUserSettings | null>(null);
  const [zoomLevel, setZoomLevel] = useState(2);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchClicked, setSearchClicked] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const { isSigningInUser, currentUser, autoLoginUser } = useContext(AppContext);

  useEffect(() => {
    if (!currentUser) {
      logger.info("User not logged in; attempting auto-login..");
      autoLoginUser();
    }

    const getUserSettingsData = async () => {
      try {
        const data = await fetchUserSettings();
        if (data) {
          logger.info('Fetched user settings data successfully:', { data });
          setDbUserSettings(data);
          setSetSearchCenter(data.search_map_center.coordinates)
        } else {
          logger.warn('User Settings not found.');
          setDbUserSettings(null);
        }
      } catch (error) {
        logger.error('Error fetching user settings data:', { error });
      }
    };
    getUserSettingsData();
  }, [currentUser]);

  const handleLocationButtonClick = async () => {
    try {
      const location = await fetchUserLocation();
      setMapCenter(location.origin);
      setZoomLevel(location.zoom);
      setLocationError(null);
      logger.info('User location obtained successfully on button click:', {
        location,
      });
    } catch (error) {
      logger.error('Error getting location on button click.', { error });
      setLocationError(
        t('HOME.LOCATION_SERVICES.ENABLE_LOCATION_SERVICES_MESSAGE'),
      );
    }
  };

  // handle search query update from SearchBar and associated results
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSearchClicked(true);

    // Fetch sellers based on current map bounds and search query
    try {
      const mapInstance = mapRef.current;
      if (mapInstance) {
        const bounds = mapInstance.getBounds();
        const results = await fetchSellers(bounds, query); // Use API to fetch sellers
        setSearchResults(results || []); // Update searchResults
      }
    } catch (error) {
      logger.error('Failed to fetch sellers for search query.', { error });
    }
  };

  return (
    <>
      <DynamicMap
        center={searchCenter}
        zoom={zoomLevel}
        mapRef={mapRef}
        searchQuery={searchQuery}
        isSearchClicked={isSearchClicked}
        searchResults={searchResults || []}
      />
      <SearchBar page={'default'} onSearch={handleSearch} />
      <div className="absolute bottom-8 z-10   right-0 left-0 m-auto pointer-events-none">
        <div className="w-[90%] lg:w-full lg:px-6 mx-auto flex items-center justify-between">
          {/* Add Seller Button */}
          <div className="pointer-events-auto">
            <Link href="/seller/registration">
              <Button
                label={'+ ' + t('HOME.ADD_SELLER')}
                styles={{
                  height: '55px',
                  fontSize: '20px',
                  borderRadius: '10px',
                  color: '#ffc153',
                  paddingLeft: '45px',
                  paddingRight: '45px',
                }}
                disabled={isSigningInUser}
              />
            </Link>
          </div>
          {/* Location Button */}
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
      </div>
    </>
  );
}
