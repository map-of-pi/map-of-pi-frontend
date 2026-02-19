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

/**
 * Main Landing Page Component
 * Serves as the primary Map interface for the Pi Network ecosystem.
 * Orchestrates user localization, seller discovery, and notification management.
 */
export default function Page({ params }: { params: { locale: string } }) {
  const t = useTranslations();
  const { locale } = params;

  // Dynamic import of the Map component to prevent SSR-related Leaflet errors
  const DynamicMap = dynamic(() => import('@/components/shared/map/Map'), {
    ssr: false,
  });
  const mapRef = useRef<L.Map | null>(null);

  // State management for mapping and discovery workflows
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
    authenticateUser,
    reload,
    setReload
  } = useContext(AppContext);

  /**
   * Effect: Core Initialization
   * Handles session cleanup, authentication, and user settings resolution.
   */
  useEffect(() => {
    // Standard map state cleanup on reload or preference change
    if (reload) {
      sessionStorage.removeItem('prevMapCenter');
      sessionStorage.removeItem('prevMapZoom');
    }
    setReload(false);
    setSearchCenterPopup(false);
    
    checkAndAutoLoginUser(currentUser, authenticateUser);

    /**
     * Resolves user settings and determines if a search center setup is required.
     */
    const getUserSettingsData = async (): Promise<{ needsSearchCenter: boolean }> => {
      try {
        logger.info('Resolving user preferences and search boundaries...');
        const data = await fetchUserSettings();
        
        if (data) {
          setDbUserSettings(data);
          const coordinates = data.search_map_center?.coordinates;
          
          if (coordinates && coordinates.length >= 2) {
            const searchMapCenter = {
              lat: coordinates[1],
              lng: coordinates[0],
            };
            setSearchCenter(searchMapCenter);
            
            // Check for uninitialized coordinate values (0,0)
            const needs = searchMapCenter.lat === 0 && searchMapCenter.lng === 0;
            if (needs) setSearchCenterPopup(true);
            return { needsSearchCenter: needs };
          }
        }
        
        // Default fallback if no settings are found
        logger.warn('User Settings absent. Prompting for search center configuration.');
        setDbUserSettings(null);
        setSearchCenter(null);
        setSearchCenterPopup(true);
        return { needsSearchCenter: true };
      } catch (error) {
        logger.error('Failed to resolve user settings data:', error);
        return { needsSearchCenter: false };
      }
    };

    /**
     * Checks for unread notifications, prioritizing it only if Search Center is configured.
     */
    const checkUnclearedNotifications = async () => {
      if (!currentUser?.pi_uid) return;

      const hasShownNotificationThisSession = sessionStorage.getItem('notificationShown');
      if (hasShownNotificationThisSession === 'true') return;
      
      try {
        const notifications = await getNotifications({
          skip: 0,
          limit: 1, // Optimized for performance: we only need to know if at least one exists
          status: 'uncleared'
        });
        
        if (notifications?.items && notifications.items.length > 0) {
          setShowNotificationPopup(true);
          sessionStorage.setItem('notificationShown', 'true');
        }
      } catch (error) {
        logger.error('Notification resolution failure:', error);
      }
    };

    // Sequential initialization logic
    (async () => {
      const res = await getUserSettingsData();
      if (!res?.needsSearchCenter) {
        await checkUnclearedNotifications();
      } else {
        setShowNotificationPopup(false);
      }
    })();
  }, [currentUser, reload, setReload, authenticateUser]);

  /**
   * Effect: Geo-localization
   * Resolves physical device location based on user's 'findme' preference.
   */
  useEffect(() => {
    const resolveLocation = async () => {
      if (dbUserSettings && dbUserSettings.findme !== DeviceLocationType.SearchCenter) {
        try {
          const loc = await userLocation(dbUserSettings);
          if (loc) {
            setSearchCenter({ lat: loc[0], lng: loc[1] });
          }
        } catch (error) {
          logger.warn('Dynamic location resolution skipped due to preference or permission.');
        }
      }
    };
    resolveLocation();
  }, [dbUserSettings]);

  /**
   * Triggers manual re-localization via UI button.
   */
  const handleLocationButtonClick = async () => {
    sessionStorage.removeItem('prevMapCenter');
    sessionStorage.removeItem('prevMapZoom');
    
    if (dbUserSettings) {
      const loc = await userLocation(dbUserSettings);
      if (loc) {
        setSearchCenter({ lat: loc[0], lng: loc[1] });
        logger.info('Map re-centered to user hardware location.');
      }
    }
  };

  /**
   * Search Orchestration
   * Fetches sellers based on the active map viewport and provided query.
   */
  const handleSearch = async (query: string) => {
    if (!query?.trim()) return;

    setSearchQuery(query);
    setSearchClicked(true);

    try {
      const mapInstance = mapRef.current;
      if (mapInstance) {
        const bounds = mapInstance.getBounds();
        logger.info(`Initiating seller discovery for query: "${query}"`);
        const results = await fetchSellers(bounds, query);
        setSearchResults(results || []);
      }
    } catch (error) {
      logger.error('Seller discovery failed during viewport search:', error);
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* Map Infrastructure Layer */}
      <DynamicMap
        center={searchCenter}
        zoom={zoomLevel}
        mapRef={mapRef}
        searchQuery={searchQuery}
        isSearchClicked={isSearchClicked}
        searchResults={searchResults || []}
      />

      {/* Discovery UI Layer */}
      <SearchBar
        page={'default'}
        onSearch={handleSearch}
        setSearchResults={setSearchResults}
        setSearchQuery={setSearchQuery}
        setSearchClicked={setSearchClicked}
        isSearchClicked={isSearchClicked}
      />

      {/* Floating Action Controls */}
      <div className="absolute bottom-8 z-10 right-0 left-0 m-auto pointer-events-none">
        <div className="w-[90%] lg:w-full lg:px-6 mx-auto flex items-center justify-between">
          <div className="pointer-events-auto transition-transform active:scale-95">
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

          <div className="pointer-events-auto transition-transform active:scale-95">
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

        {/* Dynamic Dialog Overlays */}
        {showSearchCenterPopup && (
          <ConfirmDialog
            show={showSearchCenterPopup}
            onClose={() => setSearchCenterPopup(false)}
            message={t('HOME.SEARCH_CENTER_DEFAULT_MESSAGE')}
            url={`/map-center?entryType=search`}
          />
        )}
      </div>
      
      {!showSearchCenterPopup && showNotificationPopup && (
        <NotificationDialog
          setShowDialog={setShowNotificationPopup}
          onClose={() => setShowNotificationPopup(false)}
          message={t('HOME.NEW_NOTIFICATIONS_MESSAGE')}
          url={`/${locale}/notification`}
        />
      )}
    </div>
  );
}
