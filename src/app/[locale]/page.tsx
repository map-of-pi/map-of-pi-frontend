'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useContext } from 'react';

import { Button } from '@/components/shared/Forms/Buttons/Buttons';
import SearchBar from '@/components/shared/SearchBar/SearchBar';
import { AppContext } from '../../../context/AppContextProvider';

const getDeviceLocation = async (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      reject(new Error('Geolocation is not supported by this browser.'));
    }
  });
};

export default function Index() {
  const t = useTranslations();
  const DynamicMap = dynamic(() => import('@/components/shared/map/Map'), { ssr: false });

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [locationError, setLocationError] = useState<string | null>(null);
  const { registerUser, autoLoginUser } = useContext(AppContext);

  const defaultMapCenter = { lat: 20, lng: -74.0060 };

  useEffect(() => {
    // signup or login user
    const token = localStorage.getItem('mapOfPiToken');
    if (!token) {
      console.log("Not logged in; pending login..");
      registerUser();
    } else {
      autoLoginUser();
      console.log("Logged in");
    }

    const fetchLocationOnLoad = async () => {
      try {
        const location = await getDeviceLocation();
        setMapCenter(location);
      } catch (error) {
        console.error('Error getting location on initial load:', error);
        setMapCenter(defaultMapCenter); // Set to default location if geolocation fails
      }
    };

    fetchLocationOnLoad();
  }, []);

  const handleLocationButtonClick = async () => {
    try {
      const location = await getDeviceLocation();
      setMapCenter(location);
      setLocationError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError(t('HOME.LOCATION_SERVICES.ENABLE_LOCATION_SERVICES_MESSAGE'));
    }
  };

  return (
    <>
      <DynamicMap center={[mapCenter.lat, mapCenter.lng]} />
      <SearchBar />
      <div className="absolute bottom-8 z-10 flex justify-between gap-[22px] px-6 right-0 left-0 m-auto">
        <Link href="/seller/registration">
          <Button
            label={"+ " + t('HOME.ADD_SELLER')}
            styles={{ borderRadius: '10px', color: '#ffc153', paddingLeft: '50px', paddingRight: '50px' }}
          />
        </Link>
        <Button
          icon={<Image src='/images/shared/my_location.png' width={30} height={30} alt='my location' />}
          styles={{ borderRadius: '50%', width: '40px', height: '40px', padding: '0px' }}
          onClick={handleLocationButtonClick}
        />
      </div>
    </>
  );
}
