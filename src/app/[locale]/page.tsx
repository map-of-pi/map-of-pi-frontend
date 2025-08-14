'use client';

import L from 'leaflet';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useContext, useEffect, useState, useRef } from 'react';

import { Button } from '@/components/shared/Forms/Buttons/Buttons';
import SearchBar from '@/components/shared/SearchBar/SearchBar';
import ConfirmDialog from '@/components/shared/confirm';
import NotificationDialog from '@/components/shared/Notification/NotificationDialog';
import { getNotifications } from '@/services/notificationApi';
import { fetchSellers } from '@/services/sellerApi';
import { fetchUserSettings } from '@/services/userSettingsApi';
import { DeviceLocationType, IUserSettings } from '@/constants/types';
import { checkAndAutoLoginUser } from '@/utils/auth';
import { userLocation } from '@/utils/geolocation';

import { AppContext } from '../../../context/AppContextProvider';
import logger from '../../../logger.config.mjs';

export default function Page({ params }: { params: { locale: string } }) {
  const t = useTranslations();
  const { locale } = params;
  const DynamicMap = dynamic(() => import('@/components/shared/map/Map'), {
    ssr: false,
  });
  const mapRef = useRef<L.Map | null>(null);

  // State management with proper typing
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [dbUserSettings, setDbUserSettings] = useState<IUserSettings | null>(null);
  const [zoomLevel, setZoomLevel] = useState(2);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchClicked, setSearchClicked] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchCenterPopup, setSearchCenterPopup] = useState<boolean>(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState<boolean>(false);

  const {
    isSigningInUser,
    currentUser,
    autoLoginUser,
    reload,
    setReload
  } = useContext(AppContext);

  useEffect(() => {
    // clear previous map state when findme option is changed
    if (reload) {
      sessionStorage.removeItem('prevMapCenter');
      sessionStorage.removeItem('prevMapZoom');
    }
    setReload(false);
    setSearchCenterPopup(false);
    checkAndAutoLoginUser(currentUser, autoLoginUser);

    const getUserSettingsData = async () => {
      try {
        const data = await fetchUserSettings();
        if (data) {
          logger.info('Fetched user settings data successfully:', { data });
          setDbUserSettings(data);

          const coordinates = data.search_map_center?.coordinates;
          if (coordinates) {
            const searchMapCenter = {
              lat: coordinates[1],
              lng: coordinates[0],
            };
            setSearchCenter(searchMapCenter);
            if (searchMapCenter.lat === 0 && searchMapCenter.lng === 0) {
              setSearchCenterPopup(true);
            }
          }
        } else {
          logger.warn('User Settings not found.');
          setDbUserSettings(null);
          setSearchCenter(null);
        }
      } catch (error) {
        logger.error('Error fetching user settings data:', error);
      }
    };

    const checkUnclearedNotifications = async () => {
      if (!currentUser?.pi_uid) return;

      const hasShownNotificationThisSession = sessionStorage.getItem('notificationShown');
      if (hasShownNotificationThisSession === 'true') return; // Don't show again this session
      
      try {
        const notifications = await getNotifications({
          skip: 0,
          limit: 0,
          status: 'uncleared'
        });

        console.log('Uncleared notifications response:', notifications);
        
        if (notifications?.length > 0) {
          setShowNotificationPopup(true);
          sessionStorage.setItem('notificationShown', 'true');
        } else {
          setShowNotificationPopup(false);
        }
      } catch (error) {
        logger.error('Error getting new notifications:', error);
        setShowNotificationPopup(false);
      }
    };

    // Only proceed once currentUser is defined with a valid pi_uid
    getUserSettingsData();
    checkUnclearedNotifications();
  }, [currentUser, reload]);

  useEffect(() => {
    const resolveLocation = async () => {
      if (dbUserSettings && dbUserSettings.findme !== DeviceLocationType.SearchCenter) {
        const loc = await userLocation(dbUserSettings);
        if (loc) {
          setSearchCenter({ lat: loc[0], lng: loc[1] });
        } else {
          setSearchCenter(null);
        }
      }
    };
    resolveLocation();
  }, [dbUserSettings]);

  const handleLocationButtonClick = async () => {
    // clear previous map state when findme option is changed
    sessionStorage.removeItem('prevMapCenter');
    sessionStorage.removeItem('prevMapZoom');
    if (dbUserSettings) {
      const loc = await userLocation(dbUserSettings);
      if (loc) {
        setSearchCenter({ lat: loc[0], lng: loc[1] });
        logger.info('User location obtained successfully on button click:', {loc});
      } else {
        setSearchCenter(null);
      }
    }
  };

  // Handle search query update from SearchBar and associated results
  const handleSearch = async (query: string) => {
    if (query) {
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
        logger.error('Failed to fetch sellers for search query.', error);
      }
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
      <SearchBar
        page={'default'}
        onSearch={handleSearch}
        setSearchResults={setSearchResults}
        setSearchQuery={setSearchQuery}
        setSearchClicked={setSearchClicked}
        isSearchClicked={isSearchClicked}
      />
      <div className="absolute bottom-8 z-10 right-0 left-0 m-auto pointer-events-none">
        <div className="w-[90%] lg:w-full lg:px-6 mx-auto flex items-center justify-between">
          {/* Add Seller Button */}
          <div className="pointer-events-auto">
            <Link href={`/${locale}/seller/registration`}>
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
        {showSearchCenterPopup && (
          <ConfirmDialog
            show={setSearchCenterPopup}
            onClose={() => setSearchCenterPopup(false)}
            message={t('HOME.SEARCH_CENTER_DEFAULT_MESSAGE')}
            url={`/map-center?entryType=search`}
          />
        )}
      </div>
     
      {showNotificationPopup &&  (
        <NotificationDialog
          setShowDialog={setShowNotificationPopup}
          onClose={() => setShowNotificationPopup(false)}
          message={t('HOME.NEW_NOTIFICATIONS_MESSAGE')}
          url={`/${locale}/notification`}
        />
      )}
    </>
  );
}
