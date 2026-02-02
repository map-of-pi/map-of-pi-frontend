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
 * Interface defining the global state and functions provided by AppContext.
 */
const MAX_LOGIN_RETRIES = 3;
const BASE_DELAY_MS = 5000; // 5s → 15s → 45s

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
};

/**
 * Initial state to prevent undefined errors in consuming components.
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

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// both HTTP 401 Unauthorized and HTTP 403 Forbidden errors are considered "hard fails" 
// in the sense that the server is actively denying access
const isHardFail = (err: any) => {
  const code = err?.response?.status || err?.status;
  return code === 401 || code === 403;
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
   * Effect to initialize Pi SDK and trigger auto-login on mount.
   */
  useEffect(() => {
    logger.info('AppContextProvider mounted.');
    autoLoginUser();

    loadPiSdk()
      .then(Pi => {
        Pi.nativeFeaturesList().then((features: string | string[]) => {
          setAdsSupported(features.includes("ad_network"));
        })
      })
      .then(features => setAdsSupported(features.includes("ad_network")))
      .catch(err => logger.error('Pi SDK load/init error:', err));
  }, []);

  /**
   * Effect to synchronize notification counts based on user session and global reload state.
   */
  useEffect(() => {
    if (!currentUser) return;

    const fetchNotificationsCount = async () => {
      try {
        const { count } = await getNotifications({
          skip: 0,
          limit: 1,
          status: 'uncleared'
        });
        setNotificationsCount(count);
        setToggleNotification(count > 0);
      } catch (error) {
        logger.error('Failed to fetch notification count:', error);
        setNotificationsCount(0);
        setToggleNotification(false);
      }
    };
  
    fetchNotificationsCount();
  }, [currentUser, reload]);

  /**
   * Effect to synchronize orders count (Pending orders) for real-time UI updates.
   * Matches the newly integrated order-counter feature.
   */
  useEffect(() => {
    if (!currentUser) return;

    const fetchOrdersCount = async () => {
      try {
        const { count } = await getOrders({
          skip: 0,
          limit: 1,
          status: 'pending'
        });
        setOrdersCount(count);
      } catch (error) {
        logger.error('Failed to fetch orders count:', error);
        setOrdersCount(0); // Graceful degradation
      }
    };

    fetchOrdersCount();
  }, [currentUser, reload]);

  /**
   * Helper to display temporary global alerts.
   */
  const showAlert = (message: string) => {
    setAlertMessage(message);
    setTimeout(() => {
      setAlertMessage(null);
    }, 5000);
  };

  /**
   * Handles user authentication via Pi Network Native SDK.
   */
  const registerUser = async () => {
    logger.info('Starting user registration via Pi SDK.');

    if (typeof window !== 'undefined' && window.Pi?.initialized) {
      try {
        setIsSigningInUser(true);
        const pioneerAuth: AuthResult = await window.Pi.authenticate([
          'username', 
          'payments', 
          'wallet_address'
        ], onIncompletePaymentFound);

        const res = await axiosClient.post(
          "/users/authenticate", 
          {}, 
          {
            headers: {
              Authorization: `Bearer ${pioneerAuth.accessToken}`,
            },
          }
        );

        if (res.status === 200) {
          setAuthToken(res.data?.token);
          setCurrentUser(res.data.user);
          setUserMembership(res.data.membership_class);
          logger.info('User authenticated successfully.');
        } else {
          setCurrentUser(null);
          logger.error('User authentication failed via Backend.');
        }
      } catch (error) {
        logger.error('Error during user registration:', error);
      } finally {
        setTimeout(() => setIsSigningInUser(false), 2500);
      }
    } else {
      logger.error('PI SDK failed to initialize or not found.');
    }
  };

  /**
   * Attempts to restore user session from backend; falls back to Pi Auth on failure.
   */
  const autoLoginUser = async () => {
    logger.info('Attempting auto-login using stored session.');
    try {
      setIsSigningInUser(true);
      const res = await axiosClient.get('/users/me');

      if (res.status === 200) {
        logger.info('Auto-login successful.');
        setCurrentUser(res.data.user);
        setUserMembership(res.data.membership_class);
      } else {
        logger.warn('Auto-login failed; fallback required.');
        setCurrentUser(null);
      }
    } catch (error) {
      logger.error('Auto login unresolved; switching to Pi SDK authentication flow.');
      await registerUser();
    } finally {
      setTimeout(() => setIsSigningInUser(false), 2500);
    }
  };

  /**
   * Injects Pi SDK script dynamically into the document.
   */
  const loadPiSdk = (): Promise<typeof window.Pi> => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('pi-sdk')) return resolve(window.Pi);
      const script = document.createElement('script');
      script.id = 'pi-sdk';
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.async = true;
      script.onload = () => resolve(window.Pi);
      script.onerror = () => reject(new Error('Failed to load Pi SDK script'));
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
