"use client";

import 'react-toastify/dist/ReactToastify.css';
import { useTranslations } from 'next-intl';
import {
  createContext,
  useState,
  SetStateAction,
  ReactNode,
  useEffect,
  useRef
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
const BASE_DELAY_MS = 5000;

/**
 * Core interface for the Application Context.
 * Defines shared state and methods used across the Pi Network ecosystem.
 */
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

/**
 * Initial state configuration to ensure type safety and prevent runtime errors.
 */
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

  /**
   * Initializes Pi SDK and attempts automatic user session restoration on mount.
   * Handles asynchronous SDK loading and native feature discovery.
   */
  useEffect(() => {
    logger.info('AppContextProvider mounted.');
    autoLoginUser();

    loadPiSdk()
      .then(Pi => {
        Pi.init({ version: '2.0', sandbox: process.env.NODE_ENV === 'development' });
        return Pi.nativeFeaturesList();
      })
      .then((features: any) => {
        if (Array.isArray(features)) {
          setAdsSupported(features.includes("ad_network"));
        }
      })
      .catch(err => logger.error('Pi SDK load/init error:', err));
  }, []);

  /**
   * Synchronizes notification counters with the Backend.
   * Triggered on user login or global reload signal.
   */
  useEffect(() => {
    if (!currentUser) return;

    const fetchNotificationsCount = async () => {
      try {
        const { count } = await getNotifications({ skip: 0, limit: 1, status: 'uncleared' });
        setNotificationsCount(count);
        setToggleNotification(count > 0);
      } catch (error) {
        logger.error('Failed to fetch notification count:', error);
        setNotificationsCount(0);
      }
    };
    fetchNotificationsCount();
  }, [currentUser, reload]);

  /**
   * Synchronizes pending order counts for real-time dashboard updates.
   * Aligns with Backend pagination and status filtering logic.
   */
  useEffect(() => {
    if (!currentUser) return;

    const fetchOrdersCount = async () => {
      try {
        const { count } = await getOrders({ skip: 0, limit: 1, status: 'pending' });
        setOrdersCount(count);
      } catch (error) {
        logger.error('Failed to fetch orders count:', error);
        setOrdersCount(0);
      }
    };
    fetchOrdersCount();
  }, [currentUser, reload]);

  /**
   * Helper to manage global alert visibility.
   */
  const showAlert = (message: string) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(null), 5000);
  };

  /**
   * Primary registration flow via Pi Network Native Authentication.
   * Exchanges Pi AccessToken for a local session JWT from the Backend.
   */
  const registerUser = async () => {
    if (typeof window !== 'undefined' && window.Pi?.initialized) {
      try {
        setIsSigningInUser(true);
        const pioneerAuth: AuthResult = await window.Pi.authenticate(['username', 'payments', 'wallet_address'], onIncompletePaymentFound);
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
        setTimeout(() => setIsSigningInUser(false), 2500);
      }
    }
  };

  /**
   * Proxy function for authentication to maintain Interface compliance.
   */
  const authenticateUser = () => {
    registerUser();
  };

  /**
   * Attempts to verify existing session via Backend "/users/me" endpoint.
   * Cascades to full registration flow if session is expired or invalid.
   */
  const autoLoginUser = async () => {
    try {
      setIsSigningInUser(true);
      const res = await axiosClient.get('/users/me');
      if (res.status === 200) {
        setCurrentUser(res.data.user);
        setUserMembership(res.data.membership_class);
      } else {
        await registerUser();
      }
    } catch (error) {
      logger.warn('Auto-login session invalid, initiating fresh auth.');
      await registerUser();
    } finally {
      setTimeout(() => setIsSigningInUser(false), 2500);
    }
  };

  /**
   * Dynamically injects the Pi SDK script into the DOM.
   * Prevents duplicate script injection via ID tracking.
   */
  const loadPiSdk = (): Promise<typeof window.Pi> => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('pi-sdk')) return resolve(window.Pi);
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
        currentUser, 
        setCurrentUser, 
        authenticateUser, 
        isSigningInUser, 
        userMembership,
        setUserMembership,
        reload, 
        setReload, 
        showAlert, 
        alertMessage, 
        setAlertMessage, 
        isSaveLoading, 
        setIsSaveLoading, 
        adsSupported,
        toggleNotification,
        setToggleNotification,
        setNotificationsCount,
        notificationsCount,
        ordersCount,
        setOrdersCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
