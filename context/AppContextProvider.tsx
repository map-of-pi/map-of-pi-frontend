"use client";

import 'react-toastify/dist/ReactToastify.css';
import { useTranslations } from 'next-intl';
import {
  createContext,
  useState,
  SetStateAction,
  ReactNode,
  useEffect,
} from 'react';
import axiosClient, { setAuthToken } from '@/config/client';
import { onIncompletePaymentFound } from '@/config/payment';
import { AuthResult } from '@/constants/pi';
import { IUser, MembershipClassType } from '@/constants/types';
import { getNotifications } from '@/services/notificationApi';
import { getOrders } from '@/services/orderApi';
import logger from '../logger.config.mjs';

/**
 * Global Constants for Authentication Resilience
 */
const MAX_LOGIN_RETRIES = 3;
const SDK_RETRY_DELAY_MS = 2000;

interface IAppContextProps {
  currentUser: IUser | null;
  setCurrentUser: React.Dispatch<SetStateAction<IUser | null>>;
  authenticateUser: () => void;
  userMembership: MembershipClassType;
  setUserMembership: React.Dispatch<SetStateAction<MembershipClassType>>;
  isSigningInUser: boolean;
  reload: boolean;
  alertMessage: string | null;
  setAlertMessage: React.Dispatch<SetStateAction<string | null>>;
  showAlert: (message: string) => void;
  setReload: React.Dispatch<SetStateAction<boolean>>;
  isSaveLoading: boolean;
  setIsSaveLoading: React.Dispatch<SetStateAction<boolean>>;
  adsSupported: boolean;
  toggleNotification: boolean;
  setToggleNotification: React.Dispatch<SetStateAction<boolean>>;
  setNotificationsCount: React.Dispatch<SetStateAction<number>>;
  notificationsCount: number;
  ordersCount: number;
  setOrdersCount: React.Dispatch<SetStateAction<number>>;
}

const initialState: IAppContextProps = {
  currentUser: null,
  setCurrentUser: () => {},
  authenticateUser: () => {},
  isSigningInUser: false,
  userMembership: MembershipClassType.CASUAL,
  setUserMembership: () => {},
  reload: false,
  alertMessage: null,
  setAlertMessage: () => {},
  showAlert: () => {},
  setReload: () => {},
  isSaveLoading: false,
  setIsSaveLoading: () => {},
  adsSupported: false,
  toggleNotification: false,
  setToggleNotification: () => {},
  setNotificationsCount: () => {},
  notificationsCount: 0,
  ordersCount: 0,
  setOrdersCount: () => {},
};

export const AppContext = createContext<IAppContextProps>(initialState);

interface AppContextProviderProps {
  children: ReactNode;
}

const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const t = useTranslations();
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [isSigningInUser, setIsSigningInUser] = useState(false);
  const [userMembership, setUserMembership] = useState<MembershipClassType>(MembershipClassType.CASUAL);
  const [reload, setReload] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [adsSupported, setAdsSupported] = useState(false);
  const [toggleNotification, setToggleNotification] = useState<boolean>(true);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    logger.info('AppContextProvider mounted.');
    
    loadPiSdk()
      .then(Pi => {
        Pi.init({ version: '2.0', sandbox: process.env.NODE_ENV === 'development' });
        autoLoginUser();
        return Pi.nativeFeaturesList();
      })
      .then((features: any) => {
        if (features && Array.isArray(features)) {
          setAdsSupported(features.includes("ad_network"));
        }
      })
      .catch(err => logger.error('Pi SDK load/init error:', err));
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const fetchNotificationsCount = async () => {
      try {
        const { count } = await getNotifications({ skip: 0, limit: 1, status: 'uncleared' });
        setNotificationsCount(count);
        setToggleNotification(count > 0);
      } catch (error) {
        logger.error('Failed to fetch notification count:', error);
      }
    };
    fetchNotificationsCount();
  }, [currentUser, reload]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchOrdersCount = async () => {
      try {
        const { count } = await getOrders({ skip: 0, limit: 1, status: 'pending' });
        setOrdersCount(count);
      } catch (error) {
        logger.error('Failed to fetch orders count:', error);
      }
    };
    fetchOrdersCount();
  }, [currentUser, reload]);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(null), 5000);
  };

  /**
   * Enhanced Registration Flow with non-blocking retry logic.
   * Awaits SDK initialization instead of returning early to prevent dead-ends.
   */
  const registerUser = async (retries = MAX_LOGIN_RETRIES): Promise<void> => {
    try {
      setIsSigningInUser(true);
      const Pi = await loadPiSdk();

      // If SDK is present but not yet initialized by the effect, wait and retry.
      if (!Pi?.initialized) {
        if (retries > 0) {
          logger.warn(`Pi SDK initialization pending. Retrying registerUser... (${retries} left)`);
          await new Promise(resolve => setTimeout(resolve, SDK_RETRY_DELAY_MS));
          return registerUser(retries - 1);
        }
        throw new Error('Pi SDK failed to initialize in time.');
      }

      const pioneerAuth: AuthResult = await Pi.authenticate(
        ['username', 'payments', 'wallet_address'], 
        onIncompletePaymentFound
      );

      const res = await axiosClient.post("/users/authenticate", {}, {
        headers: { Authorization: `Bearer ${pioneerAuth.accessToken}` },
      });

      if (res.status === 200) {
        setAuthToken(res.data?.token);
        setCurrentUser(res.data.user);
        setUserMembership(res.data.membership_class);
        logger.info('Authentication successful.');
      }
    } catch (error) {
      logger.error('Error during registration flow:', error);
    } finally {
      setTimeout(() => setIsSigningInUser(false), 1500);
    }
  };

  const authenticateUser = () => registerUser();

  /**
   * Robust Auto-Login with exponential wait logic.
   * Ensures the auth flow persists even if the SDK initialization is slow.
   */
  const autoLoginUser = async (retries = MAX_LOGIN_RETRIES) => {
    try {
      setIsSigningInUser(true);
      const res = await axiosClient.get('/users/me');
      
      if (res.status === 200) {
        setCurrentUser(res.data.user);
        setUserMembership(res.data.membership_class);
      } else {
        await registerUser();
      }
    } catch (error: any) {
      if (retries > 0) {
        logger.warn(`Auto-login attempt failed. Retrying in ${SDK_RETRY_DELAY_MS}ms...`);
        setTimeout(() => autoLoginUser(retries - 1), SDK_RETRY_DELAY_MS);
      } else {
        logger.error('Auto-login session invalid after retries, fallback to fresh auth.');
        await registerUser();
      }
    } finally {
      setTimeout(() => setIsSigningInUser(false), 1500);
    }
  };

  const loadPiSdk = (): Promise<typeof window.Pi> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return;
      if (document.getElementById('pi-sdk') && window.Pi) return resolve(window.Pi);
      
      const script = document.createElement('script');
      script.id = 'pi-sdk';
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.async = true;
      script.onload = () => resolve(window.Pi);
      script.onerror = () => reject(new Error('Failed to load Pi SDK'));
      document.head.appendChild(script);
    });
  };

  return (
    <AppContext.Provider 
      value={{ 
        currentUser, setCurrentUser, authenticateUser, isSigningInUser, 
        userMembership, setUserMembership, reload, setReload, showAlert, 
        alertMessage, setAlertMessage, isSaveLoading, setIsSaveLoading, 
        adsSupported, toggleNotification, setToggleNotification,
        setNotificationsCount, notificationsCount, ordersCount, setOrdersCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
