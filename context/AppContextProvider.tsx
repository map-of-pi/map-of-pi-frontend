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
};

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

  /* Pi SDK helper functions */
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

  /* Login helper functions */
  const autoLoginProcess = async (): Promise<boolean> => {
    try {
      const res = await axiosClient.get("/users/me");
      if (res.status === 200) {
        setCurrentUser(res.data.user);
        setUserMembership(res.data.membership_class);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const piSdkLoginProcess = async (): Promise<boolean> => {
    try {
      const Pi = await ensurePiSdkLoaded();
      const pioneerAuth: AuthResult = await Pi.authenticate(
        ["username", "payments", "wallet_address"],
        onIncompletePaymentFound
      );

      // Send accessToken to backend
      const res = await axiosClient.post(
        "/users/authenticate",
        {},
        {
          headers: { Authorization: `Bearer ${pioneerAuth.accessToken}` },
        }
      );

      setAuthToken(res.data?.token);
      setCurrentUser(res.data.user);
      setUserMembership(res.data.membership_class);
      return true;
    } catch (error: any) {
      if (isHardFail(error)) throw error; // 401/403 must break retry loop
      return false; // soft failures become retry'able
    }
  };

  const authenticateUser = async () => {
    if (isSigningInUser) return;

    setIsSigningInUser(true);

    try {
      // Process #1 : Attempt Auto-Login
      const autoLoggedIn = await autoLoginProcess();
      if (autoLoggedIn) {
        logger.info("Auto-login successful.");
        return;
      }

      // Process #2 : Fallback to Pi SDK login and registration
      for (let attempt = 0; attempt < MAX_LOGIN_RETRIES; attempt++) {
        try {
          const sdkLoggedIn = await piSdkLoginProcess();
          if (sdkLoggedIn) {
            logger.info("Pi SDK login successful.");
            return;
          }

          // Process #3. Continue retry logic for 'soft failures'
          // exponential backoff + jitter
          const backoff = BASE_DELAY_MS * Math.pow(3, attempt);
          const jitter = Math.random() * 1000;
          const delay = backoff + jitter;
        } catch (error: any) {
          if (isHardFail(error)) {
            logger.warn("401/403 Hard login failure. Stopping retries.");
            throw error;
          }
        }
      }

      // if we reach here, all attempts failed
      logger.error("Max retries reached. Stopping retries.");
      throw new Error("Login retries exhausted");
    } finally {
      setIsSigningInUser(false);
    }
  };

  useEffect(() => {
    logger.info('AppContextProvider mounted.');

    if (currentUser) return;
    
    // attempt to load and initialize Pi SDK in parallel
    ensurePiSdkLoaded()
      .then(Pi => {
        Pi.nativeFeaturesList().then((features: string | string[]) => {
          setAdsSupported(features.includes("ad_network"));
        })
      })
      .catch(err => logger.error('Pi SDK load/ init error:', err));

    authenticateUser();
  }, [currentUser]);

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
        notificationsCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;