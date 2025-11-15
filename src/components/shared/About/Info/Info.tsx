'use client';

import styles from './Info.module.css';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

import { useState } from 'react';

import { CloseButton } from '@/components/shared/Forms/Buttons/Buttons';

const InfoModel = (props: any) => {
  const t = useTranslations();

  const [version, setVersion] = useState('v1.6.0');

  return (
    <>
      {props.toggleInfo && (
        <div className={styles.model_container}>
          <div
            className={styles.model_event}
            onClick={() => props.setToggleInfo(false)}>
          </div>
          <div className={styles.model_body}>
            <CloseButton onClick={() => props.setToggleInfo(false)}/>
            <div className="flex justify-center mb-[10px]">
              <div className={styles.logo}>
                <Image src="/images/logo.svg" alt="Map of Pi" fill={true} />
              </div>
            </div>
            <div className={styles.title}>
              <h1 className='whitespace-nowrap'>Map of Pi</h1>
            </div>
            <div className={`${styles.version} mb-[16px]`}>
              <h3>{version}</h3>
            </div>
            <div className={styles.social_media}>
              <div className={styles.social_media__links}>
                <Link
                  href="mailto:mapofpi@gmail.com"
                  className={styles.social_media__link}
                  target="_blank">
                  <Image
                    src="/images/shared/social-media/email-icon.svg"
                    alt="Map of Pi Email Address"
                    className={styles.social_media__icon}
                    fill={true}
                  />
                </Link>
                <Link
                  href="https://facebook.com/mapofpi"
                  className={styles.social_media__link}
                  target="_blank">
                  <Image
                    src="/images/shared/social-media/facebook.icon.png"
                    alt="Map of Pi Facebook Page"
                    className={styles.social_media__icon}
                    fill={true}
                  />
                </Link>
                <Link
                  href="https://instagram.com/mapofpi"
                  className={styles.social_media__link}
                  aria-label="Instagram page"
                  target="_blank">
                  <Image
                    src="/images/shared/social-media/instagram-icon.png"
                    alt="Map of Pi Instagram Page"
                    className={styles.social_media__icon}
                    fill={true}
                  />
                </Link>
                <Link
                  href="https://twitter.com/mapofpi"
                  className={styles.social_media__link}
                  target="_blank">
                  <Image
                    src="/images/shared/social-media/x-icon.png"
                    alt="Map of Pi Twitter Page"
                    className={styles.social_media__icon}
                    fill={true}
                  />
                </Link>
                <Link
                  href="https://tiktok.com/@mapofpi"
                  className={styles.social_media__link}
                  target="_blank">
                  <Image
                    src="/images/shared/social-media/tiktok-icon.svg"
                    alt="Map of Pi TikTok Channel"
                    className={styles.social_media__icon}
                    fill={true}
                  />
                </Link>
                <Link
                  href="https://youtube.com/@mapofpi"
                  className={styles.social_media__link}
                  target="_blank">
                  <Image
                    src="/images/shared/social-media/youtube-icon.png"
                    alt="Map of Pi YouTube Channel"
                    className={styles.social_media__icon}
                    fill={true}
                  />
                </Link>
              </div>
            </div>

            <div className={styles.defects_contact}>
              <span>{t('POPUP.APP_VERSION_INFO.REPORTING_MESSAGE')} </span>
              <Link href="https://mapofpi.zapier.app/" target="_blank">
              <strong>mapofpi.zapier.app</strong>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfoModel;
