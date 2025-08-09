import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '../Forms/Buttons/Buttons';
import MembershipIcon from '../membership/MembershipIcon';
import TrustMeter from '@/components/shared/Review/TrustMeter';
import { MembershipClassType } from '@/constants/membershipClassType';
import { translateSellerCategory } from '@/utils/translate';
import logger from '../../../../logger.config.mjs';

const MapMarkerPopup = ({ seller }: { seller: any }) => {
  const t = useTranslations();
  const locale = useLocale();

  const imageUrl =
    seller.image && seller.image.trim() !== ''
      ? seller.image
      : '/images/logo.svg';

  const truncateChars = (text: string, maxChars: number): string => {
    return text.length > maxChars ? text.slice(0, maxChars) + '...' : text;
  };

  logger.info('Rendering MapMarkerPopup for seller:', { seller });

  return (
    <div style={{ position: 'relative', zIndex: 20, padding: '10px' }}>
      {/* Seller name and type - Close with a small gap */}
      <div style={{ textAlign: 'center', marginBottom: '5px' }}>
        <div className="flex gap-1 justify-center items-center">
          <h2
            style={{
              fontWeight: 'bold',
              fontSize: '15px',
              marginBottom: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {truncateChars(seller.name, 12)} {/* Adjust limit as needed */}
          </h2>
          <MembershipIcon 
            category={ MembershipClassType.TRIPLE_GOLD } 
            styleComponent={{
              display: "inline-block",
              objectFit: "contain",
              verticalAlign: "middle"
            }}
          />
        </div>

        {seller.seller_type && (
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '0px', marginBottom: '4px' }}>
            {translateSellerCategory(seller.seller_type, t)}
          </p>

        )}
      </div>

      {/* Seller image - Close to seller type */}
      <div style={{ width: '150px', height: '70px', overflow: 'hidden', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Image
          src={imageUrl}
          alt="Seller Image"
          width={150}
          height={70}
          style={{
            objectFit: 'contain',
            width: '100%',
            height: '100%',
          }}
        />
      </div>

      {/* Trust-o-meter Label - Close to image */}
      <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' }}>
        Trust-o-meter
      </p>

      {/* Trust-o-meter - Close to the Trust-o-meter label */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
        <TrustMeter
          ratings={seller.trust_meter_rating}
        />
      </div>

      {/* Link to Buy button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
        <Link
          href={`/${locale}/seller/sale-items/${seller.seller_id}`} // Update to your target link
          style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
        >
          <Button
            label={t('SHARED.BUY')}
            styles={{
              color: '#ffc153',
              paddingTop: '6px',
              paddingBottom: '6px',
              width: '35%',
              textAlign: 'center',
            }}
          />
        </Link>
      </div>
    </div>
  );
};

export default MapMarkerPopup;

