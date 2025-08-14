'use client';

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useContext, useEffect, useState } from 'react';
import { FiHelpCircle, FiMenu } from 'react-icons/fi';
import { ImSpinner2 } from 'react-icons/im';
import { IoMdArrowBack, IoMdClose } from 'react-icons/io';
import { MdHome } from 'react-icons/md';

import styles from './Navbar.module.css';
import MembershipIcon from '../membership/MembershipIcon';
import Sidebar from '../sidebar/sidebar';
import { AppContext } from '../../../../context/AppContextProvider';
import logger from '../../../../logger.config.mjs';

function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();
  const [sidebarToggle, setSidebarToggle] = useState(false);
  const [isHomePage, setIsHomePage] = useState(true);

  const {isSigningInUser, reload, alertMessage, isSaveLoading } = useContext(AppContext);
  const { notificationsCount } = useContext(AppContext);

  useEffect(() => {
  console.log("Navbar saw notification count:", notificationsCount);
}, [notificationsCount]);

  // check if the current page is the homepage
  useEffect(() => {
    const checkHomePage = () => {
      if (pathname === '/' || pathname === `/${locale}`) {
        setIsHomePage(true);
      } else {
        logger.info(`HomePage Pathname is ${pathname}`);
        setIsHomePage(false);
      }
    };
    checkHomePage();
  }, [pathname]);

  const handleBackBtn = () => {
    router.back();
  };

  const handleMenu = () => {
    setSidebarToggle(!sidebarToggle);
  };

  const handleClick = (e: any) => {
    e.preventDefault();
    window.open("https://mapofpi.zapier.app", "_blank", "noopener, noreferrer");
  };

  return (
    <>
      <div className="w-full h-[76.19px] z-500 px-[16px] py-[5px] bg-primary fixed top-0 left-0 right-0">
        <div className="w-full flex justify-between items-center">
          <div className="flex-1"></div>
          <div className="text-center text-secondary text-[1.3rem] whitespace-nowrap flex-1">
          {/* Display alert message with spinner if present, otherwise display 'Map of Pi' */}
          {alertMessage ? (
            <div className="alert-message flex items-center justify-center">
              {alertMessage}
            </div>
          ) : (
            isSigningInUser || reload ? (
              <div className="flex items-center justify-center">
                <ImSpinner2 className="animate-spin mr-2 ml-1" /> {/* Spinner Icon */}
                {t('SHARED.LOADING_SCREEN_MESSAGE')}
              </div>
            ) : (
              "Map of Pi"
            )
          )}
        </div>
          <div className="flex-1">
            <MembershipIcon category='triple_gold' />
          </div>
        </div>

        <div className="flex justify-between">
          <div className={`${styles.nav_item} ${(isHomePage || isSaveLoading) && 'disabled'}`}>
            <Link href="/" onClick={handleBackBtn}>
              <IoMdArrowBack size={26} className={`${(isHomePage || isSaveLoading) ? 'text-tertiary' : 'text-secondary'}`} />
            </Link>
          </div>

          <div className={`${styles.nav_item} ${(isHomePage || isSaveLoading) && 'disabled'}`}>
            <Link href={`/${locale}`}>
              <MdHome size={24} className={`${(isHomePage || isSaveLoading) ? 'text-tertiary' : 'text-secondary'}`} />
            </Link>
          </div>
          <div className={`${styles.nav_item} disabled`}>
            <Link href="/">
              <Image
                src="/images/logo.svg"
                alt="Map of Pi Home Logo"
                width={34}
                height={34}
              />
            </Link>
          </div>
          <div className={`${styles.nav_item}`}>
            <Link href="/" onClick={handleClick}>
              <FiHelpCircle size={24} className={'text-secondary'} />
            </Link>
          </div>
          <div className={`${styles.nav_item}`}>
            <Link
              href=""
              onClick={(e) => {
                if (isSigningInUser || isSaveLoading) {
                  e.preventDefault();
                } else {
                  handleMenu();
                }
              }}
            >
              <div className="relative">
                {sidebarToggle && !isSigningInUser && !isSaveLoading ? (
                  <IoMdClose size={24} className="text-secondary" />
                ) : (
                  <>
                    <FiMenu
                      size={24}
                      className={`${isSigningInUser || isSaveLoading ? 'text-tertiary cursor-not-allowed' : 'text-secondary'}`}
                    />
                    {notificationsCount > 0 && (
                      <span className="absolute top-[-6px] right-[-6px] w-[10px] h-[10px] bg-red-500 rounded-full animate-pulse" />
                    )}
                  </>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>
      {sidebarToggle && !isSigningInUser && !isSaveLoading && (
        <Sidebar toggle={sidebarToggle} setToggleDis={setSidebarToggle} />
      )}
    </>
  );
}

export default Navbar;