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
import logger from '../logger.config.mjs';

const MAX_LOGIN_RETRIES = 3;
const BASE_DELAY_MS = 5000; // 5s → 15s → 45s

interface IAppContextProps {
  currentUser: IUser | null;
  setCurrentUser: React.Dispatch<SetStateAction<IUser | null>>;
  registerUser: () => void;
  autoLoginUser: () => void;
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
};

const initialState: IAppContextProps = {
  currentUser: null,
  setCurrentUser: () => {},
  registerUser: () => {},
  autoLoginUser: () => {},
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
  notificationsCount: 0
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

  const piSdkLoaded = useRef(false);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setTimeout(() => {
      setAlertMessage(null); // Clear alert after 5 seconds
    }, 5000);
  };

  const loginWithRetry = async (attempt = 0): Promise<void> => {
    try {
      await registerUser();
      return; // exit function upon successful registration
  
    } catch (error: any) {
      logger.warn(`Login attempt ${attempt + 1} failed:`, error);
  
      if (isHardFail(error)) {
        logger.warn("401/403 Hard login failure. Retry attempt not executed.");
        throw error;
      }
  
      if (attempt >= MAX_LOGIN_RETRIES) {
        logger.warn("Max retries reached. Stopping auto-login attempts..");
        throw error;
      }
  
      // exponential backoff + jitter
      const backoff = BASE_DELAY_MS * Math.pow(3, attempt);
      const jitter = Math.random() * 1000;
      const delay = backoff + jitter;
  
      logger.warn(`Retrying login in ${Math.round(delay)}ms..`);
  
      await sleep(delay);
      return loginWithRetry(attempt + 1);
    }
  };

  /* Register User via Pi SDK */
  const registerUser = async () => {
    logger.info('Starting user registration.');

    if (typeof window !== 'undefined' && window.Pi?.initialized) {
      try {
        setIsSigningInUser(true);
        const pioneerAuth: AuthResult = await window.Pi.authenticate([
          'username', 
          'payments', 
          'wallet_address'
        ], onIncompletePaymentFound);

        // Send accessToken to backend
        const res = await axiosClient.post(
          "/users/authenticate", 
          {}, // empty body
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
          logger.error('User authentication failed.');
        }
      } catch (error) {
        logger.error('Error during user registration:', error);
      } finally {
        setTimeout(() => setIsSigningInUser(false), 2500);
      }
    } else {
      logger.error('PI SDK failed to initialize.');
    }
  };

  /* Attempt Auto Login (fallback to Pi auth) */
  const autoLoginUser = async () => {
    logger.info('Attempting to auto-login user.');
    try {
      setIsSigningInUser(true);
      const res = await axiosClient.get('/users/me');

      if (res.status === 200) {
        logger.info('Auto-login successful.');
        setCurrentUser(res.data.user);
        setUserMembership(res.data.membership_class);
      } else {
        logger.warn('Auto-login failed.');
        setCurrentUser(null);
      }
    } catch (error) {
      logger.error('Auto login unresolved; attempting Pi SDK authentication:', error);
      await loginWithRetry();
    } finally {
      setTimeout(() => setIsSigningInUser(false), 2500);
    }
  };

  const loadPiSdk = (): Promise<typeof window.Pi> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.async = true;
      script.onload = () => resolve(window.Pi);
      script.onerror = () => reject(new Error('Failed to load Pi SDK'));
      document.head.appendChild(script);
    });
  };

  const ensurePiSdkLoaded = async () => {
    if (piSdkLoaded.current) {
      return window.Pi;
    }
    
    const Pi = await loadPiSdk();
    piSdkLoaded.current = true;

    Pi.init({
      version: '2.0',
      sandbox: process.env.NODE_ENV === 'development'
    });

    return Pi;
  };

  useEffect(() => {
    logger.info('AppContextProvider mounted.');

    if (isSigningInUser || currentUser) return;
    
    // attempt to load and initialize Pi SDK in parallel
    ensurePiSdkLoaded()
      .then(Pi => {
        Pi.nativeFeaturesList().then((features: string | string[]) => {
          setAdsSupported(features.includes("ad_network"));
        })
      })
      .catch(err => logger.error('Pi SDK load/ init error:', err));

    autoLoginUser();
  }, [isSigningInUser, currentUser]);

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

  return (
    <AppContext.Provider 
      value={{ 
        currentUser, 
        setCurrentUser, 
        registerUser, 
        autoLoginUser, 
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
        notificationsCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;