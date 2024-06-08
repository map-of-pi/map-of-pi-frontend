'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/shared/Forms/Buttons/Buttons';
import SearchBar from '@/components/shared/SearchBar/SearchBar';

export default function Index() {
  const t = useTranslations();

  const DynamicMap = dynamic(() => import('@/components/shared/map/Map'), {
    ssr: false,
  });

  return (
    <>
      <DynamicMap />
      <SearchBar />
      <div className="absolute bottom-8 z-10 flex justify-between gap-[22px] px-6 right-0 left-0 m-auto">
        <Link href="/seller-registration">
          <Button
            label={"+ " + t('HOME.ADD_SELLER')}
            styles={{ borderRadius: '10px', color: '#ffc153', paddingLeft: '50px', paddingRight: '50px' }}
          />
        </Link>
        <Button
          icon={<Image src='/images/shared/my_location.png' width={30} height={30} alt='my location' />}
          styles={{ borderRadius: '50%', width: '40px', height: '40px', padding: '0px' }}
        />
      </div>
    </>
  );
}
